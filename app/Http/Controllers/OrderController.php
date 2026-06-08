<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Pizza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if($request->user() && $request->user()->is_admin) {
            $orders = Order::with(['user', 'pizzas'])->get();
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
        $validator = Validator::make($request->all(), [
            'address_id' => 'required|integer|exists:addresses,id',
            'pizzas' => 'required|array|min:1',
            'pizzas.*.id' => 'required|integer|exists:pizzas,id',
            'pizzas.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'address_id' => $request->address_id,
            'status' => 'pending',
        ]);

        foreach ($request->pizzas as $pizzaData) {
            $pizza = Pizza::find($pizzaData['id']);

            $order->pizzas()->attach($pizza->id, [
                'quantity' => $pizzaData['quantity'],
                'purchased_price' => $pizza->price,
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Order placed successfully',
            'data' => $order->load('pizzas')
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

        $order->update([
            'status' => $request->status
        ]);

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

        $addressString = $order->address->address;
        $orderId = $order->id;

        $order->delete();

        return response()->json([
            'status' => true,
            'message' => "Order to the: {$addressString}, with an ID: {$orderId} deleted",
        ], 200, ['Content-Type' => 'application/json']);
    }
}
