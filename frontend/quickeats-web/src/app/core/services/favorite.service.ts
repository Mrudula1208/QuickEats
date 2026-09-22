import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FavoriteModel } from '../models/favorite.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private apiUrl = `${environment.apiUrl}/Favorite`;

  constructor(private http: HttpClient) { }

  // Return all favorites of the logged-in customer.
  getFavorites(): Observable<FavoriteModel[]> {
    return this.http.get<FavoriteModel[]>(this.apiUrl);
  }

  // Add restaurant into favorites.
  addFavorite(dto: { restaurantId: number } | FavoriteModel): Observable<FavoriteModel> {
    return this.http.post<FavoriteModel>(
      this.apiUrl,
      { restaurantId: dto.restaurantId }
    );
  }

  // Remove restaurant from favorites.
  removeFavorite(favoriteId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${favoriteId}`);
  }

}
