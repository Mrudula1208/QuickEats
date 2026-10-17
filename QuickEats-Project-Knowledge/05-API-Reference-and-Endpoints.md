# QuickEats - Complete API Reference & Endpoints Guide

## 1. Overview
The QuickEats API is structured as an ASP.NET Core 8 RESTful Web API.
- **Base URL (Local):** `https://localhost:7085/api` or `http://localhost:5222/api`
- **Base URL (Production):** `https://quickeats.somee.com/api`
- **Authentication Scheme:** `Bearer <JWT_TOKEN>` in `Authorization` header
- **Response Format:** JSON (`application/json`)
- **Total Controllers:** 17 Controllers covering 90+ endpoints

---

## 2. API Controllers Summary Table

| Controller | Route | Main Purpose | Access Level |
|---|---|---|---|
| `AuthController` | `/api/Auth` | User registration & JWT generation | Public |
| `RestaurantController` | `/api/Restaurant` | Browse, filter, nearby, owner CRUD | Public / Owner / Admin |
| `MenuController` | `/api/Menu` | Browse food items, pricing, inventory | Public / Owner / Admin |
| `OrderController` | `/api/Order` | Order placement, state transitions, lifecycle | Customer / Owner / Admin |
| `OrderDeliveryController` | `/api/OrderDelivery` | Delivery assignment (Admin) and status progression (Delivery Partner) | DeliveryPartner / Admin |
| `PaymentController` | `/api/Payment` | Razorpay / Mock payment initiation & verification | Customer / Admin |
| `CategoryController` | `/api/Category` | Cuisine and menu category taxonomy | Public / Admin |
| `CouponController` | `/api/Coupon` | Discount promo codes & validation | Public / Admin / Customer |
| `ReviewController` | `/api/Review` | Restaurant ratings and written feedback | Public / Customer / Admin |
| `RestaurantRatingController`| `/api/RestaurantRating` | Aggregate star ratings computation | Public / Customer |
| `FavoriteController` | `/api/Favorite` | Customer restaurant bookmarks | Customer |
| `WishlistController` | `/api/Wishlist` | Customer saved dish items | Customer |
| `SavedAddressController` | `/api/SavedAddress` | Customer multiple delivery addresses | Customer |
| `NotificationController` | `/api/Notification` | In-app alerts and order updates | Authenticated Users |
| `UserController` | `/api/User` | Profile management, Admin user directory | Authenticated / Admin |
| `DashboardController` | `/api/Dashboard` | Business analytics, revenue, order stats | Admin / Owner |
| `ImageController` | `/api/Image` | Image file upload handling | Authenticated Users |

---

## 3. Core Endpoints Deep Dive

### 3.1 Authentication (`/api/Auth`)

#### `POST /api/Auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "9876543210",
  "password": "SecurePassword123!",
  "role": "Customer"
}
```
- **Allowed Roles:** `Customer`, `Owner`, `DeliveryPartner`
- **Response `200 OK`:**
```json
{
  "message": "User registered successfully."
}
```

#### `POST /api/Auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`:**
```json
{
  "id": 14,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "Customer",
  "profileImageUrl": "https://quickeats.somee.com/uploads/users/jane.jpg",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3.2 Restaurants (`/api/Restaurant`)

#### `GET /api/Restaurant`
- **Access:** Public
- **Description:** Returns all active restaurants with calculated average ratings.

#### `GET /api/Restaurant/nearby?latitude=19.0760&longitude=72.8777&radiusKm=10&count=8`
- **Access:** Public
- **Description:** Calculates great-circle distance using Haversine formula in memory and returns restaurants sorted nearest first.
- **Response Sample:**
```json
[
  {
    "id": 3,
    "name": "Spice Route Indian Kitchen",
    "cuisineType": "North Indian, Biryani",
    "address": "Bandra West, Mumbai",
    "city": "Mumbai",
    "rating": 4.8,
    "distanceKm": 2.45,
    "deliveryCharge": 25.00,
    "deliveryTimeMinutes": 30,
    "isOpen": true
  }
]
```

#### `GET /api/Restaurant/recommended?count=6`
- **Access:** Public / Customer (reads JWT if present to tailor to user's past ordering affinity)

#### `POST /api/Restaurant`
- **Access:** `[Authorize(Roles = "Owner,Admin")]`
- **Request Body:**
```json
{
  "name": "Bombay Street Wraps",
  "description": "Artisanal kathi rolls and fusion street snacks.",
  "cuisineType": "Street Food, Fast Food",
  "address": "Linking Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400050",
  "phoneNumber": "9123456780",
  "imageUrl": "/uploads/restaurants/wraps.jpg",
  "openingTime": "11:00",
  "closingTime": "23:00",
  "deliveryCharge": 30.00,
  "deliveryTimeMinutes": 25,
  "latitude": 19.0601,
  "longitude": 72.8339
}
```

---

### 3.3 Menu Items (`/api/Menu`)

#### `GET /api/Menu/restaurant/{restaurantId}`
- **Access:** Public (all customers, owners, and visitors can browse menus)
- **Response Sample:**
```json
[
  {
    "id": 42,
    "restaurantId": 3,
    "name": "Paneer Tikka Masala",
    "description": "Char-grilled cottage cheese in a rich tomato-cashew gravy.",
    "price": 280.00,
    "category": "Main Course",
    "isAvailable": true,
    "imageUrl": "/uploads/menu/paneer-tikka.jpg"
  }
]
```

#### `POST /api/Menu`
- **Access:** `[Authorize(Roles = "Owner,Admin")]` (owner check ensures you own the restaurant)

---

### 3.4 Orders (`/api/Order`)

#### `POST /api/Order`
- **Access:** `[Authorize(Roles = "Customer")]`
- **Request Body:**
```json
{
  "restaurantId": 3,
  "deliveryAddress": "Flat 402, Sunset Heights, Bandra West",
  "phoneNumber": "9876543210",
  "paymentMethod": "Razorpay",
  "items": [
    {
      "menuItemId": 42,
      "quantity": 2
    }
  ]
}
```
- **Response `200 OK`:** Returns generated `OrderId` (e.g. `1024`).

#### `GET /api/Order/user/{userId}`
- **Access:** `[Authorize]` (Customer can view their own orders; Admin can view any user's orders)
- **Description:** Returns order history for the specified user, sorted newest first.

#### `GET /api/Order/owner`
- **Access:** `[Authorize(Roles = "Owner")]`
- **Description:** Returns all incoming and past orders for restaurants owned by the authenticated owner.

#### `PUT /api/Order/{id}`
- **Access:** `[Authorize(Roles = "Owner")]`
- **Request Body:**
```json
{
  "status": "Preparing"
}
```
- **Validation:** Owners may advance status (`Pending` -> `Confirmed` -> `Preparing` -> `Ready for Pickup`) or reject/cancel only while still in `Pending` state.

#### `PATCH /api/Order/{id}/cancel`
- **Access:** `[Authorize(Roles = "Customer")]`
- **Rule:** Customers can self-cancel only while status is `Pending` or `Confirmed`. Once `Preparing`, cancellation throws HTTP 400.

#### `POST /api/Order/{id}/admin-cancel`
- **Access:** `[Authorize(Roles = "Admin")]`
- **Description:** Admin cancellation for exceptional situations; permitted while the order is `Pending` or `Confirmed`.

#### `POST /api/Order/{id}/override`
- **Access:** `[Authorize(Roles = "Admin")]`
- **Description:** Emergency status override with mandatory `reason` logged to `AdminOrderOverrides` audit table.

---

### 3.5 Delivery Partner Management (`/api/OrderDelivery`)

#### `GET /api/OrderDelivery`
- **Access:** `[Authorize(Roles = "Admin")]`
- **Description:** Returns all delivery assignments across the platform.

#### `GET /api/OrderDelivery/partner`
- **Access:** `[Authorize(Roles = "DeliveryPartner,Delivery Partner")]`
- **Description:** Returns all deliveries assigned to the currently logged-in delivery partner.

#### `GET /api/OrderDelivery/{id}`
- **Access:** `[Authorize]` (Admin, assigned Delivery Partner, or Customer who placed the order)
- **Description:** Returns details of a single delivery by delivery ID.

#### `GET /api/OrderDelivery/order/{orderId}`
- **Access:** `[Authorize]` (Admin, assigned Delivery Partner, or Customer who placed the order)
- **Description:** Returns the delivery assignment associated with a specific order ID.

#### `POST /api/OrderDelivery`
- **Access:** `[Authorize(Roles = "Admin")]`
- **Request Body:**
```json
{
  "orderId": 1042,
  "deliveryPartnerId": 5
}
```
- **Description:** Admin assigns an active delivery partner to an order once the order reaches `Ready for Pickup` (or reassigns while still in `Assigned` status). Sets `DeliveryStatus` to `Assigned`, updates `Order.Status` to `Assigned`, and creates a customer notification.

#### `PUT /api/OrderDelivery/{id}`
- **Access:** `[Authorize(Roles = "DeliveryPartner,Delivery Partner")]` (Assigned partner only)
- **Request Body:**
```json
{
  "deliveryStatus": "Picked Up"
}
```
- **Description:** Assigned delivery partner advances the delivery stage. Transitions must strictly follow sequential progression: `Assigned` -> `Picked Up` -> `Out for Delivery` -> `Delivered`. Synchronizes `Order.Status`, sets timestamps (`PickedUpAt` or `DeliveredAt`), and dispatches customer notification.

#### `DELETE /api/OrderDelivery/{id}`
- **Access:** `[Authorize(Roles = "Admin")]`
- **Description:** Deletes a delivery record.

---

### 3.6 Payments (`/api/Payment`)

#### `POST /api/Payment/initiate`
- **Access:** `[Authorize(Roles = "Customer")]`
- **Description:** Generates order ID with Razorpay / Gateway configuration or handles Mock Instant Success for demonstration.

#### `POST /api/Payment/verify`
- **Access:** `[Authorize(Roles = "Customer")]`
- **Description:** Verifies payment transaction signature and marks `PaymentStatus = "Completed"`.

---

## 4. Standard HTTP Response Codes

| Status Code | Meaning | Example Scenario in QuickEats |
|---|---|---|
| `200 OK` | Success with payload | Successful GET query or login response |
| `201 Created` | Resource created | Address created or order placed |
| `400 Bad Request` | Validation failure / invalid state transition | Attempting to cancel an order already `Out for Delivery` |
| `401 Unauthorized` | Missing, malformed, or expired JWT | Token expired or no `Bearer` header supplied |
| `403 Forbidden` | Authenticated but insufficient permission | Customer trying to access `/api/Dashboard/admin-stats` |
| `404 Not Found` | Entity not found | Restaurant ID or Order ID does not exist in DB |
| `500 Server Error` | Unhandled exception | Database connection timeout or unexpected crash |
