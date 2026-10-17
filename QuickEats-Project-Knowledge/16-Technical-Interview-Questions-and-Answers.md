# QuickEats - Top 25 Technical Interview Questions & Answers

## Category 1: ASP.NET Core & C#

### Q1: What are the three service lifetimes in ASP.NET Core Dependency Injection?
**Answer:**
1. **Transient (`AddTransient`):** A new instance is created every time it is requested from the service container. Used for lightweight, stateless services.
2. **Scoped (`AddScoped`):** Created once per client HTTP request. In QuickEats, `QuickEatsDbContext`, repositories, and services are registered as Scoped so that all operations within a single HTTP request share the same database transaction context.
3. **Singleton (`AddSingleton`):** Created once when the application starts and shared across all requests. Used for caching or configuration classes like `IOptions<JwtSettings>`.

### Q2: How does `async/await` work in ASP.NET Core, and why did you use `Task Main` in `Program.cs`?
**Answer:**
`async/await` enables non-blocking asynchronous programming. When an asynchronous I/O operation (like a database query or network call) starts, the calling thread is freed and returned to the thread pool to handle other incoming HTTP requests. When the operation completes, a thread pool worker resumes execution.
Using `async Task Main` in `Program.cs` ensures that startup initialization (such as `await DemoDataPolisher.PolishDemoDataAsync(db)` and `await app.RunAsync()`) runs asynchronously without blocking the main runtime thread with `.GetAwaiter().GetResult()`, avoiding potential deadlocks.

### Q3: What is the ASP.NET Core Middleware pipeline, and why does middleware order matter?
**Answer:**
Middleware consists of software components assembled into an application pipeline to handle requests and responses. Each component can execute logic before and after passing the request to `_next(context)`.
Order matters critically because requests flow forward and responses flow backward:
1. `UseMiddleware<ExceptionMiddleware>()` must be first to wrap all subsequent operations in a try-catch.
2. `UseCors()` must precede authentication so pre-flight `OPTIONS` requests succeed without credentials.
3. `UseAuthentication()` must run before `UseAuthorization()` so the user identity is validated before permission checks are evaluated.

---

## Category 2: Entity Framework Core

### Q4: What does `.AsNoTracking()` do, and when should you use it?
**Answer:**
In EF Core, the `DbContext` tracks entity changes using an internal `ChangeTracker` snapshot. This consumes memory and CPU.
`.AsNoTracking()` informs EF Core not to track the entities in the results. It should be used on all **read-only operations** (e.g. browsing restaurants, viewing menus, loading order history). In QuickEats, adding `.AsNoTracking()` eliminates `ChangeTracker` snapshotting overhead and reduces memory allocation on high-traffic read operations.

### Q5: What is the difference between Eager Loading, Lazy Loading, and Explicit Loading?
**Answer:**
- **Eager Loading:** Related entities are loaded as part of the initial database query using `.Include()` and `.ThenInclude()`. QuickEats uses eager loading to fetch `OrderItems` and `MenuItem` details in a single SQL `JOIN`.
- **Lazy Loading:** Related entities are automatically loaded on-demand when the navigation property is accessed. (Can easily cause the N+1 query problem).
- **Explicit Loading:** Related entities are loaded explicitly on an already-retrieved entity using `_context.Entry(entity).Collection(...).LoadAsync()`.

### Q6: How do you prevent SQL Injection in EF Core?
**Answer:**
LINQ queries in EF Core automatically use parameterized SQL under the hood. For example:
```csharp
_context.Users.Where(u => u.Email == request.Email)
```
Generates SQL like `SELECT * FROM Users WHERE Email = @p0`, passing the user input as a safe SQL parameter. QuickEats avoids concatenating raw string SQL (`FromSqlRaw("SELECT * FROM ... + input")`), guaranteeing SQL injection immunity.

---

## Category 3: Security & Authentication

### Q7: Explain the anatomy of a JSON Web Token (JWT).
**Answer:**
A JWT consists of three Base64URL-encoded parts separated by periods (`.`):
1. **Header:** Contains algorithm and token type (`{"alg": "HS256", "typ": "JWT"}`).
2. **Payload:** Contains claims (e.g. `NameIdentifier`, `Email`, `Role`, `exp`).
3. **Signature:** Created by hashing Header + Payload with the server's private secret key using HMAC-SHA256. The server validates this signature on every request to ensure the token has not been altered.

### Q8: Why use BCrypt instead of SHA-256 for passwords?
**Answer:**
SHA-256 is designed to be fast, making it vulnerable to brute-force and GPU/ASIC hash cracking (billions of hashes per second). BCrypt has a configurable work factor (iteration count) that makes it intentionally slow and resource-heavy. BCrypt also automatically incorporates a unique cryptographic salt into the hash string, rendering precomputed rainbow table attacks impossible.

### Q9: What is Insecure Direct Object Reference (IDOR), and how is it prevented in QuickEats?
**Answer:**
IDOR occurs when an application accepts a resource ID (e.g. `DELETE /api/Restaurant/5`) and executes the action without checking if the current authenticated user owns that resource.
QuickEats prevents IDOR by extracting the user ID from JWT claims (`User.FindFirstValue(ClaimTypes.NameIdentifier)`) and comparing it against `restaurant.OwnerId`. Non-owners receive a `403 Forbidden` response.

---

## Category 4: Angular 21 & Frontend Architecture

### Q10: What are Angular Standalone Components, and what are their benefits?
**Answer:**
Introduced in Angular 14 and made the default in modern Angular, Standalone Components eliminate `NgModule`. A component declares its own dependencies directly in the `@Component({ imports: [CommonModule, FormsModule, RouterLink] })` decorator.
Benefits include: reduced boilerplate code, faster compilation, easier unit testing, and improved tree-shaking for smaller production bundles.

### Q11: How do Angular Signals work, and how do they differ from RxJS Observables?
**Answer:**
Signals are reactive primitives holding a value that notify consumers when changed.
- **Signals:** Synchronous, value-oriented, no `.subscribe()` or unsubscribe lifecycle cleanup required. Ideal for local and shared state (e.g. shopping cart items, delivery fees).
- **Observables:** Asynchronous streams of events over time. Ideal for HTTP requests, web sockets, and debounced search inputs (`debounceTime`, `switchMap`).

### Q12: How does the functional `HttpInterceptorFn` work in Angular 21?
**Answer:**
Instead of a class implementing `HttpInterceptor`, modern Angular uses a pure function:
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```
It intercepts every outgoing HTTP request, clones it to attach the `Authorization: Bearer` header, and passes it to `next()`.

---

## Category 5: Architecture, Math & System Design

### Q13: What is the Haversine formula, and why is it used in QuickEats?
**Answer:**
The Haversine formula calculates the great-circle distance between two points on the surface of a sphere given their latitude and longitude coordinates.
In QuickEats, when a customer enables location access, the API computes distance in kilometres between the user and nearby restaurants, sorting nearest first within a chosen radius (e.g. 5 km or 10 km).

### Q14: Explain the Order State Machine in QuickEats.
**Answer:**
To prevent invalid business transitions (such as an order moving from `Delivered` back to `Pending`), `OrderService` enforces a legal transition graph:
`Pending` -> `Confirmed` -> `Preparing` -> `Ready for Pickup` -> `Assigned` -> `Picked Up` -> `Out for Delivery` -> `Delivered`.
`Cancelled` is a terminal state that customers or owners can only trigger while the order is in `Pending` or `Confirmed`. Once food is `Preparing`, customer cancellation is rejected to protect restaurant kitchen costs.

### Q15: How does the Recommendation Algorithm work in QuickEats?
**Answer:**
It uses a multi-factor scoring formula:
1. Average review rating (weight: rating x 15 points).
2. Popularity volume (order count x 3, capped at 30 points).
3. Cuisine affinity (+25 points if restaurant matches user's past ordered categories).
4. Delivery affordability (up to 16.6 points for low/free delivery charges).
5. Featured partner bonus (+10 points).
Candidates are ranked descending by score, ensuring personalized, high-quality discovery.
