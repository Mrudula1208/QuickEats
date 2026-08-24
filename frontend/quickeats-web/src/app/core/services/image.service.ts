import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private apiUrl = `${environment.apiUrl}/Image`;

  constructor(private http: HttpClient) {}

  // Upload image file to backend.
  // category: "restaurants", "menu", or "profile"
  // Returns observable with { imageUrl: string }
  uploadImage(file: File, category: string): Observable<{ imageUrl: string }> {

    // Build FormData object.
    // FormData sends file as multipart/form-data.
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(
      `${this.apiUrl}/upload/${category}`,
      formData
    );
  }
}
