# QuickEats - Local Setup & Development Guide

## 1. Prerequisites & Environment
Ensure you have the following tools installed on your development workstation:
- **.NET 8 SDK** (`dotnet --version` >= 8.0.0)
- **Node.js** (`node -v` >= 20.0.0) and **npm** (`npm -v` >= 10.0.0)
- **Angular CLI** (`npm install -g @angular/cli@21`)
- **SQL Server / LocalDB** (or SQL Server Express)
- **IDE:** Visual Studio 2022 (with ASP.NET workload) or Visual Studio Code (with C# Dev Kit and Angular Language Service)

---

## 2. Backend Setup (.NET 8 Web API)

### 2.1 Clone and Navigate
```bash
git clone https://github.com/Mrudula1208/QuickEats.git
cd QuickEats/backend/QuickEats.API
```

### 2.2 Configure Connection String (`appsettings.Development.json`)
Create or edit `QuickEats.API/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=QuickEatsDevDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "SuperSecretQuickEatsJwtSigningKeyForDev2026!",
    "Issuer": "QuickEatsAPI",
    "Audience": "QuickEatsClient",
    "ExpiresInMinutes": 120
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### 2.3 Restore & Run Tests
```bash
dotnet restore
dotnet test QuickEats.API.sln
```
*(All 21 backend unit tests should pass).*

### 2.4 Apply Database Migrations & Run
```bash
# Run migrations (if using local database)
dotnet ef database update --project QuickEats.API

# Start API dev server
dotnet run --project QuickEats.API/QuickEats.API.csproj
```
- **Swagger Documentation:** `https://localhost:7085/swagger`
- **HTTP Endpoint:** `http://localhost:5222`

---

## 3. Frontend Setup (Angular 21)

### 3.1 Navigate and Install Dependencies
```bash
cd QuickEats/frontend/quickeats-web
npm install
```

### 3.2 Verify Frontend Tests
```bash
npm test -- --watch=false
```
*(All 45 test files should pass).*

### 3.3 Configure Local Environment (`src/environments/environment.development.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7085/api'
};
```

### 3.4 Launch Development Server
```bash
npm start
# or: ng serve --port 4200 --open
```
- Open `http://localhost:4200` in your web browser.

---

## 4. Default Demo Accounts for Testing

The API automatically seeds the following credentials via `DemoDataPolisher` during startup:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Customer** | `customer@gmail.com` | `Password@123` | Storefront, Cart, Checkout, Saved Addresses, Order Tracking, Reviews |
| **Restaurant Owner** | `owner@gmail.com` | `Owner@123` | Owner Dashboard, Menu Management, Kitchen Queue (`Confirmed`, `Preparing`) |
| **Delivery Partner** | `rider@gmail.com` | `Password@123` | Rider Dashboard, Assigned Deliveries, Delivery Status Progression |
| **Admin** | `admin@gmail.com` | `Admin@123` | Platform Analytics, User Directory, Rider Dispatch, Emergency Override |

---

## 5. Common Troubleshooting & FAQs

### Issue 1: CORS Error in Browser Console (`Access-Control-Allow-Origin missing`)
- **Fix:** Verify that the frontend origin (`http://localhost:4200`) is in the CORS policy inside `Program.cs`. Ensure `app.UseCors(...)` appears before `app.UseAuthentication()`.

### Issue 2: SSL Certificate Warning on `localhost:7085`
- **Fix:** Trust the ASP.NET Core developer certificate by running:
  ```bash
  dotnet dev-certs https --trust
  ```

### Issue 3: Port Collision (Port 4200 or 7085 already in use)
- **Fix:** Run Angular on a custom port:
  ```bash
  ng serve --port 4300
  ```
