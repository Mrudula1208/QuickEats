# QuickEats — Architecture & Design Patterns

## 1. Architectural Philosophy

QuickEats follows a classic **3-Tier Layered Architecture** (often referred to as N-Tier Architecture). The application explicitly avoids bloated "smart controllers" and direct database querying inside API endpoints. Every request flows sequentially through distinct, decoupled layers with single responsibilities.

```text
[HTTP Request]
      |
      v
+------------------+    Handles HTTP protocol, routing, model binding,
|   Controllers    |    attributes ([Authorize], [AllowAnonymous]),
|                  |    and maps outcomes to HTTP status codes (200, 404, 400).
+--------+---------+
         |
         v
+------------------+    Enforces business rules, entity validations,
|  Service Layer   |    discount calculations, status state machine,
|                  |    and orchestration between multiple repositories.
+--------+---------+
         |
         v
+------------------+    Encapsulates raw database queries, LINQ expressions,
| Repository Layer |    eager loading (.Include), and query optimization
|                  |    (.AsNoTracking).
+--------+---------+
         |
         v
+------------------+    Entity Framework Core DbContext managing database
|   Data / ORM     |    connections, migrations, and change tracking.
+------------------+
```

---

## 2. Key Design Patterns Implemented

### 2.1 The Repository Pattern
- **What it is:** A mediator between the domain/business logic layer and the data mapping layer.
- **Why we use it:** Instead of sprinkling `_context.Restaurants.Where(...)` across various services and controllers, all database queries are centralized inside repositories implementing clean interfaces (`IRestaurantRepository`, `IOrderRepository`, etc.).
- **Benefits:**
  1. Centralizes query logic and optimization (e.g. adding `.AsNoTracking()` in one place benefits all callers).
  2. Enables clean unit testing—services can be tested in isolation by mocking repository interfaces using `Moq` without requiring a live database connection.

### 2.2 The Service (Business Logic) Layer Pattern
- **What it is:** A dedicated domain layer where calculations, security rules, and workflows reside.
- **Why we use it:** Controllers should only know *how to speak HTTP*, not how to calculate GST or enforce an order cancellation cutoff.
- **Example:** In `OrderService.cs`, when placing an order:
  - It validates that every menu item belongs to the selected restaurant.
  - It applies the item-level discount percentage.
  - It initializes the order in `Pending` state.
  - It sends a real-time notification to the customer.

### 2.3 The Data Transfer Object (DTO) Pattern
- **What it is:** Plain C# classes used to pass data between the client and server.
- **Why we use it:**
  - **Security (Over-posting protection):** Prevents malicious clients from modifying fields like `IsAdmin`, `Role`, or `PasswordHash` by binding directly to database models.
  - **Decoupling:** Database tables can change without breaking public API contracts consumed by the Angular frontend.
  - **Performance:** Only the required fields are serialized to JSON instead of large relational object graphs with circular references.

---

## 3. Dependency Injection (DI) Strategy

ASP.NET Core's built-in IoC container is configured in `Program.cs`. All services and repositories are registered with **Scoped** lifetime:

```csharp
// Repositories (Scoped)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRestaurantRepository, RestaurantRepository>();
builder.Services.AddScoped<IMenuRepository, MenuRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// Services (Scoped)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRestaurantService, RestaurantService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IOrderService, OrderService>();
```

### Why `AddScoped`?
- **DbContext Lifetime:** `AppDbContext` is registered by default as **Scoped** (one instance per HTTP request).
- **Service Consistency:** Services and Repositories depend on `AppDbContext`. If a repository were registered as **Transient** or **Singleton**, it would either create unnecessary context instances or cause dangerous multi-threading concurrency issues on `DbContext`. Scoped guarantees one consistent database context per HTTP request pipeline.

---

## 4. Freshers Interview Q&A on Architecture

### Q1: Why didn't you write EF Core queries directly in your Controllers?
> **Answer:** *"Writing database queries directly in controllers violates the Single Responsibility Principle. The controller's job is solely to handle the HTTP transport layer—reading request headers, binding route parameters, and returning appropriate status codes. Moving queries into Repositories and business logic into Services makes the code reusable, maintainable, and allows me to write automated unit tests using Moq without touching a real database."*

### Q2: What is the difference between a Repository and a Service?
> **Answer:** *"A **Repository** is focused purely on data access (CRUD operations, LINQ queries, includes, filtering). A **Service** contains business logic, domain rules, multi-step workflows, and validations. For example, `MenuRepository.GetByIdAsync` simply retrieves a dish row, while `OrderService.CreateAsync` verifies if that dish belongs to the restaurant, checks discount percentages, computes the line item total, saves the order, and dispatches a customer notification."*

### Q3: What is the difference between Transient, Scoped, and Singleton lifetimes?
> **Answer:**
> - **Transient (`AddTransient`):** Created every single time they are requested. Ideal for lightweight, stateless utility classes.
> - **Scoped (`AddScoped`):** Created once per client request (HTTP connection). Standard for database contexts and repositories so operations within the same request share the same transaction/context.
> - **Singleton (`AddSingleton`):** Created once on application startup and shared across all requests. Used for global caches, configuration objects, or logging factories.
