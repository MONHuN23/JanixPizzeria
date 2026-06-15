<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Pizza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlacedMail;
use App\Mail\OrderAcceptedMail;
use App\Mail\OrderDeclinedMail;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if($request->user() && $request->user()->is_admin) {
            $orders = Order::with(['user', 'pizzas', 'address'])->orderBy('created_at', 'desc')->get();
        } else {
            $orders = Order::where('user_id', $request->user()->id)
                ->with('pizzas')->get();
        }

        return response()->json([
            'status'=> true,
            'message' => 'Orders retrived succesfully',
            'data' => $orders
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user('sanctum');
        $isGuest = !$user;

        $now = \Carbon\Carbon::now('Europe/Budapest');
        $day = $now->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
        $time = $now->format('H:i');

        $isOpen = false;
        if ($day >= 2 && $day <= 6) { // Tue - Sat
            if ($time >= '11:00' && $time < '22:00') $isOpen = true;
        }

        if ($user && $user->is_admin) {
            $isOpen = true;
        }

        if (!$isOpen) {
            return response()->json([
                'status' => false,
                'message' => 'Sajnáljuk, éttermünk jelenleg zárva van. Rendelést csak nyitvatartási időben tudunk fogadni.',
            ], 422, ['Content-Type' => 'application/json']);
        }

        $rules = [
            'pizzas' => 'required|array|min:1',
            'pizzas.*.id' => 'required|integer|exists:pizzas,id',
            'pizzas.*.quantity' => 'required|integer|min:1',
            'note' => 'nullable|string|max:500',
        ];

        if ($isGuest) {
            $rules['guest_email'] = 'required|email|max:150';
            $rules['address.name'] = 'required|string|max:100';
            $rules['address.phone'] = 'required|string|max:20';
            $rules['address.city'] = 'required|string|max:100';
            $rules['address.streetandnum'] = 'required|string|max:255';
            $rules['address.postalcode'] = 'nullable|integer';
            $rules['address.floor'] = 'nullable|integer';
            $rules['address.door'] = 'nullable|integer';
        } else {
            // For logged in users, we can accept address_id OR a new_address
            // We'll keep it simple: if address_id exists, use it.
            $rules['address_id'] = 'required|integer|exists:addresses,id';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        if ($isGuest) {
            $address = \App\Models\Address::create([
                'user_id' => null,
                'name' => $request->input('address.name'),
                'phone' => $request->input('address.phone'),
                'postalcode' => $request->input('address.postalcode') ?? 3300,
                'city' => $request->input('address.city') ?? 'Eger',
                'streetandnum' => $request->input('address.streetandnum'),
                'floor' => $request->input('address.floor'),
                'door' => $request->input('address.door'),
            ]);
            $address_id = $address->id;
        } else {
            $address_id = $request->address_id;
        }

        $order = Order::create([
            'user_id' => $isGuest ? null : $user->id,
            'address_id' => $address_id,
            'guest_email' => $isGuest ? $request->guest_email : null,
            'note' => $request->note,
            'status' => 'pending',
        ]);

        foreach ($request->pizzas as $pizzaData) {
            $pizza = Pizza::find($pizzaData['id']);

            $order->pizzas()->attach($pizza->id, [
                'quantity' => $pizzaData['quantity'],
                'purchased_price' => $pizza->price,
            ]);
        }

        $order->load('pizzas', 'address');
        $email = $isGuest ? $request->guest_email : $user->email;
        if ($email) {
            Mail::to($email)->send(new OrderPlacedMail($order));
        }

        return response()->json([
            'status' => true,
            'message' => 'Order placed successfully',
            'data' => $order
        ], 201, ['Content-Type' => 'application/json']);
    }
    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $order = Order::with(['pizzas', 'address'])->find($id);

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Order not found'
            ], 404, ['Content-Type' => 'application/json']);
        }

        if (!$request->user()->is_admin && $order->user_id !== $request->user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action.'
            ], 403, ['Content-Type' => 'application/json']);
        }

        return response()->json([
            'status' => true,
            'message' => 'Order retrieved successfully',
            'data' => $order
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if(!$order) {
            return response()->json([
                'status' => false,
                'message' => 'This orde can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,processing,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $oldStatus = $order->status;

        $order->update([
            'status' => $request->status
        ]);

        if ($oldStatus !== $request->status) {
            $order->load(['user', 'address']);
            $email = $order->guest_email ?? $order->user?->email;
            if ($email) {
                if ($request->status === 'processing') {
                    Mail::to($email)->send(new OrderAcceptedMail($order));
                } elseif ($request->status === 'cancelled') {
                    Mail::to($email)->send(new OrderDeclinedMail($order));
                }
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Order status updated successfully',
            'data' => $order
        ], 200, ['Content-Type' => 'application/json']);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Order can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        if (!$request->user()->is_admin && $order->user_id !== $request->user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action.'
            ], 403, ['Content-Type' => 'application/json']);
        }

        $addressString = $order->address->name;
        $orderId = $order->id;

        $order->delete();

        return response()->json([
            'status' => true,
            'message' => "Order to the: {$addressString}, with an ID: {$orderId} deleted",
        ], 200, ['Content-Type' => 'application/json']);
    }
}
