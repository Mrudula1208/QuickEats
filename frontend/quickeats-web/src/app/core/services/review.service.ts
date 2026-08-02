import { Injectable, signal } from '@angular/core';
// Import Injectable because this is an Angular Service.
// Import signal because reviews can change dynamically.

import { ReviewModel } from '../models/review.model';
// Import Review Model.

@Injectable({

providedIn:'root'
// Angular creates only one ReviewService.

})

export class ReviewService{

// ======================================
//
// EXECUTION FLOW
//
// 1 Angular creates ReviewService.
//
// 2 Reviews are stored.
//
// 3 Review Component asks reviews.
//
// 4 Service returns reviews.
//
// 5 HTML displays reviews.
//
// ======================================

reviews=

signal<ReviewModel[]>([

{

reviewId:1,

customerName:'Rahul',

restaurantName:'Pizza Hub',

rating:5,

reviewMessage:'Amazing food and fast delivery.',

reviewDate:new Date()

},

{

reviewId:2,

customerName:'Sneha',

restaurantName:'Burger Point',

rating:4,

reviewMessage:'Food was tasty.',

reviewDate:new Date()

},

{

reviewId:3,

customerName:'Amit',

restaurantName:'Chinese Corner',

rating:5,

reviewMessage:'Highly Recommended.',

reviewDate:new Date()

}

]);

// Store all reviews.

constructor(){

}

// Return all reviews.
getReviews():ReviewModel[]{

return this.reviews();

}

// Add new review.
addReview(

newReview:ReviewModel

):void{

const allReviews=[

...this.reviews()

];

allReviews.push(

newReview

);

this.reviews.set(

allReviews

);

console.log("Review Added");

console.log(this.reviews());

}

}