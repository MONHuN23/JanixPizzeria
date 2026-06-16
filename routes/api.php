<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\PizzaController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ToppingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/pizzas', [PizzaController::class, 'index']);
Route::get('/pizzas/{id}', [PizzaController::class, 'show']);
Route::get('/toppings', [ToppingController::class, 'index']);

// For logged in users w token
Route::middleware('auth:sanctum')->group(function () {
    
    // --- ADMIN ---
    Route::middleware('admin')->group(function () {
        // Pizza CRUD
        Route::post('/pizzas', [PizzaController::class, 'store']);
        Route::put('/pizzas/{id}', [PizzaController::class, 'update']);
        Route::delete('/pizzas/{id}', [PizzaController::class, 'destroy']);
        
        // TOPPING CRUD CRUD 
        Route::post('/toppings', [ToppingController::class, 'store']);
        Route::put('/toppings/{id}', [ToppingController::class, 'update']);
        Route::delete('/toppings/{id}', [ToppingController::class, 'destroy']);
        
        // Rendelés admin státuszfrissítés
        Route::put('/orders/{id}', [OrderController::class, 'update']); 
    });
    
    Route::get('/pizzas/{id}/image', [PizzaController::class, 'downloadImage']);
    
    // --- UER ZONE ---
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // ADDRESS CRUD (only your own)
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::get('/addresses/{id}', [AddressController::class, 'show']);
    Route::put('/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [AddressController::class, 'destroy']);

    // ORDER CRUD (only your own except admins can see/destroy your order)
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
});