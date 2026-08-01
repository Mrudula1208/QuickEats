import { Injectable, signal } from '@angular/core';
import { Delivery } from '../models/delivery.model';
export class DeliveryService {
  deliveryInformation =signal<Delivery | null>(null);

  constructor() {}
  updateDelivery (
    latestDelivery: Delivery):void{
      this.deliveryInformation.set(latestDelivery);
    }
    getDelivery ():Delivery |null{
      return this.deliveryInformation();
    }
    clearDelivery ():void{
      this.deliveryInformation.set(null);
}}