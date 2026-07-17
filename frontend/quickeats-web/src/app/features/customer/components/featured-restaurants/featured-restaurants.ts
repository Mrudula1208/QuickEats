import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../../../core/models/restaurant.model';
@Component({
  selector: 'app-featured-restaurants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-restaurants.html',
  styleUrl: './featured-restaurants.scss'
})
export class FeaturedRestaurantsComponent {
  @Input()
restaurants: Restaurant[] = [];
}