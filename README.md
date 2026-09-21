# QuickEats

A complete food delivery and restaurant management platform built with an **ASP.NET Core 8 Web API** backend and an **Angular 21 (Standalone Components)** frontend.

The system coordinates the entire food ordering lifecycle across four distinct user roles, from browsing menus to real-time order tracking and dispatch:

- **Customers**: Browse restaurants and menus, search and filter by cuisine, discover trending dishes and location-based recommendations, maintain cart, wishlist and favorites, apply coupons, place orders, track deliveries live, save addresses, write reviews, and manage notifications.
- **Restaurant Owners**: Manage restaurant profiles and menus with strict per-owner data isolation, process the kitchen queue (confirm, prepare, mark ready), respond to reviews, and monitor performance.
- **Delivery Partners**: Mobile-first rider workspace to manage duty status, accept assigned deliveries, and walk each order through pickup → in-transit → drop-off.
- **Administrators**: Full platform console — users, owners, restaurants, menus, categories, coupons, orders, payments, rider dispatch, delivery tracking, and analytics dashboards.

---

## Live Links

- **Frontend Application (Netlify)**: [https://quickeats-web.netlify.app](https://quickeats-web.netlify.app)
- **Backend API & Swagger UI (Somee)**: [http://quickeats.somee.com/swagger](http://quickeats.somee.com/swagger)
- **GitHub Repository**: [https://github.com/Mrudula1208/QuickEats](https://github.com/Mrudula1208/QuickEats)

---

## Demo Login Credentials

The API auto-seeds demo accounts on startup (see `DemoDataPolisher`), so every role is immediately testable:

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@gmail.com` | `Password@123` | Storefront, Cart, Checkout, Wishlist, Order Tracking |
| **Restaurant Owner** | `owner@gmail.com` | `Owner@123` | Owner Dashboard, Restaurants, Menus, Kitchen Queue, Reviews |
| **Delivery Partner** | `rider@gmail.com` | `Password@123` | Rider Dashboard, Active Deliveries, History |
| **Admin** | `admin@gmail.com` | `Admin@123` | Full Admin Console, Dispatch, User & Analytics |

> Tip: `database/seed-data/demo_seed_data.sql` can additionally populate realistic orders, deliveries, and rider tasks across every lifecycle state for richer dashboards.

---

## Screenshots

| Customer Storefront | Owner Kitchen Orders |
| :---: | :---: |
| ![Customer Storefront](./screenshots/01_customer_home.png) | ![Owner Orders](./screenshots/03_owner_kitchen_orders.png) |

| Delivery Partner Portal | Admin Dispatch & Analytics |
| :---: | :---: |
| ![Delivery Partner Dashboard](./screenshots/05_delivery_partner_dashboard.png) | ![Admin Delivery](./screenshots/07_admin_delivery_management.png) |

---

## Features by Role

### Customer
- Modern homepage with hero search, cuisine filters, featured restaurants, trending dishes, today's best offers, verified customer reviews, and a geolocation-based **"Near You"** section (GPS or by city).
- Restaurant details with menus, operating hours, open/closed status, ratings, veg/non-veg indicators, discounts, and bestseller badges.
- Cart, checkout (saved / new addresses), and multiple payment options.
- Live order tracking, order history, self-service **order cancellation** (while Pending or Confirmed), and delivery progress (Assigned → Picked Up → Out for Delivery → Delivered).
- Restaurant **favorites**, dish **wishlist**, **coupons/offers**, **notifications**, **saved addresses**, and **reviews** (only delivered orders are eligible, with a verified-order badge).
- Profile management with avatar upload; static pages (About, Contact, Terms, Privacy, Refund Policy) and in-app help/support.

### Restaurant Owner
- Dashboard with revenue, order, and rating metrics for the owner's own restaurants only.
- Restaurant profile and menu CRUD (add/edit/delete items, image upload, pricing, discounts, availability toggles).
- Kitchen order queue with a strict state machine: `Pending → Confirmed → Preparing → Ready for Pickup` (owners may also reject/cancel while Pending).
- Review management and owner profile settings.

### Delivery Partner
- Dedicated mobile-first layout with dashboard, active deliveries, delivery history, and rider profile.
- Duty/availability toggle and per-delivery actions: `Pick Up → Out for Delivery → Delivered`.

### Admin
- Analytics dashboard (Chart.js) spanning revenue, orders, top restaurants/dishes, and platform metrics.
- CRUD management for users, owners, restaurants, menus, categories, and coupons.
- Order monitoring, **admin cancellation** and **authorised emergency status overrides** (mandatory reason, audited).
- Delivery management: dispatch a delivery partner to an order and track active deliveries in real time.
- Review and payment administration with platform-wide visibility.

---

## Order Fulfillment Workflow

The application enforces a sequential state machine for every order:

```
[Customer] Places Order (Pending)
       │
       ▼
[Owner] Confirms Order ──► Starts Preparing ──► Marks Ready for Pickup
                                                         │
        ┌────────────────────────────────────────────────┘
        ▼
[Admin] Assigns Available Delivery Partner (Assigned)
       │
       ▼
[Rider] Picks up from Restaurant (Picked Up)
       │
       ▼
[Rider] In Transit to Customer (Out for Delivery)
       │
       ▼
[Rider] Confirms Drop-off (Delivered)
```

**Guarantees & exceptional paths**
- Owners can only advance to `Confirmed → Preparing → Ready for Pickup` and may cancel only while the order is `Pending`.
- Riders can only advance assigned deliveries through `Picked Up → Out for Delivery → Delivered`.
- Customers can self-cancel while the order is `Pending` or `Confirmed`.
- Admins can cancel an order, or issue a controlled **override** to any valid state — an override records the admin, timestamp, and a mandatory reason in the audit log and never bypasses validation.

---

## Technical Highlights & Architecture

### 1. Role-Based Security
- JWT Bearer authentication with claims-based authorization (`Admin`, `Owner`, `DeliveryPartner`, `Customer`).
- BCrypt password hashing; every protected endpoint derives the current user from the validated token (`ClaimTypes.NameIdentifier`).

### 2. Multi-Tenant Data Isolation
- Owner queries are scoped at the repository layer (`Restaurant.OwnerId == currentUserId`), so owners can only see their own restaurants, menus, orders, revenue, and reviews.
- Order lookups are role-aware: customers see only their own, owners only their restaurants', riders only their assigned deliveries.

### 3. State Machine Validation
- Order and delivery transitions are validated on the backend before any database write.
- Admin overrides are additive and audited — the normal per-role workflow is never bypassed accidentally.

### 4. Location-Aware Discovery
- Restaurants store latitude/longitude (auto-seeded for known cities); the backend sorts nearby restaurants by haversine distance and the homepage uses browser geolocation or a city picker.

### 5. Production Deployment Architecture
- **Backend**: ASP.NET Core 8 Web API + Microsoft SQL Server hosted on Somee.com, with proper JSON `ExceptionMiddleware` (400/401/403/404/409/500) instead of HTML error pages.
- **Frontend**: Angular SPA hosted on Netlify with reverse-proxy rewrite rules (`netlify.toml`) forwarding `/api/*` to the Somee backend, eliminating browser CORS issues. Restaurant/menu images are bundled into the Netlify build and served statically, while runtime uploads go through the API.

---

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API, C#
- **ORM & Database**: Entity Framework Core 8, Microsoft SQL Server
- **Security & Auth**: JWT Bearer Authentication, BCrypt password hashing, Claims-based Authorization
- **Frontend**: Angular 21 (Standalone Components), TypeScript, RxJS, Signals
- **Styling & UI**: SCSS, Bootstrap 5, Angular Material icons, FontAwesome, ngx-toastr, SweetAlert2
- **Data Visualization**: Chart.js + ng2-charts (admin analytics)
- **Maps / Geo**: Leaflet for map-based display; geolocation-driven "Near You" discovery
- **API Documentation**: Swagger / OpenAPI (Swashbuckle)

---

## Project Structure

```
QuickEats/
├── backend/QuickEats.API/QuickEats.API/
│   ├── Controllers/          # REST endpoints grouped by domain
│   ├── Services/             # Business logic layer (+ Interfaces)
│   ├── Repositories/         # EF Core data access layer (+ Interfaces)
│   ├── Models/               # Entity Framework database entities
│   ├── DTos/                 # Request & response data transfer objects
│   ├── Data/                 # AppDbContext, seed data & demo-data polisher
│   ├── Migrations/           # EF Core schema migrations
│   ├── Middleware/           # Global JSON exception handling
│   └── wwwroot/uploads/      # Static image assets (restaurants, menus)
│
├── frontend/quickeats-web/
│   ├── src/app/
│   │   ├── core/             # Auth/HTTP services, models, interceptors
│   │   ├── features/
│   │   │   ├── customer/     # Home, restaurants, cart, checkout, orders,
│   │   │   │                 # tracking, payments, wishlist, favorites,
│   │   │   │                 # coupons, notifications, reviews, addresses,
│   │   │   │                 # profile, support, static pages
│   │   │   ├── owner/        # Dashboard, restaurants, menu CRUD, kitchen
│   │   │   │                 # orders, reviews, profile
│   │   │   ├── delivery-partner/  # Rider dashboard, deliveries, history, profile
│   │   │   ├── admin/        # Analytics, users, owners, restaurants, menus,
│   │   │   │                 # categories, coupons, orders, payments, dispatch
│   │   │   └── auth/         # Login and registration forms
│   │   ├── guards/           # Auth, Admin, Owner, DeliveryPartner route guards
│   │   ├── interceptors/     # JWT Bearer token injector & error handler
│   │   ├── layout/           # Main, customer, admin and rider layout shells
│   │   └── shared/           # Header, footer, admin/owner nav components
│   └── netlify.toml          # Netlify build + /api reverse-proxy configuration
│
├── database/
│   ├── scripts/              # Standalone SQL scripts (e.g. restaurant coordinates)
│   └── seed-data/            # Demo orders/deliveries seed script
│
├── docs/                     # API, architecture, database & setup documentation
├── screenshots/              # UI screenshots
├── QuickEats_Somee_Data_Import.sql   # Full SQL import for Somee hosting
└── QuickEats-Publish/        # Compiled production binaries for Somee deployment
```

---

## Local Development Setup

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18, v20, or v22 LTS) & `npm`
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express, or standard edition)

---

### Backend Setup

1. Navigate to the backend project:
   ```bash
   cd backend/QuickEats.API/QuickEats.API
   ```

2. Set the JWT secret key (minimum 32 characters) — the API refuses to start without it:
   ```bash
   dotnet user-secrets set "Jwt:Key" "YourSuperSecretKeyWithAtLeast32CharactersLong!"
   ```

3. Point the connection string at your SQL Server — either in `appsettings.json` or via user-secrets:
   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\MSSQLLocalDB;Database=QuickEatsDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
   ```

4. Apply the EF Core migrations:
   ```bash
   dotnet ef database update
   ```

5. Run the API:
   ```bash
   dotnet run
   ```
   The API starts on `http://localhost:5243` and Swagger UI is available at `http://localhost:5243/swagger`. On first startup it auto-seeds demo accounts, restaurants, menus, and delivery data *(see `Data/DemoDataPolisher` and the `Program.cs` bootstrap)*.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/quickeats-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```
   Open `http://localhost:4200` in your browser. Check `proxy.conf.json` for dev-time API proxying to `http://localhost:5243`.

---

## Key API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Auth/register` | Public | Registers a new Customer or Restaurant Owner |
| `POST` | `/api/Auth/login` | Public | Authenticates and returns a JWT token |
| `GET` | `/api/Restaurant` | Public | Lists all active restaurants |
| `GET` | `/api/Restaurant/featured` | Public | Handpicked featured restaurants |
| `GET` | `/api/Restaurant/recommended` | Public | Top-rated recommended restaurants |
| `GET` | `/api/Restaurant/nearby` | Public | Restaurants near a lat/lng (sorted by distance) |
| `GET` | `/api/Restaurant/mine` | Owner | Owner's own restaurants |
| `GET` | `/api/Menu/trending` | Public | Trending / best-selling dishes |
| `GET` | `/api/Menu/restaurant/{id}` | Public | Menu items for a restaurant |
| `GET` | `/api/Menu/categories` | Public | Available food categories |
| `POST` | `/api/Order` | Customer | Places a new order |
| `GET` | `/api/Order/user/{userId}` | Customer / Admin | Orders for a user |
| `GET` | `/api/Order/owner` | Owner | Kitchen order queue (scoped to owner) |
| `PUT` | `/api/Order/{id}` | Owner | Advance status: Confirmed / Preparing / Ready for Pickup / Cancelled |
| `PATCH` | `/api/Order/{id}/cancel` | Customer | Self-service cancellation (Pending / Confirmed only) |
| `POST` | `/api/Order/{id}/admin-cancel` | Admin | Admin cancellation |
| `POST` | `/api/Order/{id}/override` | Admin | Audited emergency status override (reason required) |
| `POST` | `/api/OrderDelivery` | Admin | Dispatches and assigns a rider to an order |
| `GET` | `/api/OrderDelivery/partner` | DeliveryPartner | Assigned deliveries for logged-in rider |
| `PUT` | `/api/OrderDelivery/{id}` | DeliveryPartner | Advance delivery: Picked Up / Out for Delivery / Delivered |
| `POST` | `/api/Payment` | Customer | Pay/create record for an order |
| `GET` | `/api/Payment/user/{userId}` | Customer / Admin | Payment history for a user |
| `GET` | `/api/Review/restaurant/{restaurantId}` | Public | Reviews for a restaurant |
| `GET` | `/api/Review/restaurant/{restaurantId}/average` | Public | Average rating for a restaurant |
| `GET` | `/api/Review/eligible-orders` | Customer | Delivered orders eligible for review |
| `POST` | `/api/Review` | Customer | Submit a review (delivered order required) |
| `GET` | `/api/Favorite` | Customer | Favorite restaurants |
| `GET` | `/api/Wishlist` | Customer | Wishlisted dishes |
| `GET` | `/api/Coupon` | Public / Admin | List coupons (admin manages) |
| `GET` | `/api/SavedAddress` | Customer | Saved delivery addresses |
| `GET` | `/api/Notification` | Customer | In-app notifications |
| `GET` | `/api/Dashboard` | Admin | Platform analytics and KPIs |
| `POST` | `/api/Image/upload/{category}` | Auth | Upload restaurant/menu/profile images |

---

## License

This project is licensed under the [MIT License](LICENSE).