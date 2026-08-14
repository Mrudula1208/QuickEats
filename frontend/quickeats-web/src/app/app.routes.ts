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
import { OwnerDashboardComponent } from './features/owner/owner-dashboard/owner-dashboard';
import { OwnerRestaurantsComponent } from './features/owner/owner-restaurants/owner-restaurants';
import { OwnerRestaurantFormComponent } from './features/owner/owner-restaurant-form/owner-restaurant-form';
import { OwnerMenuComponent } from './features/owner/owner-menu/owner-menu';
import { OwnerMenuItemFormComponent } from './features/owner/owner-menu-item-form/owner-menu-item-form';
import { OwnerOrdersComponent } from './features/owner/owner-orders/owner-orders';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { ownerGuard } from './guards/owner.guard';
import { deliveryPartnerGuard } from './guards/delivery-partner.guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AdminRestaurants } from './features/admin/admin-restaurants/admin-restaurants';
import { AdminEditRestaurant } from './features/admin/admin-edit-restaurant/admin-edit-restaurant';
import { AdminOrderDetails } from './features/admin/admin-order-details/admin-order-details';
import { AdminPaymentDetails } from './features/admin/admin-payment-details/admin-payment-details';
import { AdminDashboard } from './features/admin/admin-dashboard/admin-dashboard';
import { AdminAddRestaurant } from './features/admin/admin-add-restaurant/admin-add-restaurant';
import { AdminMenu } from './features/admin/admin-menu/admin-menu';
import { AdminAddMenu } from './features/admin/admin-add-menu/admin-add-menu';
import { AdminEditMenu } from './features/admin/admin-edit-menu/admin-edit-menu';
import { AdminOrders } from './features/admin/admin-order/admin-order';
import { AdminPayment } from './features/admin/admin-payment/admin-payment';
import { AdminDelivery } from './features/admin/admin-delivery/admin-delivery';
import { AdminReviews } from './features/admin/admin-reviews/admin-reviews';
import { DeliveryPartnerComponent } from './features/delivery-partner/delivery-partner';
import { WishlistComponent } from './features/customer/wishlist/wishlist';
import { FavoritesComponent } from './features/customer/favorites/favorites';
import { CouponsComponent } from './features/customer/coupons/coupons';
import { NotificationsComponent } from './features/customer/notifications/notifications';
import { SavedAddressComponent } from './features/customer/saved-address/saved-address';
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
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [authGuard]
},
{
    path: 'favorites',
    component: FavoritesComponent,
    canActivate: [authGuard]
},
{
    path: 'coupons',
    component: CouponsComponent,
    canActivate: [authGuard]
},
{
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard]
},
{
    path: 'saved-address',
    component: SavedAddressComponent,
    canActivate: [authGuard]
},
        {
  path: 'admin/dashboard',
  component: AdminDashboard,
  canActivate: [adminGuard]
},{
  path: 'admin/restaurants',
  component: AdminRestaurants,
  canActivate: [adminGuard]
},{
  path: 'admin/add-restaurant',
  component: AdminAddRestaurant,
  canActivate: [adminGuard]
},{
path:'admin/edit-restaurant/:id',
 component:AdminEditRestaurant,
 canActivate:[adminGuard]
},{
  path: 'admin/menu',
  component: AdminMenu,
  canActivate: [adminGuard]
},{
  path: 'admin/add-menu',
  component: AdminAddMenu,
  canActivate: [adminGuard]
},{
  path: 'admin/edit-menu/:id',
  component: AdminEditMenu,
  canActivate: [adminGuard]
},{
  path: 'admin/order',
  component: AdminOrders,
  canActivate: [adminGuard]
},{
  path: 'admin/order-details/:id',
  component: AdminOrderDetails,
  canActivate: [adminGuard]
},
{ path: 'admin/payment-details/:id',

  // component
  // Opens AdminPaymentDetails
  // when this URL is visited.
  component: AdminPaymentDetails,
  canActivate: [adminGuard]
},{
  path: 'admin/payment',
  component: AdminPayment,
  canActivate: [adminGuard]
},{
  path: 'admin/delivery',
  component: AdminDelivery,
  canActivate: [adminGuard]
},{
  path: 'admin/reviews',
  component: AdminReviews,
  canActivate: [adminGuard]
},
{
  path: 'owner',
  component: OwnerDashboardComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/restaurants',
  component: OwnerRestaurantsComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/restaurants/new',
  component: OwnerRestaurantFormComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/restaurants/:id/edit',
  component: OwnerRestaurantFormComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/menu/:id',
  component: OwnerMenuComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/menu/:restaurantId/new',
  component: OwnerMenuItemFormComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/menu/:restaurantId/:itemId/edit',
  component: OwnerMenuItemFormComponent,
  canActivate: [ownerGuard]
},
{
  path: 'owner/orders',
  component: OwnerOrdersComponent,
  canActivate: [ownerGuard]
},
{
  path: 'delivery-partner',
  component: DeliveryPartnerComponent,
  canActivate: [deliveryPartnerGuard]
}
];