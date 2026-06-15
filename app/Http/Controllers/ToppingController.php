<?php

namespace App\Http\Controllers;

use App\Models\Topping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ToppingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $toppings = Topping::all();

        return response()->json([
            'status' => true,
            'message' => 'Toppings retrieved successfully',
            'data' => $toppings
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|required|min:3|max:35',
            'price' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $topping = Topping::create([
            'name' => $request->name,
            'price' => $request->price
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Topping created successfully',
            'data' => $topping
        ], 201, ['Content-Type' => 'application/json']);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $topping = Topping::find($id);

        if (!$topping) {
            return response()->json([
                'status' => false,
                'message' => 'Topping not found'
            ], 404, ['Content-Type' => 'application/json']);
        }

        return response()->json([
            'status' => true,
            'message' => 'Topping retrieved successfully',
            'data' => $topping
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Topping $topping)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $topping = Topping::find($id);

        if(!$topping) {
            return response()->json([
                'status' => false,
                'message' => 'This topping can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|required|min:3|max:35',
            'price' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $topping->update([
            'name' => $request->name,
            'price' => $request->price
        ]);


        return response()->json([
            'status' => true,
            'message' => 'Topping updated successfully',
            'data' => $topping
        ], 200, ['Content-Type' => 'application/json']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $topping = Topping::find($id);

        if (!$topping) {
            return response()->json([
                'status' => false,
                'message' => 'Topping can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $topping->delete();

        return response()->json([
            'status' => true,
            'message' => "'{$topping->name}', (ID: {$topping->id}) Succesfully deleted",
        ], 200, ['Content-Type' => 'application/json']);
    }
}
