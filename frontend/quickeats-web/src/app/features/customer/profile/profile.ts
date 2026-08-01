import { Component } from '@angular/core';
// 1️⃣ Executes First.
// Import Component because every Angular page starts with @Component.

import { CommonModule } from '@angular/common';
// 2️⃣ Import CommonModule because HTML uses Angular directives.

import { FormsModule } from '@angular/forms';
// 3️⃣ Import FormsModule because Edit Profile uses ngModel.

import { ProfileService } from '../../../core/services/profile.service';
// 4️⃣ Import ProfileService.
// Service manages customer profile.

import { ProfileModel } from '../../../core/models/profile.model';
// 5️⃣ Import ProfileModel.
// Defines structure of customer profile.

@Component({

  selector: 'app-profile',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl: './profile.html',

  styleUrl: './profile.scss'

})

export class ProfileComponent {

  // ====================================================
  // EXECUTION FLOW
  // ====================================================
  //
  // 1️⃣ Angular creates ProfileComponent.
  //
  // 2️⃣ Constructor executes.
  //
  // 3️⃣ Profile loads from ProfileService.
  //
  // 4️⃣ HTML receives profile.
  //
  // 5️⃣ User edits details.
  //
  // 6️⃣ Save button updates profile.
  //
  // ====================================================

  // profile: ProfileModel
  //
  // Stores customer profile.

  profile: ProfileModel;

  constructor(

    private profileService: ProfileService

    // private
    // Only this component can use service.
    //
    // Angular automatically injects
    // ProfileService.

  ) {

    // Load customer profile.

    this.profile =

      this.profileService.getProfile();

  }

  saveProfile(): void {

    // (): void
    //
    // Returns nothing.
    // Only performs work.

    this.profileService.updateProfile(

      this.profile

    );

    alert("Profile Updated Successfully");

  }

}

/*

WHY DO WE WRITE THIS FILE?

This component controls Profile Page.

Flow

Profile Service

↓

Profile Component

↓

HTML

↓

Customer Updates Profile

↓

Profile Service

↓

Signal Updated

*/