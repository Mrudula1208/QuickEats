import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CouponModel } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {

  private apiUrl = `${environment.apiUrl}/Coupon`;

  constructor(private http: HttpClient) { }

  getCoupons(): Observable<CouponModel[]> {
    return this.http.get<CouponModel[]>(this.apiUrl);
  }

  createCoupon(coupon: any): Observable<CouponModel> {
    return this.http.post<CouponModel>(this.apiUrl, coupon);
  }

  updateCoupon(id: number, coupon: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, coupon);
  }

  deleteCoupon(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCouponByCode(enteredCouponCode: string): Observable<CouponModel> {
    return this.http.get<CouponModel>(`${this.apiUrl}/${enteredCouponCode}`);
  }
}
