import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-featured-restaurants',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './featured-restaurants.html',
  styleUrl: './featured-restaurants.scss'
})
export class FeaturedRestaurantsComponent {
  @Input()
restaurants: Restaurant[] = [];
}