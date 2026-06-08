<?php

namespace Database\Factories;

use App\Models\Pizza;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pizza>
 */
class PizzaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst(fake()->word()) . ' Pizza', 
            'description' => fake()->sentence(6),
            'price' => fake()->numberBetween(15, 45) * 100,
            'image' => null,
        ];
    }
}
