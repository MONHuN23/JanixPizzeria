<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:200',
            'email' =>'required|string|email|max:70|unique:users',
            'password' => 'required|string|min:6'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Please enter valid data',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'User created succesfully',
            'data' => $user
        ], 201, ['Content-Type' => 'application/json']);
    }

    public function login(Request $request) {
        $validator = Validator::make($request->all(), [
            'email' =>'required|string|email',
            'password' => 'required|string'
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422, ['Content-Type' => 'application/json']);
        }

        $user = User::where('email', $request->email)->first();

        if(!$user || !Hash::check($request->password, $user->password)) {
             return response()->json([
                'status' => false,
                'message' => 'Invalid email or password',
            ], 401, ['Content-Type' => 'application/json']);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ], 200, ['Content-Type' => 'application/json']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Successfully logged out. Token destroyed.'
        ], 200, ['Content-Type' => 'application/json']);
    }
}