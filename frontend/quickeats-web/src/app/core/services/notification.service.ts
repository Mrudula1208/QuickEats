// Service Annotation.
// Makes this file an Angular Service.
import { Injectable } from '@angular/core';

// Backend Caller.
// Calls ASP.NET Core APIs.
import { HttpClient } from '@angular/common/http';

// Wait for Backend.
// Receives API response later.
import { Observable } from 'rxjs';

// Notification Structure.
// Defines one Notification object.
import { NotificationModel } from '../models/notification.model';

@Injectable({

  // One Service Instance.
  // Used everywhere.
  providedIn: 'root'

})
export class NotificationService {

  // API URL Variable.
  // Stores Backend Address.
  private apiUrl = 'https://localhost:7278/api/Notification';

  constructor(

    // private
    // Used only inside Service.
    //
    // http
    // HttpClient variable.
    //
    // HttpClient
    // Calls Backend APIs.
    private http: HttpClient

  ) { }

  // getNotifications
  // Gets all Notifications.
  //
  // ()
  // No Input.
  //
  // Observable<NotificationModel[]>
  // Wait and return all Notifications.
  getNotifications(): Observable<NotificationModel[]> {

    // Go to Backend.
    // Get Notifications.
    return this.http.get<NotificationModel[]>(this.apiUrl);

  }

  // markAsRead
  // Updates Notification.
  //
  // notificationId
  // Selected Notification Id.
  //
  // Observable<any>
  // Wait for Backend response.
  markAsRead(
    notificationId: number
  ): Observable<any> {

    // Go to Backend.
    // Mark Notification as Read.
    return this.http.put(
      `${this.apiUrl}/${notificationId}`,
      {}
    );

  }

}