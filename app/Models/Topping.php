<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Topping extends Model
{
    /** @use HasFactory<\Database\Factories\ToppingFactory> */
    use HasFactory;

    protected $table = 'toppings';
    protected $primaryKey = 'id';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'name',
    ];

    public function pizzas()
    {
        return $this->belongsToMany(Pizza::class)->withTimestamps();
    }
}
