<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'id';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'user_id',
        'address_id',
        'guest_email',
        'note',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function pizzas()
    {
        return $this->belongsToMany(Pizza::class)
                    ->withPivot('quantity', 'purchased_price')
                    ->withTimestamps();
    }
}
