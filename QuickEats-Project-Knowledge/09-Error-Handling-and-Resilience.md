# QuickEats - Error Handling & Resilience Guide

## 1. Overview & Architecture
In production web applications, raw database crashes, null pointer exceptions, and unhandled errors must never leak internal stack traces to end users.
QuickEats implements a **centralized, middleware-driven exception handling pipeline** in ASP.NET Core paired with **reactive toast notifications** in Angular.

```mermaid
graph TD
    Client[Angular Client HTTP Request] --> Pipe[ASP.NET Core Middleware Pipeline]
    Pipe --> ExMid[ExceptionMiddleware (try-catch wrapper)]
    ExMid --> Controller[Controller Action]
    Controller --> Service[Business Service]
    Service --> Exception{Throws Exception?}
    Exception -- No --> Success[200 OK Response]
    Exception -- Yes --> Catch[Caught by ExceptionMiddleware]
    Catch --> Match[Pattern Match Exception Type]
    Match --> 400[BadRequestException -> 400 Bad Request]
    Match --> 401[UnauthorizedAppException -> 401 Unauthorized]
    Match --> 403[ForbiddenException -> 403 Forbidden]
    Match --> 404[NotFoundException -> 404 Not Found]
    Match --> 409[InvalidOperationException -> 409 Conflict]
    Match --> 500[Unhandled Exception -> 500 Sanitized Generic Error]
    500 --> JSON[Serialize ApiErrorResponse JSON]
    JSON --> Client
```

---

## 2. Backend Exception Hierarchy

All custom domain exceptions live in `QuickEats.API.Exceptions` and inherit from `System.Exception`:

```csharp
// BadRequestException.cs
public class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message) { }
}

// NotFoundException.cs
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// ForbiddenException.cs
public class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message) { }
}

// UnauthorizedAppException.cs
public class UnauthorizedAppException : Exception
{
    public UnauthorizedAppException(string message) : base(message) { }
}
```

---

## 3. Global `ExceptionMiddleware` Implementation

Located in `QuickEats.API.Middleware.ExceptionMiddleware`:

```csharp
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            // Log full exception with stack trace internally for developers
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            BadRequestException ex => (HttpStatusCode.BadRequest, ex.Message),
            UnauthorizedAppException ex => (HttpStatusCode.Unauthorized, ex.Message),
            ForbiddenException ex => (HttpStatusCode.Forbidden, ex.Message),
            NotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
            ArgumentException ex => (HttpStatusCode.BadRequest, ex.Message),
            InvalidOperationException ex => (HttpStatusCode.Conflict, ex.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ApiErrorResponse { Message = message };
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
```

Registered as the very first custom middleware in `Program.cs`:
```csharp
app.UseMiddleware<ExceptionMiddleware>();
```

---

## 4. Frontend Error Handling & Toast Alerts

In the Angular application, API errors are gracefully handled using RxJS operators and presented to the user with `ngx-toastr`:

```typescript
// Example: Placing order in checkout.component.ts
this.orderService.createOrder(payload).subscribe({
  next: (orderId) => {
    this.toastr.success(`Order #${orderId} placed successfully!`, 'Success');
    this.cartService.clearCart();
    this.router.navigate(['/order-tracking', orderId]);
  },
  error: (err) => {
    // Extract sanitized backend message or fallback
    const errorMsg = err?.error?.message || 'Failed to place order. Please check your network.';
    this.toastr.error(errorMsg, 'Order Failed');
  }
});
```

---

## 5. Security & Information Leakage Prevention

1. **Stack Trace Hiding:** When an unhandled SQL or C# error occurs (e.g. `SqlException: Timeout expired`), the client only sees:
   ```json
   {
     "message": "An unexpected error occurred. Please try again later."
   }
   ```
2. **Server-Side Diagnostics:** The detailed exception, line numbers, and parameters are captured by `ILogger` on the server for debugging without compromising security.

---

## 6. Interview Talking Points

### Q1: Why use custom middleware instead of try-catch blocks in every controller method?
**Answer:** Putting `try-catch` inside every controller action creates boilerplate code, increases code maintenance overhead, and leads to inconsistent error response payloads. A single centralized `ExceptionMiddleware` adheres to the DRY (Don't Repeat Yourself) principle, guarantees a uniform JSON schema (`ApiErrorResponse`), and ensures that uncaught exceptions are consistently logged and sanitized.

### Q2: What HTTP status code should be returned if a user tries to cancel an order that is already out for delivery?
**Answer:** `400 Bad Request` or `409 Conflict`. In QuickEats, `OrderService` throws `BadRequestException("Cannot cancel order with status 'Out for Delivery'.")`, which the middleware converts directly into an HTTP `400 Bad Request` with the specific message for the UI toast.
