import { Injectable, signal } from '@angular/core';
// Import Injectable because this is an Angular Service.
// Import signal because reviews can change dynamically.

import { ReviewModel } from '../models/review.model';
// Import Review Model.
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
@Injectable({

providedIn:'root'
// Angular creates only one ReviewService.

})
export class ReviewService {
    private apiUrl = 'http://localhost:8080/reviews';
    constructor(private http: HttpClient) { }

    getReviews (): Observable<ReviewModel[]> {
        return this.http.get<ReviewModel[]>(this.apiUrl);
}

addReviews(review :ReviewModel): Observable<ReviewModel> {{
    // "Go to this URL, send this object, save it, and return the saved object."
    return this.http.post<ReviewModel>(this.apiUrl, review);
}
}
}