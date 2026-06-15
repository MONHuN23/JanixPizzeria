<!DOCTYPE html>
<html>
<head>
    <title>Rendelés Elfogadva</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-w-xl mx-auto p-6 bg-white rounded shadow border-t-4 border-green-500">
        <h1 style="color: #4CAF50;">Kedves {{ $order->user ? $order->user->name : ($order->address->name ?? 'Vásárló') }}!</h1>
        <p>Jó hírünk van! A(z) <strong>#{{ $order->id }}</strong> azonosítójú rendelésedet éttermünk feldolgozta, és a konyha megkezdte a pizzák elkészítését.</p>
        <p>Hamarosan átadjuk a futárnak, aki egyenesen hozzád indul vele!</p>
        <br>
        <p>Jó étvágyat kíván,<br>A Janix Pizzéria Csapata</p>
    </div>
</body>
</html>
