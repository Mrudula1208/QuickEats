import { Injectable, signal } from '@angular/core';
// Import Injectable because this is an Angular Service.
// Import signal because notifications change live.

import { NotificationModel } from '../models/notification.model';
// Import Notification Model.

@Injectable({

providedIn:'root'
// Angular creates only one NotificationService.

})

export class NotificationService{

// ======================================
//
// EXECUTION FLOW
//
// 1 Constructor executes.
//
// 2 Notifications are stored.
//
// 3 Component asks notifications.
//
// 4 Service returns notifications.
//
// 5 HTML displays notifications.
//
// ======================================

notifications=

signal<NotificationModel[]>([

{

notificationId:1,

title:'Order Confirmed',

message:'Your order has been placed successfully.',

notificationDate:new Date(),

isRead:false

},

{

notificationId:2,

title:'Order Preparing',

message:'Restaurant started preparing your food.',

notificationDate:new Date(),

isRead:false

},

{

notificationId:3,

title:'Delivery Partner Assigned',

message:'Rahul Sharma is coming to deliver your order.',

notificationDate:new Date(),

isRead:false

}

]);

// signal<NotificationModel[]>
//
// Means:
//
// Store multiple notifications.
//
// Later these notifications
// will come from Backend.

constructor(){

}
// Constructor executes automatically.

getNotifications():NotificationModel[]{

// Returns all notifications.

return this.notifications();

}

markAsRead(

notificationId:number

):void{

// notificationId:number
//
// Receive selected notification id.

const allNotifications=[

...this.notifications()

];

// Copy signal array.

const selectedNotification=

allNotifications.find(

notification=>

notification.notificationId===notificationId

);

// Search notification.

if(selectedNotification){

selectedNotification.isRead=true;

}

// Update signal.

this.notifications.set(

allNotifications

);

}

}