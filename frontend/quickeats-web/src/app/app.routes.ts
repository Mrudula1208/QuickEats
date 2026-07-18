import { Routes } from '@angular/router';
import {Home} from './features/customer/home/home';
import { RestaurantDetailsComponent } from './features/customer/restaurant-details/restaurant-details';
export const routes: Routes = [
  {
    path: '',
    component: Home
  },{
    path: 'restaurant/:id',
    component: RestaurantDetailsComponent
  }
];