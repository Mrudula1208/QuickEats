# QuickEats - Data Flow Diagrams (DFDs)

## 1. Authentication & Token Injection Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Angular)
    participant Interceptor as authInterceptor
    participant API as AuthController (.NET 8)
    participant JWT as JwtService
    participant DB as SQL Server

    User->>API: POST /api/Auth/login (Email, Password)
    API->>DB: Query User by Email
    DB-->>API: Return User Hash & Role
    API->>API: BCrypt.Verify(Password, Hash)
    API->>JWT: GenerateToken(claims: id, role, email)
    JWT-->>API: Return Signed JWT
    API-->>User: 200 OK + JWT String
    User->>User: Store token in localStorage

    Note over User, Interceptor: On subsequent requests:
    User->>Interceptor: Outgoing HTTP Request
    Interceptor->>Interceptor: Clone request & set Authorization: Bearer <token>
    Interceptor->>API: Forward Authorized Request
```

---

## 2. Geospatial Proximity & Discovery Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Browser
    participant FE as Angular Restaurant Component
    participant API as RestaurantController
    participant SVC as RestaurantService (Haversine)
    participant DB as SQL Server (Restaurants)

    Customer->>FE: Enable Location Permission
    FE->>Customer: navigator.geolocation.getCurrentPosition()
    Customer-->>FE: Return (Lat: 19.0760, Lon: 72.8777)
    FE->>API: GET /api/Restaurant/nearby?latitude=19.0760&longitude=72.8777&radiusKm=10
    API->>SVC: GetNearbyAsync(lat, lon, radius, count)
    SVC->>DB: GetWithCoordinatesAsync() [.AsNoTracking()]
    DB-->>SVC: List of Active Restaurants with Lat/Lon
    loop For Every Restaurant
        SVC->>SVC: Compute HaversineDistanceKm(lat1, lon1, lat2, lon2)
        SVC->>SVC: Filter if distance <= 10 km
    end
    SVC->>SVC: OrderBy(DistanceKm).Take(count)
    SVC-->>API: List of Nearby Restaurants with calculated DistanceKm
    API-->>FE: 200 OK (JSON)
    FE-->>Customer: Render sorted restaurant cards with distance badges
```

---

## 3. Order Lifecycle & Delivery Fulfillment Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    actor Owner as Restaurant Owner
    actor Admin as Platform Admin
    actor Rider as Delivery Partner
    participant OrderAPI as OrderController & OrderService
    participant DeliveryAPI as OrderDeliveryController & OrderDeliveryService
    participant DB as SQL Server

    Customer->>OrderAPI: POST /api/Order (Items, DeliveryAddress, Phone)
    OrderAPI->>DB: Validate Restaurant & Items; Save Order (Status: "Pending")
    OrderAPI-->>Customer: Order Created (#1042)

    Owner->>OrderAPI: PUT /api/Order/1042 (Status: "Confirmed")
    OrderAPI->>DB: Update Order (Status: "Confirmed")
    Owner->>OrderAPI: PUT /api/Order/1042 (Status: "Preparing")
    OrderAPI->>DB: Update Order (Status: "Preparing")
    Owner->>OrderAPI: PUT /api/Order/1042 (Status: "Ready for Pickup")
    OrderAPI->>DB: Update Order (Status: "Ready for Pickup")

    Admin->>DeliveryAPI: POST /api/OrderDelivery (OrderId: 1042, DeliveryPartnerId: 5)
    DeliveryAPI->>DB: Save OrderDelivery (Status: "Assigned"), Update Order (Status: "Assigned")
    DeliveryAPI->>Customer: Notification ("Assigned to delivery partner")

    Rider->>DeliveryAPI: PUT /api/OrderDelivery/{id} (DeliveryStatus: "Picked Up")
    DeliveryAPI->>DB: Update DeliveryStatus="Picked Up", OrderStatus="Picked Up", PickedUpAt=UtcNow
    DeliveryAPI->>Customer: Notification ("Delivery Status: Picked Up")

    Rider->>DeliveryAPI: PUT /api/OrderDelivery/{id} (DeliveryStatus: "Out for Delivery")
    DeliveryAPI->>DB: Update DeliveryStatus="Out for Delivery", OrderStatus="Out for Delivery"
    DeliveryAPI->>Customer: Notification ("Delivery Status: Out for Delivery")

    Rider->>DeliveryAPI: PUT /api/OrderDelivery/{id} (DeliveryStatus: "Delivered")
    DeliveryAPI->>DB: Update DeliveryStatus="Delivered", OrderStatus="Delivered", DeliveredAt=UtcNow
    DeliveryAPI->>Customer: Notification ("Order #1042 Delivered!")
```

---

## 4. Review & Rating Re-computation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant API as ReviewController
    participant SVC as ReviewService
    participant DB as SQL Server

    Customer->>API: POST /api/Review (RestaurantId: 3, Rating: 5, Comment: "Amazing biryani!")
    API->>SVC: AddReviewAsync(userId, dto)
    SVC->>DB: Save Review record
    SVC->>DB: Query all reviews for Restaurant 3: Average(r.Rating)
    DB-->>SVC: Computed Average Rating (e.g. 4.8)
    SVC->>DB: Update Restaurant.AverageRating = 4.8
    DB-->>SVC: Changes Saved
    SVC-->>API: Success Response
    API-->>Customer: 201 Created ("Review submitted successfully.")
```
