<!DOCTYPE html>
<html>
<head>
    <title>Rendelés Elutasítva</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-w-xl mx-auto p-6 bg-white rounded shadow border-t-4 border-red-500">
        <h1 style="color: #FF2D20;">Kedves {{ $order->user ? $order->user->name : ($order->address->name ?? 'Vásárló') }}!</h1>
        <p>Sajnálattal értesítünk, hogy a(z) <strong>#{{ $order->id }}</strong> azonosítójú rendelésedet éttermünk jelenleg nem tudja teljesíteni, ezért az elutasításra került.</p>
        <p>Ennek oka lehet hirtelen alapanyaghiány vagy megnövekedett forgalom miatti kapacitáshiány. Kérjük, próbáld újra később!</p>
        <p>Elnézést kérünk az esetleges kellemetlenségekért!</p>
        <br>
        <p>Üdvözlettel,<br>A Janix Pizzéria Csapata</p>
    </div>
</body>
</html>
