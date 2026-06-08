<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pizza extends Model
{
    /** @use HasFactory<\Database\Factories\PizzaFactory> */
    use HasFactory;

    protected $table = 'pizzas';
    protected $primaryKey = 'id';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
    ];

    public function orders()
    {
        return $this->belongsToMany(Order::class)
                    ->withPivot('quantity', 'purchased_price')
                    ->withTimestamps();
    }

    public function toppings()
    {
        return $this->belongsToMany(Topping::class)->withTimestamps();
    }
}
