# QuickEats — Executive Project Summary

## 1. Project Overview

**QuickEats** is a full-stack, enterprise-grade multi-role food delivery platform designed to connect customers, restaurant owners, delivery partners, and platform administrators. Built using **.NET 8 Web API** and **Angular (v21 / Standalone Components)**, the system manages the complete lifecycle of online food ordering—from restaurant discovery and menu customization to real-time cart calculation, coupon discounts, order state management, and delivery tracking.

- **Live Frontend (Netlify):** [https://quickeats-web.netlify.app](https://quickeats-web.netlify.app)
- **Live Backend API (Somee):** `https://quickeats.somee.com/api`
- **Architecture Style:** 3-Tier Layered Architecture (Controllers ➔ Services ➔ Repositories ➔ Entity Framework Core)
- **Primary Database:** Microsoft SQL Server with Entity Framework Core 8.0
- **Authentication:** Stateless JSON Web Tokens (JWT) + BCrypt Password Hashing

---

## 2. Key Problem Solved

Traditional food ordering systems struggle with complex role management, stale inventory during peak hours, and brittle multi-stage order lifecycles. QuickEats solves these problems through:
1. **Role-Based Isolation:** 4 distinct user roles (`Customer`, `Owner`, `DeliveryPartner`, `Admin`) with tailored dashboards, guarded routes, and fine-grained endpoint authorization.
2. **Order Lifecycle State Machine:** Enforced state progression (`Pending` ➔ `Confirmed` ➔ `Preparing` ➔ `Ready for Pickup` ➔ `Assigned` ➔ `Picked Up` ➔ `Out for Delivery` ➔ `Delivered`) that prevents illegal status jumps. Platform Admins dispatch ready orders to active delivery partners, who then sequentially advance delivery states.
3. **Smart Restaurant Discovery:** Dual-mode recommendation engine utilizing actual customer order history, cuisine preferences, real review ratings, and geospatial Haversine distance calculations.
4. **Resilient Frontend Experience:** Standalone Angular architecture with reactive signals, interceptor-based JWT injection, automated retry logic, and toast feedback.

> [!NOTE]
> **Runtime vs. Future Roadmap:** Technologies like **Redis** (distributed caching), **RabbitMQ** (event bus / asynchronous messaging), and **SignalR** (real-time WebSockets) are planned future enhancements (detailed in [System Design Deep Dive](file:///c:/Users/manal/OneDrive/Desktop/QuickEats/QuickEats-Project-Knowledge/17-System-Design-Deep-Dive.md) and [Future Enhancements Roadmap](file:///c:/Users/manal/OneDrive/Desktop/QuickEats/QuickEats-Project-Knowledge/24-Future-Enhancements-Roadmap.md)). They are **not** present in the current production runtime, which uses SQL Server persistence and standard RESTful HTTP endpoints.

---

## 3. Technology Stack Breakdown

| Layer | Technologies & Libraries | Purpose |
| :--- | :--- | :--- |
| **Backend API** | C#, .NET 8, ASP.NET Core Web API | High-performance, scalable RESTful API endpoints |
| **ORM & Data** | Entity Framework Core 8, SQL Server | Relational database modeling, migrations, and queries |
| **Security** | JWT Bearer Authentication, BCrypt.Net-Next | Secure token-based auth and one-way salted password hashing |
| **Frontend** | Angular 21, TypeScript, HTML5, Vanilla SCSS | Modern reactive single-page application (SPA) |
| **State & HTTP** | Angular Signals, RxJS, HttpClient | Reactive state management and asynchronous API calls |
| **Testing** | xUnit, Moq, Vitest / Angular Build Unit Test | Comprehensive unit testing across both tiers (100% pass) |
| **Documentation** | Swagger / OpenAPI (Swashbuckle) | Interactive API exploration and client contracts |
| **Hosting** | Somee (Windows / IIS), Netlify (SPA static edge) | Cloud deployment and global distribution |

---

## 4. Key Metrics & Codebase Statistics

- **Backend Endpoints:** 97 distinct REST endpoints across 17 controllers.
- **Database Tables (Entities):** 16 relational entities mapped via EF Core `AppDbContext`.
- **Frontend Pages/Components:** 30+ standalone views, layouts, and reusable components.
- **Backend Unit Tests:** 48 automated unit tests across `OrderService`, `OrderDeliveryService`, and `PasswordHasher` (xUnit + Moq).
- **Frontend Unit Tests:** 45 test suites (46 tests) verified passing via Vitest.
- **Build Quality:** Zero compiler warnings, zero build errors.

---

## 5. High-Level System Architecture

```text
  +-----------------------------------------------------------------------+
  |                        Angular Client (Netlify)                       |
  |  - Customer Portal   - Restaurant Owner Panel   - Admin Dashboard     |
  |  - Delivery Hub      - Reactive Signals         - Auth Interceptor    |
  +-----------------------------------+-----------------------------------+
                                      |
                           HTTPS REST Calls (JSON)
                           Bearer JWT Authorization
                                      |
                                      v
  +-----------------------------------------------------------------------+
  |                   ASP.NET Core .NET 8 Web API (Somee)                 |
  |                                                                       |
  |  [ Controllers Layer ]  --> 17 Controllers (HTTP routing, status)     |
  |            |                                                          |
  |  [ Services Layer ]     --> Business rules, calculations, validation  |
  |            |                                                          |
  |  [ Repositories Layer ] --> Data access abstraction (.AsNoTracking)   |
  |            |                                                          |
  |  [ Entity Framework ]   --> AppDbContext (Change tracker & mapping)   |
  +-----------------------------------+-----------------------------------+
                                      |
                                  ADO.NET /
                                  SQL TDS
                                      |
                                      v
  +-----------------------------------------------------------------------+
  |                       Microsoft SQL Server                            |
  |      16 Tables (Users, Restaurants, MenuItems, Orders, Reviews, etc.) |
  +-----------------------------------------------------------------------+
```

---

## 6. Project Value for Freshers

This project demonstrates core competencies sought by hiring managers in junior-to-mid level .NET developers:
1. **Clean Code & Separation of Concerns:** Strict adherence to 3-tier layering without mixing database logic into controllers.
2. **Real-world Business Logic:** Multi-step discount calculation, address management, and coupon validation.
3. **Defensive Coding:** Custom exceptions (`NotFoundException`, `BadRequestException`, `ForbiddenException`) handled consistently.
4. **Modern Testing Skills:** Both unit test suites are fully passing and verified against mock interfaces.
