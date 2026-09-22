# QuickEats 🍔

> **A food delivery + restaurant management platform** built end-to-end with an **ASP.NET Core 8** Web API and an **Angular** single-page app. Customers order, owners take over the kitchen queue, riders deliver, and the admin keeps an eye on all of it.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Demo Accounts](#demo-accounts)
- [Screenshots](#screenshots)
- [What's Inside](#whats-inside)
- [How An Order Travels](#how-an-order-travels)
- [Tech Stack](#tech-stack)
- [Project Layout](#project-layout)
- [Running It Locally](#running-it-locally)
- [API Endpoints Cheat Sheet](#api-endpoints-cheat-sheet)
- [License](#license)

---

## Live Demo

| | Link |
|---|---|
| 🌐 Frontend (Netlify) | https://quickeats-web.netlify.app |
| 🔌 Backend API + Swagger (Somee) | http://quickeats.somee.com/swagger |
| 📦 Repo | https://github.com/Mrudula1208/QuickEats |

Small heads-up before you click around: the backend lives on a free hosting tier, so the first request after a period of inactivity can be a little slow. Give it a couple of seconds — it wakes up.

---

## Demo Accounts

The API seeds a set of demo users automatically when it starts (take a look at `DemoDataPolisher` in the backend). So no signup needed to explore every role:

| Role | Email | Password | What you can do |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@gmail.com` | `Password@123` | Storefront, cart, checkout, wishlist, order tracking |
| **Restaurant Owner** | `owner@gmail.com` | `Owner@123` | Owner dashboard, menus, kitchen queue, reviews |
| **Delivery Partner** | `rider@gmail.com` | `Password@123` | Rider dashboard, active deliveries, history |
| **Admin** | `admin@gmail.com` | `Admin@123` | Full admin console, rider dispatch, analytics |

> Bonus: there's a script at `database/seed-data/demo_seed_data.sql` that fills in realistic orders, deliveries, and rider tasks at every stage of the lifecycle — handy if you want the dashboards to actually look lived-in.

---

## Screenshots

| Customer Storefront | Owner Kitchen Orders |
| :---: | :---: |
| ![Customer Storefront](./screenshots/01_customer_home.png) | ![Owner Orders](./screenshots/03_owner_kitchen_orders.png) |

| Delivery Partner Portal | Admin Dispatch & Analytics |
| :---: | :---: |
| ![Delivery Partner Dashboard](./screenshots/05_delivery_partner_dashboard.png) | ![Admin Delivery](./screenshots/07_admin_delivery_management.png) |

---

## What's Inside

### For Customers
- A modern homepage — hero search, cuisine filters, featured restaurants, trending dishes, today's best offers, and genuinely real (seed) customer reviews.
- A **"Near You"** section that uses the browser's geolocation (or a manual city picker) and sorts restaurants by distance server-side.
- Restaurant pages with menus, operating hours, open/closed status, ratings, veg/non-veg tags, discounts, and bestseller badges.
- Full cart → checkout → payment flow (COD, card, etc.), with saved addresses or a new one at checkout.
- Live order tracking with a progress timeline, order history, and self-service cancellation while the order is still in early stages.
- Favorites (restaurants), wishlist (dishes), coupons, notifications, saved addresses, and reviews. Reviews only unlock for **delivered** orders and carry a verified-order badge so fake reviews don't sneak in.
- Profile with avatar upload, plus static About / Contact / Terms / Privacy pages and an in-app help section.

### For Restaurant Owners
- Their own dashboard only — revenue, orders, and rating metrics are scoped to *their* restaurants, nobody else's.
- Restaurant profile + menu CRUD: add/edit/delete items, image upload, pricing, discounts, and instant availability toggles.
- A kitchen order queue with a strict status flow: `Pending → Confirmed → Preparing → Ready for Pickup`. Owners can also cancel while it's still `Pending`.
- Review replies and owner profile settings.

### For Delivery Partners
- A dedicated mobile-first layout (this is a rider's day-to-day tool, after all): dashboard, active deliveries, history, and profile.
- A duty/availability toggle and per-delivery actions: `Picked Up → Out for Delivery → Delivered`.

### For Admins
- Analytics dashboard built on Chart.js — revenue, orders, top restaurants/dishes, platform-wide metrics.
- CRUD screens for users, restaurants, menus, categories, and coupons.
- Order monitoring with admin cancellation and **authorized emergency status overrides** (a reason is mandatory, and every override is logged).
- Delivery management: pick an available rider, dispatch them to an order, and watch active deliveries in real time.
- Review and payment administration with visibility across the whole platform.

---

## How An Order Travels

```
Customer places order (Pending)
        │
        ▼
Owner confirms → starts preparing → marks Ready for Pickup
                                            │
                                            ▼
Admin assigns an available delivery partner (Assigned)
        │
        ▼
Rider picks up from the restaurant (Picked Up)
        │
        ▼
Rider is in transit (Out for Delivery)
        │
        ▼
Rider confirms drop-off (Delivered)
```

Every transition is validated on the backend before it touches the database:

- Owners can only move `Confirmed → Preparing → Ready for Pickup`, and can cancel only while `Pending`.
- Riders can only advance their own assigned deliveries through the pickup → transit → drop-off steps.
- Customers can cancel on their own while the order is `Pending` or `Confirmed`.
- Admins can cancel, or do a controlled *override* to any valid state — but it records who, when, and why in the audit log. No silent bypasses.

---

## Tech Stack

**Backend**
- ASP.NET Core 8 Web API, C#
- EF Core 8 + SQL Server
- JWT Bearer auth, BCrypt password hashing, claims-based role authorization
- Swagger / OpenAPI docs (Swashbuckle)

**Frontend**
- Angular (standalone components), TypeScript, RxJS, Signals
- SCSS, Bootstrap 5, Angular Material icons, FontAwesome
- ngx-toastr + SweetAlert2 for feedback
- Chart.js + ng2-charts for admin analytics
- Leaflet for map-based views

---

## Project Layout

```
QuickEats/
├── backend/QuickEats.API/QuickEats.API/
│   ├── Controllers/        # REST endpoints, grouped by domain
│   ├── Services/           # Business logic (+ interfaces)
│   ├── Repositories/       # EF Core data access (+ interfaces)
│   ├── Models/             # EF entities
│   ├── DTOs/               # Request/response models
│   ├── Data/               # AppDbContext, seeding, demo data polisher
│   ├── Migrations/         # EF Core migrations
│   ├── Middleware/         # Global JSON exception handling
│   └── wwwroot/uploads/    # Static images (restaurants, menus)
│
├── frontend/quickeats-web/
│   └── src/app/
│       ├── core/           # Auth/http services, models, interceptors
│       ├── features/
│       │   ├── customer/   # home, restaurants, cart, checkout, orders,
│       │   │               # tracking, payments, wishlist, favorites,
│       │   │               # coupons, notifications, reviews, addresses
│       │   ├── owner/      # dashboard, restaurants, menu CRUD, kitchen, reviews
│       │   ├── delivery-partner/  # rider dashboard, deliveries, history
│       │   ├── admin/      # analytics, users, restaurants, dispatch, coupons
│       │   └── auth/       # login & registration
│       ├── guards/         # route guards per role
│       ├── interceptors/   # JWT injection + error handling
│       ├── layout/         # main, customer, admin, rider layouts
│       └── shared/         # header, footer, nav components
│
├── database/
│   ├── scripts/            # standalone SQL (restaurant coordinates, etc.)
│   └── seed-data/          # demo orders/deliveries seeder
├── docs/                   # API, architecture, and database documentation
├── screenshots/            # UI screenshots
├── QuickEats_Somee_Data_Import.sql   # full SQL import for Somee hosting
└── QuickEats-Publish/      # compiled binaries used for the Somee deployment
```

---

## Running It Locally

### What you need

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 / v20 / v22 LTS) + npm
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express, or standard)

### Backend

```bash
cd backend/QuickEats.API/QuickEats.API

# 1. Set the JWT secret. It must be at least 32 characters, the API refuses to start without it.
dotnet user-secrets set "Jwt:Key" "YourSuperSecretKeyThatIsWayLongerThan32Characters!!"

# 2. Point it at your SQL Server
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=(localdb)\MSSQLLocalDB;Database=QuickEatsDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"

# 3. Apply the migrations and run
dotnet ef database update
dotnet run
```

API comes up at `http://localhost:5243`, Swagger at `http://localhost:5243/swagger`. On first startup it seeds demo accounts, restaurants, menu items, and delivery data automatically.

### Frontend

```bash
cd frontend/quickeats-web
npm install
npm start
```

Open `http://localhost:4200`. During development the Angular dev server proxies `/api` calls to `http://localhost:5243` (see `proxy.conf.json`).

---

## API Endpoints Cheat Sheet

The full documentation lives in Swagger, but here are the ones you'll use most:

| Method | Endpoint | Access | What it does |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/Auth/register` | Public | Register a Customer or Owner |
| `POST` | `/api/Auth/login` | Public | Login → returns a JWT |
| `GET` | `/api/Restaurant` | Public | All active restaurants |
| `GET` | `/api/Restaurant/featured` | Public | Featured restaurants |
| `GET` | `/api/Restaurant/recommended` | Public | Top-rated recommendations |
| `GET` | `/api/Restaurant/nearby` | Public | Near a lat/lng, sorted by distance |
| `GET` | `/api/Restaurant/mine` | Owner | Owner's own restaurants |
| `GET` | `/api/Menu/trending` | Public | Best-selling dishes |
| `GET` | `/api/Menu/restaurant/{id}` | Public | Menu for a restaurant |
| `POST` | `/api/Order` | Customer | Place an order |
| `GET` | `/api/Order/user/{userId}` | Customer/Admin | A user's orders |
| `GET` | `/api/Order/owner` | Owner | Kitchen order queue (owner-scoped) |
| `PUT` | `/api/Order/{id}` | Owner | Advance: Confirmed / Preparing / Ready for Pickup |
| `PATCH` | `/api/Order/{id}/cancel` | Customer | Self-cancel (Pending/Confirmed only) |
| `POST` | `/api/Order/{id}/admin-cancel` | Admin | Cancel as admin |
| `POST` | `/api/Order/{id}/override` | Admin | Audited status override (reason required) |
| `POST` | `/api/OrderDelivery` | Admin | Dispatch a rider to an order |
| `GET` | `/api/OrderDelivery/partner` | DeliveryPartner | Logged-in rider's assigned deliveries |
| `PUT` | `/api/OrderDelivery/{id}` | DeliveryPartner | Advance: Picked Up / Out for Delivery / Delivered |
| `POST` | `/api/Payment` | Customer | Create a payment record |
| `GET` | `/api/Review/restaurant/{id}` | Public | Reviews for a restaurant |
| `POST` | `/api/Review` | Customer | Review a delivered order |
| `GET` | `/api/Favorite` | Customer | Favorite restaurants |
| `GET` | `/api/Wishlist` | Customer | Wishlisted dishes |
| `GET` | `/api/Dashboard` | Admin | Platform analytics & KPIs |
| `POST` | `/api/Image/upload/{category}` | Auth | Upload restaurant/menu/profile images |

---

## Why I built it this way (the short version)

Three things mattered more than anything else while I was doing this:

1. **Data isolation between roles.** It's terrifying when an owner can see someone else's revenue. So every owner query is scoped at the repository layer (`Restaurant.OwnerId == currentUserId`), and order lookups are role-aware everywhere — customers see their orders, owners see their restaurants' orders, riders see their assigned deliveries. Nobody sees anything else.

2. **A state machine that's actually enforced.** It would've been easy to let the frontend just change a status string, but the backend validates every single transition. The admin override exists for real-world edge cases, but it's additive and fully audited.

3. **Deployment that behaves.** The frontend lives on Netlify and uses reverse-proxy rewrite rules (`netlify.toml`) to forward `/api/*` to the Somee-hosted backend — which kills CORS headaches. Images that come with the app are bundled into the Netlify build and served statically, while user uploads go through the API.

If you spot anything you'd improve, the issues tab is open. Feedback (of the kind, not the angry) is welcome.

---

## License

MIT. See [LICENSE](LICENSE).