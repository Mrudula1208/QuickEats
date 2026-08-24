# QuickEats

QuickEats is a full-stack food ordering platform. Customers browse restaurants, order food and track deliveries; restaurant owners manage their menus and incoming orders; admins manage the whole system from a dedicated dashboard. It is built with **ASP.NET Core 8 Web API** and **Angular**.

## Features

### Customer
- Browse restaurants and restaurant menus
- Cart, wishlist and favorites
- Apply discount coupons at checkout
- Checkout with saved delivery addresses
- Payments and payment history
- Order history and order details
- Live-style delivery status tracking per order
- Restaurant reviews and ratings
- In-app notifications
- Profile page

### Restaurant Owner
- Create and manage their own restaurants
- Full menu management (add, edit, delete, toggle item availability)
- View and process incoming orders (accept, update status)
- Owner dashboard with key metrics

### Admin
- Dashboard with platform statistics
- Manage users and restaurant owners
- Approve/manage restaurants and menus across the platform
- Manage categories and coupons
- Monitor orders, payments, deliveries and reviews

### Delivery Partner
- View assigned deliveries
- Update delivery status

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Backend  | ASP.NET Core 8 Web API, Entity Framework Core 8, SQL Server |
| Auth     | JWT bearer authentication, BCrypt password hashing, role-based authorization |
| API docs | Swashbuckle (Swagger), generated XML comments |
| Frontend | Angular 21 (standalone components), TypeScript, RxJS |
| UI       | ngx-toastr, Font Awesome |

## Project Structure

```
QuickEats/
├── backend/QuickEats.API/     # ASP.NET Core REST API
├── frontend/quickeats-web/    # Angular SPA
├── database/                  # Database assets (scripts/backups/seed data)
├── docs/                      # Additional documentation
└── QuickEats.sln              # Visual Studio solution
```

### Backend (`backend/QuickEats.API`)

Layered architecture: Controllers → Services → Repositories → EF Core.

```
QuickEats.API/
├── Controllers/        # REST endpoints (Auth, Restaurant, Menu, Order, Payment,
│                       # OrderDelivery, Coupon, Category, Review, Notification, ...)
├── Services/           # Business logic (+ Interfaces/)
├── Repositories/       # Data access via EF Core (+ Interfaces/)
├── Models/             # EF Core entities (User, Restaurant, MenuItem, Order, Payment, ...)
├── DTos/               # Request/response DTOs grouped by domain
├── Data/               # AppDbContext
├── Migrations/         # EF Core migrations
├── Configuration/      # JwtSettings binding
├── Middleware/         # Global exception handling middleware
├── Logging/           # Logging service
└── wwwroot/uploads/    # Uploaded images served statically (menu, profile, restaurants)
```

### Frontend (`frontend/quickeats-web`)

```
src/app/
├── core/
│   ├── services/       # HTTP services, one per API resource
│   └── models/         # TypeScript interfaces
├── features/
│   ├── customer/       # Home, restaurants, cart, checkout, payment, orders,
│   │                   # tracking, reviews, wishlist, favorites, coupons, ...
│   ├── owner/          # Owner restaurants, menu, orders, dashboard
│   ├── admin/          # Users, owners, categories, coupons, orders, payments, ...
│   ├── auth/           # Login, register
│   └── delivery-partner/
├── guards/             # auth, admin, owner, delivery-partner route guards
├── interceptors/       # JWT token injection, global error handling
├── layout/             # Header, footer, role layouts
└── shared/             # Reusable UI components
```

## Database Setup

The API uses SQL Server through EF Core. Migrations are included in the repository.

1. Install the EF Core CLI if needed:
   ```
   dotnet tool install --global dotnet-ef
   ```
2. From `backend/QuickEats.API/QuickEats.API`, create/update the database:
   ```
   dotnet ef database update
   ```

The default development connection string uses LocalDB:

```
Server=(localdb)\mssqllocaldb;Database=QuickEatsDb;Trusted_Connection=True;MultipleActiveResultSets=true
```

Override it in production with the `ConnectionStrings__DefaultConnection` environment variable.

## Running the Backend

Requirements: [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

1. Set the JWT signing key (at least 32 characters) as a user secret:
   ```
   dotnet user-secrets set "Jwt:Key" "<your-secret-key>"
   ```
2. Run the API (from `backend/QuickEats.API/QuickEats.API`):
   ```
   dotnet run --launch-profile https
   ```
3. The API listens on `https://localhost:7278` and Swagger UI opens automatically in Development.

The application fails fast at startup if `Jwt:Key` is missing or shorter than 32 characters.

## Running the Frontend

Requirements: Node.js 20+ and npm

1. From `frontend/quickeats-web`:
   ```
   npm install
   npm start
   ```
2. Open `http://localhost:4200`.

During development, Angular serves on port 4200 and calls the API directly at `https://localhost:7278`; a dev-server proxy forwards `/uploads` image requests to the API.

Production build:

```
npm run build
```

Output goes to `dist/quickeats-web`.

## Environment Configuration

Never commit real secrets. See [`.env.example`](.env.example).

| Variable | Where | Purpose |
|----------|-------|---------|
| `Jwt:Key` | user-secrets (dev) | JWT signing key, min. 32 chars |
| `Jwt__Key` | environment variable (prod) | Same, for hosted environments |
| `ConnectionStrings__DefaultConnection` | environment variable (prod) | SQL Server connection string |
| `Cors__AllowedOrigins__0...` | environment variable (prod) | Browser origins allowed by CORS |
| `src/environments/environment.ts` | frontend dev | API base URL (`https://localhost:7278/api`) |
| `src/environments/environment.prod.ts` | frontend prod build | API base URL used by the production bundle |

## API Documentation (Swagger)

Swagger UI is enabled in Development only:

```
https://localhost:7278/swagger
```

To test protected endpoints:

1. Call `POST /api/Auth/login` (or use the register endpoint to create an account).
2. Copy the returned token.
3. Click **Authorize** in Swagger and paste the token (without the `Bearer ` prefix).

Every controller is documented with XML comments and response codes.

## User Roles

| Role | Access |
|------|--------|
| Customer | Ordering experience: browse, cart, checkout, pay, track, review |
| Owner | Own restaurants, menus and incoming orders |
| Admin | Full administration of users, restaurants, menus, orders, payments, deliveries, reviews |
| DeliveryPartner | Assigned deliveries and status updates |

Registration creates **Customer** or **Owner** accounts; Admin and DeliveryPartner accounts are managed by an Admin.

Authorization is enforced on both sides: `[Authorize(Roles = ...)]` attributes on the API and Angular route guards (`authGuard`, `adminGuard`, `ownerGuard`, `deliveryPartnerGuard`) in the SPA.

## Main Application Flow

1. A visitor registers (Customer or Owner) or logs in and receives a JWT token stored client-side.
2. Customer browses restaurants, opens a menu, adds items to the cart (or wishlist/favorites).
3. At checkout the customer picks a saved address, applies a coupon if available, and pays.
4. The order is created; the restaurant owner sees it in the owner orders screen and updates its status.
5. A delivery assignment tracks the delivery; the delivery partner updates the delivery status.
6. The customer follows the order/delivery status and can rate/review the restaurant afterwards.
7. Notifications keep the customer informed about order and delivery progress.

## License

This project is licensed under the [MIT License](LICENSE).
