import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private apiUrl = `${environment.apiUrl}/Restaurant`;

  constructor(private http: HttpClient) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  // Featured restaurants for the Home page (separate backend query).
  getFeaturedRestaurants(count: number = 6): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/featured`, {
      params: { count }
    });
  }

  // Smart Discovery: Recommended restaurants for logged-in customer or popularity-based fallback.
  getRecommendedRestaurants(count: number = 6): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/recommended`, {
      params: { count }
    });
  }

  // Active restaurants near the given coordinates, sorted nearest first.
  getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    count: number = 4
  ): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/nearby`, {
      params: {
        latitude,
        longitude,
        radiusKm,
        count
      }
    });
  }

  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  // Owner: get my own restaurants.
  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/mine`);
  }

  addRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.apiUrl, restaurant);
  }

  deleteRestaurant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateRestaurant(restaurant: Restaurant): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/${restaurant.id}`, restaurant);
  }

  // Toggle restaurant active/inactive status.
  toggleStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
