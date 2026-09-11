import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Delivery, 
  OrderDeliveryResponse, 
  DeliveryPartnerSummary, 
  CreateDeliveryPartnerDto,
  CreateOrderDeliveryDto 
} from '../models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = `${environment.apiUrl}/OrderDelivery`;

  constructor(private http: HttpClient) { }

  // Get all deliveries (Admin)
  getDeliveries(): Observable<OrderDeliveryResponse[]> {
    return this.http.get<OrderDeliveryResponse[]>(this.apiUrl);
  }

  // Get deliveries assigned to the logged in Delivery Partner
  getPartnerDeliveries(): Observable<OrderDeliveryResponse[]> {
    return this.http.get<OrderDeliveryResponse[]>(`${this.apiUrl}/partner`);
  }

  // Get delivery by order ID
  getDeliveryByOrderId(orderId: number): Observable<OrderDeliveryResponse> {
    return this.http.get<OrderDeliveryResponse>(`${this.apiUrl}/order/${orderId}`);
  }

  // Get delivery by delivery ID
  getDeliveryById(id: number): Observable<OrderDeliveryResponse> {
    return this.http.get<OrderDeliveryResponse>(`${this.apiUrl}/${id}`);
  }

  // Assign or reassign a delivery partner to an order (Admin only)
  createDelivery(dto: CreateOrderDeliveryDto): Observable<any> {
    const payload = {
      orderId: dto.orderId,
      deliveryPartnerId: dto.deliveryPartnerId
    };
    return this.http.post(this.apiUrl, payload);
  }

  // Assign delivery partner alias
  assignDeliveryPartner(orderId: number, deliveryPartnerId: number): Observable<any> {
    return this.createDelivery({ orderId, deliveryPartnerId });
  }

  // Update delivery status (Delivery Partner or Admin)
  updateDeliveryStatus(deliveryId: number, newStatus: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${deliveryId}`, {
      DeliveryStatus: newStatus
    });
  }

  // Get all delivery partners with metrics (Admin only)
  getDeliveryPartners(): Observable<DeliveryPartnerSummary[]> {
    return this.http.get<DeliveryPartnerSummary[]>(`${environment.apiUrl}/User/delivery-partners`);
  }

  // Create a new delivery partner account (Admin only)
  createDeliveryPartner(dto: CreateDeliveryPartnerDto): Observable<any> {
    const payload = {
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phone || dto.phoneNumber,
      password: dto.password,
      address: dto.address
    };
    return this.http.post(`${environment.apiUrl}/User/delivery-partner`, payload);
  }

  // Toggle active/inactive status for a user/delivery partner (Admin only)
  toggleUserStatus(userId: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/User/${userId}/toggle-status`, {});
  }

  // Delete delivery (Admin only)
  deleteDelivery(deliveryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${deliveryId}`);
  }
}
