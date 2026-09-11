import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ProfileModel } from '../models/profile.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = `${environment.apiUrl}/User`;

  profileData = signal<ProfileModel>({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    city: '',
    state: '',
    profileImage: '',
    rewardPoints: 0
  });

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    const name = localStorage.getItem('name') || '';
    const email = localStorage.getItem('email') || '';
    const phone = localStorage.getItem('phoneNumber') || '';
    const gender = localStorage.getItem('gender') || '';
    const dob = localStorage.getItem('dateOfBirth') || '';
    const city = localStorage.getItem('city') || '';
    const state = localStorage.getItem('state') || '';
    const image = localStorage.getItem('profileImageUrl') || '';
    const points = parseInt(localStorage.getItem('rewardPoints') || '0', 10);

    this.profileData.set({
      fullName: name,
      email: email,
      phoneNumber: phone,
      gender: gender,
      dateOfBirth: dob,
      city: city,
      state: state,
      profileImage: image,
      rewardPoints: points
    });
  }

  getProfile(): ProfileModel {
    return this.profileData();
  }

  updateProfile(latestProfile: ProfileModel): void {
    this.profileData.set(latestProfile);
    localStorage.setItem('name', latestProfile.fullName);
    localStorage.setItem('email', latestProfile.email);
    localStorage.setItem('phoneNumber', latestProfile.phoneNumber);
    localStorage.setItem('gender', latestProfile.gender);
    localStorage.setItem('dateOfBirth', latestProfile.dateOfBirth);
    localStorage.setItem('city', latestProfile.city);
    localStorage.setItem('state', latestProfile.state);
    localStorage.setItem('profileImageUrl', latestProfile.profileImage);
    localStorage.setItem('rewardPoints', String(latestProfile.rewardPoints));
  }

  updateProfileImage(imageUrl: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile-image`, { profileImageUrl: imageUrl }).pipe(
      tap(() => {
        const current = this.profileData();
        this.updateProfile({ ...current, profileImage: imageUrl });
      })
    );
  }
}
