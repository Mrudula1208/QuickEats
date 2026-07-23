import { Injectable } from '@angular/core';
import { Delivery } from '../models/delivery.model';
@Injectable({
    providedIn:'root'
})
export class DeliveryService{
    private deliveries:Delivery[]=[];
    saveDelivery(delivery:Delivery):void{
        this.deliveries.push(delivery);
    }


getDeliveries():Delivery[]{
    return this.deliveries;
}
getDeliveryByOrderId(orderId:number):Delivery |undefined{
    return this.deliveries.find(delivery=>delivery.orderId===orderId)
}
}
// Go through every delivery in the deliveries array. Check whether the current delivery's orderId matches the orderId passed to this function. If a match is found, immediately return that delivery object.
// }}Easy Formula
// PaymentComponent

// creates

// ↓

// delivery

// (one object)

// ↓

// saveDelivery(delivery)

// ↓

// push()

// ↓

// deliveries[]

// (array)

// ↓

// Saved
// Remember this sentence:

// delivery is the object being passed. deliveries is the array where it is stored.

// So yes, your understanding is almost correct—the only correction is:

// ❌ "save in delivery then push"

// ✅ "The delivery object is already created. saveDelivery() receives that object and pushes it into the deliveries array."