import { Injectable, signal } from '@angular/core';
// 1️⃣ Executes First.
//
// Injectable
// Means Angular can create this service.
//
// signal
// Stores live data.
// Whenever signal changes,
// Angular automatically refreshes UI.

import { ProfileModel } from '../models/profile.model';
// 2️⃣ Import ProfileModel.
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
    // 1️⃣ Angular creates ProfileService.
    //
    // 2️⃣ profileData signal is created.
    //
    // 3️⃣ Component calls getProfile().
    //
    // 4️⃣ HTML displays profile.
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

        console.log("Profile Updated");

        console.log(this.profileData());

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

↓

Profile Service

↓

Profile Signal

↓

HTML

Later

Backend API

↓

Profile Service

↓

Component

↓

HTML

*/