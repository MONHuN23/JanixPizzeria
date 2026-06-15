<?php

namespace Database\Factories;

use App\Models\Address;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Address>
 */
class AddressFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'postalcode' => $this->faker->numberBetween(1000, 9999),
            'city' => $this->faker->city(),
            'streetandnum' => $this->faker->streetAddress(),
            'floor' => $this->faker->numberBetween(1, 10),
            'door' => $this->faker->numberBetween(1, 10),
        ];
    }
}
