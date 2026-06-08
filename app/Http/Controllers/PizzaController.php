<?php

namespace App\Http\Controllers;

use App\Models\Pizza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PizzaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $pizzas = Pizza::with('toppings')->get();

        return response()->json([
            'status' => true,
            'message' => 'Pizzas retrieved successfully',
            'data' => $pizzas
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
            'name' => 'required|string|max:150',
            'description' => 'required|string|max:500',
            'price' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'toppings' => 'nullable|array',
            'toppings.*' => 'integer|exists:toppings,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('pizzas', 'public');
            $imagePath = Storage::url($path);
        }

        $pizza = Pizza::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'image' => $imagePath,
        ]);

        if ($request->has('toppings')) {
            $pizza->toppings()->attach($request->toppings);
        }

        $pizza->load('toppings');

        return response()->json([
            'status' => true,
            'message' => 'Pizza created successfully',
            'data' => $pizza
        ], 201, ['Content-Type' => 'application/json']);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $pizza = Pizza::with('toppings')->find($id);

        if (!$pizza) {
            return response()->json([
                'status' => false,
                'message' => 'Pizza not found'
            ], 404, ['Content-Type' => 'application/json']);
        }

        return response()->json([
            'status' => true,
            'message' => 'Pizza retrieved successfully',
            'data' => $pizza
        ], 200, ['Content-Type' => 'application/json']);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pizza $pizza)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $pizza = Pizza::find($id);

        if(!$pizza) {
            return response()->json([
                'status' => false,
                'message' => 'This pizza can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:150',
            'description' => 'string|max:500',
            'price' => 'integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'toppings' => 'nullable|array',
            'toppings.*' => 'integer|exists:toppings,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('pizzas', 'public');
            $pizza->image = \Illuminate\Support\Facades\Storage::url($path);
        }

        $pizzaName = $pizza->name;

        $pizza->update($request->only(['name', 'description', 'price']));

        if ($request->has('toppings')) {
            $pizza->toppings()->sync($request->toppings);
        }   

        $pizza->load('toppings');

        return response()->json([
            'status' => true,
            'message' => "{$pizzaName} pizza updated successfully",
            'data' => $pizza
        ], 200, ['Content-Type' => 'application/json']);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $pizza = Pizza::find($id);

        if (!$pizza) {
            return response()->json([
                'status' => false,
                'message' => 'Pizza can not be found',
            ], 404, ['Content-Type' => 'application/json']);
        }

        $pizza->delete();

        return response()->json([
            'status' => true,
            'message' => "'{$pizza->name}', (ID: {$pizza->id}) Succesfully deleted",
        ], 200, ['Content-Type' => 'application/json']);
    }


    public function downloadImage($id)
    {
        $pizza = Pizza::find($id);

        if (!$pizza || !$pizza->image) {
            return response()->json([
                'status' => false,
                'message' => 'Pizza or image not found'
                ], 404, ['Content-Type' => 'application/json']
            );
        }

        $path = str_replace('/storage/', '', $pizza->image);

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
            return response()->json([
                'status' => false,
                'message' => 'File does not exist on server'
            ], 404, ['Content-Type' => 'application/json']);
        }

        $fullPath = storage_path('app/public/' . $path);
            
        return response()->download($fullPath);
    }
}
