// profile.model.ts

// We create an interface because
// it defines the structure of one Customer Profile.
// Every profile object must follow this structure.

export interface ProfileModel {

    // Customer Full Name
    fullName: string;

    // Customer Email
    email: string;

    // Customer Mobile Number
    phoneNumber: string;

    // Customer Gender
    gender: string;

    // Customer Date Of Birth
    dateOfBirth: string;

    // Customer City
    city: string;

    // Customer State
    state: string;

    // Profile Photo URL
    profileImage: string;

    // Reward Points
    rewardPoints: number;

}

/*

WHY DO WE WRITE THIS FILE?

Model represents one Customer Profile.

Flow

Database

â†“

Backend API

â†“

ProfileModel

â†“

Profile Service

â†“

Profile Component

â†“

HTML

*/
