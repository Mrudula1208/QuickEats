import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

private apiUrl = 'https://localhost:7278/api/Restaurant';
  constructor(private http: HttpClient) { }

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  // Owner: get my own restaurants.
  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/mine`);
  }
  addRestaurant(

  restaurant: Restaurant

): Observable<Restaurant> {

  // Send Restaurant.
  return this.http.post<Restaurant>(

    this.apiUrl,

    restaurant

  );

}
  deleteRestaurant(id: number): Observable<any> {
    return this .http.delete(`${this.apiUrl}/${id}`);
  };
 updateRestaurant(

  restaurant: Restaurant

): Observable<Restaurant> {

  // Go to Backend.
  // Update Restaurant.
  return this.http.put<Restaurant>(

    `${this.apiUrl}/${restaurant.id}`,

    restaurant

  );

}

// Toggle restaurant active/inactive status.
toggleStatus(id: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/${id}/toggle-status`, {});
}
  }

