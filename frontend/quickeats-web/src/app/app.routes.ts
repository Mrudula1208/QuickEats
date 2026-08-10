import { Routes } from '@angular/router';
import { Home } from './features/customer/home/home';
import { RestaurantDetailsComponent } from './features/customer/restaurant-details/restaurant-details';
import { CartComponent } from './features/customer/cart/cart';
import {CheckoutComponent} from './features/customer/checkout/checkout';
import { OrderHistoryComponent } from './features/customer/order-history/order-history';
import { OrderDetailsComponent } from './features/customer/order-details/order-details';
import { PaymentComponent } from './features/customer/payment/payment';
import { PaymentHistoryComponent } from './features/customer/payment-history/payment-history';
import { DeliveryTrackingComponent } from './features/customer/delivery-tracking/delivery-tracking';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AdminRestaurants } from './features/admin/admin-restaurants/admin-restaurants';
import { AdminEditRestaurant } from './features/admin/admin-edit-restaurant/admin-edit-restaurant';
import { AdminOrderDetails } from './features/admin/admin-order-details/admin-order-details';
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
  component: CartComponent,
  canActivate: [authGuard]
},

{
  path: 'checkout',
  component: CheckoutComponent,
  canActivate: [authGuard]
},

{
  path: 'orders',
  component: OrderHistoryComponent,
  canActivate: [authGuard]
},

{
  path: 'orders/:id',
  component: OrderDetailsComponent,
  canActivate: [authGuard]
},

{
  path: 'payment',
  component: PaymentComponent,
  canActivate: [authGuard]
},

{
  path: 'payments',
  component: PaymentHistoryComponent,
  canActivate: [authGuard]
},

{
  path: 'delivery/:orderId',
  component: DeliveryTrackingComponent,
  canActivate: [authGuard]
},

{
  path: 'register',
  component: RegisterComponent
},

{
  path: 'login',
  component: LoginComponent
},
{
    path: 'dashboard',
    loadComponent: () =>
        import('./features/customer/customer-dashboard/customer-dashboard')
            .then(m => m.CustomerDashboardComponent)
},{
    path: 'profile',
    loadComponent: () =>
        import('./features/customer/profile/profile')
        .then(m => m.ProfileComponent)
},
        {
  path: 'admin/restaurants',
  component: AdminRestaurants,
  canActivate: [authGuard]
},{
path:'admin/edit-restaurant/:id',
component:AdminEditRestaurant,
canActivate:[authGuard]
},{
  path: 'admin/order-details/:id',
  component: AdminOrderDetails
}
];