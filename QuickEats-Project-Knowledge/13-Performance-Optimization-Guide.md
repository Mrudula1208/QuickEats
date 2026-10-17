# QuickEats - Performance Optimization Guide

## 1. Overview & High-Throughput Goals
Food delivery applications experience massive traffic spikes during meal times (lunch 12:00-14:00 and dinner 19:00-22:00). High concurrency requires responsive APIs and minimal server memory overhead.
QuickEats applies optimization across every layer: database queries, web server threads, and frontend DOM rendering.

---

## 2. Entity Framework Core Query Optimizations

### 2.1 Disabling Change Tracking with `.AsNoTracking()`
By default, EF Core tracks all retrieved entities inside its internal `ChangeTracker` snapshot graph. For read-only queries (browsing restaurants, menus, or customer order histories), this tracking creates substantial CPU and memory overhead.

#### Optimization Applied in Repositories:
```csharp
// Before: Overhead of tracking entities that are never modified
return await _context.Restaurants
    .Where(r => r.IsActive)
    .ToListAsync();

// After: High-performance read-only query
return await _context.Restaurants
    .AsNoTracking()
    .Where(r => r.IsActive)
    .ToListAsync();
```

#### Architectural Benefits:
- **Memory Optimization:** Bypasses EF Core `ChangeTracker` snapshot graph maintenance, avoiding unnecessary heap memory allocation for entities that are strictly read-only.
- **Query Throughput:** Decreases CPU processing overhead during entity materialization, improving execution latency on large catalog result sets.

---

### 2.2 Eliminating the N+1 Query Anti-Pattern

In `RestaurantRepository.GetRecommendedAsync()`, computing ratings, order counts, and category tags for restaurants would take multiple database roundtrips if queried naively inside a loop for each restaurant.

#### Batch Aggregation Pattern Applied:
```csharp
// 1. Get all restaurant IDs in one roundtrip
var restaurantIds = activeRestaurants.Select(r => r.Id).ToList();

// 2. Fetch order counts in a single GROUP BY roundtrip
var orderCounts = await _context.Orders
    .Where(o => restaurantIds.Contains(o.RestaurantId))
    .GroupBy(o => o.RestaurantId)
    .Select(g => new { RestaurantId = g.Key, Count = g.Count() })
    .ToDictionaryAsync(x => x.RestaurantId, x => x.Count);

// 3. Fetch review averages in a single GROUP BY roundtrip
var avgRatings = await _context.Reviews
    .Where(rv => restaurantIds.Contains(rv.RestaurantId))
    .GroupBy(rv => rv.RestaurantId)
    .Select(g => new { RestaurantId = g.Key, Avg = g.Average(r => (double)r.Rating) })
    .ToDictionaryAsync(x => x.RestaurantId, x => x.Avg);
```
**Result:** Batched grouped queries fetch metrics across all candidate restaurants simultaneously, avoiding N+1 roundtrips.

---

## 3. Asynchronous Non-Blocking I/O (`async/await`)

ASP.NET Core uses a managed thread pool to process incoming HTTP requests. Calling synchronous methods or blocking on tasks (`.Result` or `.GetAwaiter().GetResult()`) blocks thread pool workers, leading to thread pool starvation and request queuing under load.

### Modernization in `Program.cs`:
```csharp
// Converted entry point to asynchronous Task Main
public static async Task Main(string[] args)
{
    var builder = WebApplication.CreateBuilder(args);
    // ... Service registrations ...

    var app = builder.Build();

    // Async data polishing (non-blocking)
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DemoDataPolisher.PolishDemoDataAsync(db);
    }

    // Async server hosting
    await app.RunAsync();
}
```

---

## 4. Frontend Rendering Optimization (Angular Signals)

In traditional Angular applications, updating a single property in a service can trigger `Zone.js` to run top-down change detection across the entire component tree.

### Angular Signals Optimization:
- In `CartService.ts`, the shopping cart is backed by `cartItems = signal<CartItem[]>([])`.
- When an item is added, only the cart badge and checkout total components update.
- No heavy subscriptions, no unnecessary change detection passes, and smooth rendering.

---

## 5. Architectural Optimization Summary

| Optimization Area | Applied Technique | Verified Code & Architectural Impact |
|---|---|---|
| **Catalog & Read Queries** | `.AsNoTracking()` in Repositories | Applied `AsNoTracking()` to appropriate read-only EF Core queries (`RestaurantRepository`, `MenuRepository`, `OrderRepository`, `ReviewRepository`), eliminating `ChangeTracker` snapshotting overhead. |
| **Recommendation Engine** | Grouped LINQ Aggregations | Aggregated recommendation-related data using grouped LINQ queries (`GroupBy` + `ToDictionaryAsync`) in `RestaurantRepository.GetRecommendedAsync()`, reducing unnecessary database roundtrips. |
| **Thread Pool Utilization** | Pure Non-Blocking `async/await` | Converted application startup and data polishing in `Program.cs` to fully asynchronous calls, avoiding synchronous blocking on worker threads. |
| **Frontend State Flow** | Fine-Grained Angular Signals | Reactive signals (`signal`, `computed`) in `CartService` update only dependent UI elements on cart modifications without triggering full-tree change detection cycles. |

---

## 6. Interview Talking Points

### Q1: What is the N+1 problem, and how did you solve it in QuickEats?
**Answer:** The N+1 problem occurs when an application executes 1 query to retrieve parent entities and then executes N additional queries to fetch related child data for each parent in a loop. In QuickEats' recommendation algorithm, we resolved this by batch-fetching order counts and average ratings in two aggregated `GROUP BY` queries using `.ToDictionaryAsync(x => x.RestaurantId, ...)`. This reduced the database roundtrips from $1 + 2N$ to exactly 3.

### Q2: What does `.AsNoTracking()` do in Entity Framework Core?
**Answer:** By default, EF Core tracks entities in memory so it knows what to save when `SaveChanges()` is called. This involves taking snapshots and maintaining identity maps. When reading data that will only be displayed to the user and never edited in that request, `.AsNoTracking()` disables this snapshotting, yielding significant memory savings and faster query execution.
