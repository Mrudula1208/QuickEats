import { Injectable } from '@angular/core'; 
// We import Injectable so Angular can create and manage this service automatically.

import { HttpClient } from '@angular/common/http';
// We import HttpClient because it allows us to call Backend APIs.

import { Observable } from 'rxjs';
// We import Observable because API calls take time, so data is returned asynchronously.

import { MenuItem } from '../models/menu.model';
// We import MenuItem so TypeScript knows the structure of menu data coming from the Backend.

@Injectable({
  providedIn: 'root'
// We write 'root' so Angular creates only one object of this service and shares it everywhere.
})

export class MenuService {
// We create a service because all API calling logic should be kept outside components.

  private apiUrl = 'https://localhost:7278/api/Menu';
// We store the API URL in one variable so if the Backend URL changes, we update it only once.

  constructor(private http: HttpClient) {}
// We inject HttpClient so Angular gives us an object to call APIs.
// We don't create HttpClient ourselves using new HttpClient().

  getMenus(): Observable<MenuItem[]> {
// We create this method to fetch all menu items from the Backend.
// Observable<MenuItem[]> means the API will return a list of MenuItem objects.

    return this.http.get<MenuItem[]>(this.apiUrl);
// We use GET because we only want to read data.
// We pass apiUrl because this is the endpoint that returns all menu items.
// MenuItem[] tells TypeScript what type of data we expect from the API.

  }

  getMenuByRestaurantId(restaurantId: number): Observable<MenuItem[]> {
// We create this method because every restaurant has different menu items.
// restaurantId tells the Backend which restaurant's menu we need.

    const url = `${this.apiUrl}/restaurant/${restaurantId}`;
// We build the URL dynamically because restaurantId changes for every restaurant.

    return this.http.get<MenuItem[]>(url);
// We call the Backend using the generated URL.
// Backend returns only the menu items of that restaurant.

  }
// addMenu
// Save Menu.
addMenu(

  menu: MenuItem

): Observable<MenuItem> {

  // Send Menu.
  return this.http.post<MenuItem>(

    this.apiUrl,

    menu

  );

}deleteMenu(

id:number

):Observable<any>{

// Go to Backend.
// Delete Menu.
return this.http.delete(

`${this.apiUrl}/${id}`

);

}
}