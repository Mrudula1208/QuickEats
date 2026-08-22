import { Injectable, signal } from '@angular/core';
// 1ï¸âƒ£ Executes First.
//
// Injectable
// Means Angular can create this service.
//
// signal
// Stores live data.
// Whenever signal changes,
// Angular automatically refreshes UI.

import { ProfileModel } from '../models/profile.model';
// 2ï¸âƒ£ Import ProfileModel.
// We need this because
// service stores ProfileModel object.

@Injectable({

    providedIn: 'root'

    // Angular creates only ONE object
    // of this service for
    // entire application.

})

export class ProfileService {

    // =====================================================
    // EXECUTION FLOW
    // =====================================================
    //
    // 1ï¸âƒ£ Angular creates ProfileService.
    //
    // 2ï¸âƒ£ profileData signal is created.
    //
    // 3ï¸âƒ£ Component calls getProfile().
    //
    // 4ï¸âƒ£ HTML displays profile.
    //
    // =====================================================

    profileData = signal<ProfileModel>({

        fullName: "Mrudula More",

        email: "mrudula@gmail.com",

        phoneNumber: "9876543210",

        gender: "Female",

        dateOfBirth: "18-05-2004",

        city: "Mumbai",

        state: "Maharashtra",

        profileImage:
        "https://i.pravatar.cc/200",

        rewardPoints: 245

    });

    // signal<ProfileModel>
    //
    // Means:
    //
    // signal stores live object.
    //
    // ProfileModel tells TypeScript
    // structure of object.

    constructor() {

    }

    getProfile(): ProfileModel {

        // (): ProfileModel
        //
        // Means this method
        // returns ProfileModel object.

        return this.profileData();

    }

    updateProfile(

        latestProfile: ProfileModel

    ): void {

        // latestProfile: ProfileModel
        //
        // Means input parameter
        // must follow ProfileModel.

        // ): void
        //
        // Means returns nothing.

        this.profileData.set(

            latestProfile

        );



    }

}

/*

WHY DO WE WRITE THIS FILE?

This service manages customer profile.

Instead of storing profile
inside component,

we store it here.

Flow

Component

â†“

Profile Service

â†“

Profile Signal

â†“

HTML

Later

Backend API

â†“

Profile Service

â†“

Component

â†“

HTML

*/
