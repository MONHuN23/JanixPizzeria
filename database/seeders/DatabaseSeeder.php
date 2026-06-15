<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pizza;
use App\Models\Topping;
use App\Models\Order;
use App\Models\Address;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Főnök',
            'email' => 'admin@pizzeria.hu',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
        ]);

        $tesztElek = User::create([
            'name' => 'Teszt Elek',
            'email' => 'user@pizzeria.hu',
            'password' => Hash::make('user123'),
            'is_admin' => false,
        ]);
        
        Address::factory()->create([
            'user_id' => $tesztElek->id,
            'name' => 'Otthon',
            'postalcode' => 3300,
            'city' => 'Eger',
            'streetandnum' => 'Eszterházy tér 1.',
            'floor' => 3,
            'door' => 1
        ]);

        $toppings = Topping::factory(10)->create();

        $pizzas = Pizza::factory(15)->create();

        foreach ($pizzas as $pizza) {
            $randomToppings = $toppings->random(rand(2, 4))->pluck('id');
            $pizza->toppings()->attach($randomToppings);
        }

        User::factory(5)->create()->each(function ($user) {
            Address::factory(rand(1, 2))->create([
                'user_id' => $user->id
            ]);
        });

        $allPizzas = Pizza::all();

        // Csak olyan usereket keresünk, akiknek már fixen van címe
        $usersWithAddresses = User::has('addresses')->get();

        foreach ($usersWithAddresses as $user) {
            // Minden embernek generálunk 1-3 darab rendelést
            Order::factory(rand(1, 3))->create([
                'user_id' => $user->id,
                // Sorsolunk egyet a user SAJÁT címei közül
                'address_id' => $user->addresses->random()->id,
            ])->each(function ($order) use ($allPizzas) {
                
                // Sorsolunk 1-3 féle pizzát a kosárba
                $pizzasForOrder = $allPizzas->random(rand(1, 3));
                
                foreach ($pizzasForOrder as $pizza) {
                    // Hozzákötjük a rendeléshez a pivot adatokkal (darabszám, ár)
                    $order->pizzas()->attach($pizza->id, [
                        'quantity' => rand(1, 5),
                        'purchased_price' => $pizza->price,
                    ]);
                }
            });
        }
    }
}