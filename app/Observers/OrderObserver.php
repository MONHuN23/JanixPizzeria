<?php

namespace App\Observers;

use App\Models\Order;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderPlacedMail;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        // Picit várni kell a relációk (pizzák) csatolására, így érdemes a load-ot hívni
        // Viszont amikor az Observer triggerelődik (Order::create), a pizzák MÉG nincsenek csatolva!
        // Ezért a Controllerben lévő sync() / attach() után kellene kiküldeni.
        // Mivel az attach() a controllerben történik az Order létrejötte UTÁN, itt még nem látjuk a pizzákat.
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order): void
    {
        //
    }
}
