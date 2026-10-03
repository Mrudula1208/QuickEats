# QuickEats - Resume Bullet Points & Project Descriptions

## 1. Resume Bullet Points (Tailored for Freshers & Junior Engineers)

### Option A: Full-Stack Developer Focus (Recommended)
- **QuickEats | Full-Stack Food Delivery Platform** (*.NET 8, C#, EF Core, Angular 21, SQL Server, Vitest, xUnit*)
  - Engineered a full-stack, multi-role food ordering platform supporting 4 distinct user workflows (Customer, Restaurant Owner, Delivery Partner, Administrator) across 17 REST controllers and 90+ endpoints.
  - Architected a deterministic Finite State Machine (FSM) in C# to manage the full order lifecycle (`Pending` -> `Delivered`), enforcing business constraints and preventing illegal transitions.
  - Designed and implemented a personalized restaurant recommendation engine combining customer order affinity, real review ratings, and in-memory geospatial Haversine distance calculations.
  - Applied Entity Framework Core `.AsNoTracking()` to read-only queries and aggregated recommendation data using grouped LINQ queries, eliminating N+1 roundtrips and ChangeTracker overhead on catalog reads.
  - Developed a reactive frontend using Angular 21 Standalone Components, Angular Signals for zero-overhead cart state management, and functional route guards.
  - Maintained 100% test pass rate across 58 backend unit tests (xUnit & Moq) and 45 frontend test suites (Vitest).

---

### Option B: Backend .NET / API Focus
- **QuickEats | Backend RESTful API** (*ASP.NET Core 8, EF Core 8, SQL Server, JWT, xUnit, Moq*)
  - Built a high-performance RESTful Web API in ASP.NET Core 8 with N-tier layered clean architecture, dependency injection, and centralized exception handling middleware.
  - Implemented secure stateless authentication using JWT tokens (HMAC-SHA256) and salted BCrypt password hashing, enforcing granular Role-Based Access Control (RBAC).
  - Designed and normalized a relational SQL Server database schema with 15+ tables, foreign key constraints, and EF Core migrations.
  - Established a comprehensive unit testing suite with xUnit and Moq, testing cryptographic security helpers and complex order transition business rules with 100% pass rate.

---

### Option C: Frontend Angular Focus
- **QuickEats | Single Page Web Application** (*Angular 21, TypeScript, Signals, SCSS, Vitest*)
  - Built a modern, responsive Single Page Application (SPA) using Angular 21 Standalone Components, multi-layout routing, and modern SCSS styling.
  - Implemented reactive client-side state management using native Angular Signals (`signal`, `computed`), eliminating global change detection overhead.
  - Configured functional HTTP interceptors for automatic JWT bearer token injection and functional `CanActivateFn` guards for route protection.
  - Configured Vitest test harnesses for standalone components with mock HTTP and router providers, achieving 100% spec pass rate across 45 component test suites.

---

## 2. 100-Word Project Overview (For LinkedIn / Portfolio)

> **QuickEats** is a production-ready, full-stack food ordering and delivery web application developed using **ASP.NET Core 8 Web API** and **Angular 21**. It supports end-to-end workflows for Customers, Restaurant Owners, Delivery Partners, and Admins. Built with an N-tier layered architecture, it features stateless JWT authentication, BCrypt password hashing, an order lifecycle state machine, and a personalized recommendation engine with Haversine distance search. The application is optimized with EF Core `.AsNoTracking()` and Angular Signals, and is verified with 100% automated test coverage across xUnit and Vitest test suites.

---

## 3. Resume Skills Section Checklist

Add these relevant keywords to your technical skills section:
- **Languages:** C#, TypeScript, JavaScript, SQL, HTML5, SCSS
- **Frameworks & Libraries:** ASP.NET Core 8 Web API, Entity Framework Core 8, Angular 21, LINQ, RxJS
- **Security & Architecture:** JWT Authentication, Role-Based Access Control (RBAC), BCrypt, RESTful APIs, Clean Architecture, Finite State Machines (FSM)
- **Testing:** xUnit, Moq, Vitest, Angular TestBed
- **Databases & DevOps:** Microsoft SQL Server, Git, Netlify, IIS, Swagger/OpenAPI
