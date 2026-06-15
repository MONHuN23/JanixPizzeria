<!DOCTYPE html>
<html>
<head>
    <title>Rendelés Visszaigazolás</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h1 style="color: #FF2D20;">Kedves {{ $order->user ? $order->user->name : ($order->address->name ?? 'Vásárló') }}!</h1>
        <p>Köszönjük a rendelésedet! Sikeresen rögzítettük a rendszerünkben (Rendelés azonosító: <strong>#{{ $order->id }}</strong>).</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Rendelt Tételek:</h3>
        <ul>
            @foreach($order->pizzas as $pizza)
                <li>{{ $pizza->pivot->quantity }}x {{ $pizza->name }} - ${{ number_format($pizza->pivot->purchased_price * $pizza->pivot->quantity, 2) }}</li>
            @endforeach
        </ul>
        
        <p><strong>Végösszeg: ${{ number_format($order->pizzas->sum(function($p) { return $p->pivot->purchased_price * $p->pivot->quantity; }), 2) }}</strong></p>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 20px;">Szállítási Adatok:</h3>
        <p>
            Cím: {{ $order->address->postalcode }} {{ $order->address->city }}, {{ $order->address->streetandnum }}<br>
            @if($order->address->floor) Emelet: {{ $order->address->floor }}<br> @endif
            @if($order->address->door) Ajtó: {{ $order->address->door }}<br> @endif
            Telefon: {{ $order->address->phone }}
        </p>

        @if($order->note)
            <div style="background-color: #fff9c4; padding: 10px; border-left: 4px solid #fbc02d; margin-top: 15px;">
                <strong>Megjegyzés:</strong> {{ $order->note }}
            </div>
        @endif
        
        <br>
        <p>A futárunk hamarosan indul a friss, forró pizzáddal!</p>
        <p>Jó étvágyat kíván,<br>A Janix Pizzéria Csapata</p>
    </div>
</body>
</html>
