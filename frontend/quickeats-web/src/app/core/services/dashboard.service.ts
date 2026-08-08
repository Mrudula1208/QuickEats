// Service Annotation.
// Makes this file Angular Service.
import { Injectable } from '@angular/core';

// Backend Caller.
// Calls ASP.NET Core APIs.
import { HttpClient } from '@angular/common/http';

// Wait for Backend.
// Receives response later.
import { Observable } from 'rxjs';

// Dashboard Structure.
// Defines Dashboard object.
import { DashboardModel } from '../models/dashboard.model';

@Injectable({

  // One Service Instance.
  providedIn:'root'

})

export class DashboardService{

// Backend URL.
private apiUrl='https://localhost:7278/api/Dashboard';

constructor(

/*
private
Use only inside this Service.

http
Variable Name.

HttpClient
Calls Backend APIs.
*/

private http:HttpClient

){}

// getDashboard
// Reads Dashboard.
//
// ()
// No input.
//
// :
// Return type starts.
//
// Observable<DashboardModel>
// Wait and return Dashboard.
getDashboard():Observable<DashboardModel>{

// return
// Send result back.
//
// this
// Current Service.
//
// http
// HttpClient object.
//
// get
// Read Data.
//
// DashboardModel
// One Dashboard object.
//
// this.apiUrl
// Go to Backend.
return this.http.get<DashboardModel>(

this.apiUrl

);

}

}