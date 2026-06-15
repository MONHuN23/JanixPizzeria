<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)->get();

        return response()->json([
            'status' => true,
            'message' => 'Address retrived succesfully',
            'data' => $addresses
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'postalcode' => 'nullable|integer',
            'city' => 'nullable|string|max:100',
            'streetandnum' => 'required|string|max:150',
            'floor' => 'nullable|integer',
            'door' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $address = Address::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'phone' => $request->phone,
            'postalcode' => $request->postalcode ?? 3300,
            'city' => $request->city ?? 'Eger',
            'streetandnum' => $request->streetandnum,
            'floor' => $request->floor,
            'door' => $request->door,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Address placed successfully',
            'data' => $address
        ], 201, ['Content-Type' => 'application/json']);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $address = Address::find($id);

        if (!$address) {
            return response()->json([
                'status' => false,
                'message' => 'Address not found'
            ], 404, ['Content-Type' => 'application/json']);
        }

        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action.'
            ], 403, ['Content-Type' => 'application/json']);
        }

        return response()->json([
            'status' => true,
            'message' => 'Address retrieved successfully',
            'data' => $address
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Address $address)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $address = Address::find($id);

        if(!$address) {
            return response()->json([
                'status' => false,
                'message' => 'This address can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'postalcode' => 'nullable|integer',
            'city' => 'nullable|string|max:100',
            'streetandnum' => 'required|string|max:150',
            'floor' => 'nullable|integer',
            'door' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized action.'
            ], 403, ['Content-Type' => 'application/json']);
        }

        $address->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'postalcode' => $request->postalcode ?? 3300,
            'city' => $request->city ?? 'Eger',
            'streetandnum' => $request->streetandnum,
            'floor' => $request->floor,
            'door' => $request->door,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Address status updated successfully',
            'data' => $address
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $address = Address::find($id);

        if (!$address) {
            return response()->json([
                'status' => false,
                'message' => 'Address can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $address->delete();

        return response()->json([
            'status' => true,
            'message' => "'{$address->name}', (ID: {$address->id}) Succesfully deleted",
        ], 200, ['Content-Type' => 'application/json']);
    }
    
}
