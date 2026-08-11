import { Injectable } from '@angular/core';
// Injectable
// Tells Angular this is a Service
// that Angular can create automatically.

import { HttpClient } from '@angular/common/http';
// HttpClient
// Used to send HTTP requests to ASP.NET Core.

import { Observable } from 'rxjs';
// Observable
// Represents the response that comes later
// from the Backend.

import { Review } from '../models/review.model';
// Review
// Defines the structure of one Review.


@Injectable({
  // providedIn
  // Tells Angular where the Service is available.

  // 'root'
  // Creates one shared instance
  // of ReviewService.

  providedIn: 'root'
})


export class ReviewService {

  // Backend Review API URL.
  //
  // private
  // Means this variable is used only
  // inside this Service.

  private apiUrl =
    'https://localhost:7278/api/Review';


  constructor(

    // http
    // Variable name.

    // HttpClient
    // Type of the variable.

    private http: HttpClient

  ) { }


  // Get all Reviews.
  getReviews(): Observable<Review[]> {

    // GET
    // Reads Reviews from Backend.

    return this.http.get<Review[]>(
      this.apiUrl
    );

  }


  // Delete one Review.
  deleteReview(

    // ID of Review to delete.
    reviewId: number

  ): Observable<any> {

    // DELETE
    // Removes Review from Backend.

    return this.http.delete(

      `${this.apiUrl}/${reviewId}`

    );

  }

}