import { Injectable, signal } from '@angular/core';
// Injectable creates Angular Service.
// signal stores live Favorite data.

// Import Favorite Model./ Backend Caller.
// Calls ASP.NET Core APIs.
import { HttpClient } from '@angular/common/http';

// Wait for Backend.
// Receives API response later.
import { Observable } from 'rxjs';

// Favorite Structure.
// Defines one Favorite object.
import { FavoriteModel } from '../models/favorite.model';

@Injectable({

providedIn:'root'

})

export class FavoriteService{

// Store all favorite restaurants.
  private apiUrl = 'https://localhost:7278/api/Favorite';


constructor(private http: HttpClient) { }



// Return all favorites.
getFavorites():Observable<FavoriteModel[]>{

return this.http.get<FavoriteModel[]>(this.apiUrl);

}

// Add restaurant into favorites.
addFavorite(

favorite:FavoriteModel):Observable<FavoriteModel> {

   // Go to Backend.
    // Save Favorite.
    return this.http.post<FavoriteModel>(
      this.apiUrl,
      favorite
    );

  }

}
