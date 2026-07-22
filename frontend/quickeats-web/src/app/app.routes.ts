import { Routes } from '@angular/router';
import { Home } from './features/customer/home/home';
import { RestaurantDetailsComponent } from './features/customer/restaurant-details/restaurant-details';
import { CartComponent } from './features/customer/cart/cart';
import {CheckoutComponent} from './features/customer/checkout/checkout';
import { OrderHistoryComponent } from './features/customer/order-history/order-history';
import { OrderDetailsComponent } from './features/customer/order-details/order-details';
import { PaymentComponent } from './features/customer/payment/payment';
import { PaymentHistoryComponent } from './features/customer/payment-history/payment-history';


export const routes: Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'restaurant/:id',
    component: RestaurantDetailsComponent
  },

  {
    path: 'cart',
    component: CartComponent
  },
  {
    path :'checkout',
    component:CheckoutComponent

  },
 {
  path: 'orders',
  component: OrderHistoryComponent
}
,{
    path: 'orders/:id',
    component: OrderDetailsComponent
},{
  path:'payment',
  component:PaymentComponent
},{
    path:'payments',
    component:PaymentHistoryComponent
}
];