# QuickEats - Security Audit & Best Practices Guide

## 1. Executive Security Summary
Security in QuickEats is designed around defense-in-depth principles:
- **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256.
- **Password Protection:** Cryptographic hashing with `BCrypt.Net-Next` (work factor 11+, unique 128-bit salt per user).
- **Authorization & Access Control:** Strict Role-Based Access Control (RBAC) + Resource-level Ownership Verification (anti-IDOR).
- **Data Protection:** Parameterized EF Core queries immune to SQL Injection.
- **Exception Sanitization:** Centralized error masking preventing stack trace leakage.

---

## 2. Threat Modeling & Mitigation Matrix

| Threat Category | Potential Attack Vector | QuickEats Defense Implementation |
|---|---|---|
| **Broken Authentication** | Credential stuffing, brute force | Passwords hashed using slow BCrypt; JWT expiration verified with `ClockSkew = TimeSpan.Zero`. |
| **Broken Object Level Auth (BOLA / IDOR)** | Owner A modifies Owner B's restaurant | Controller verifies `restaurant.OwnerId == currentUserId` before write operations. |
| **SQL Injection** | Malicious input in search or login | Entity Framework Core LINQ queries generate parameterized SQL queries automatically. |
| **Sensitive Data Exposure** | Stack traces leaking DB credentials | `ExceptionMiddleware` catches internal errors and returns sanitized `ApiErrorResponse`. |
| **Cross-Origin Abuse (CORS)** | Malicious third-party site invoking API | `AddCors` explicitly whitelists approved domains (`quickeats-web.netlify.app`). |
| **Token Replay / Modification** | Tampering with role claim in token | Cryptographic HMAC-SHA256 signature verification rejects any modified payload. |

---

## 3. IDOR (Insecure Direct Object Reference) Prevention

A common security vulnerability in junior developer projects is checking only the user's role without verifying resource ownership.

### Incorrect Pattern (Vulnerable to IDOR):
```csharp
// VULNERABLE: Any user with the "Owner" role can delete ANY restaurant!
[HttpDelete("{id}")]
[Authorize(Roles = "Owner")]
public async Task<IActionResult> DeleteRestaurant(int id)
{
    await _restaurantService.DeleteAsync(id);
    return NoContent();
}
```

### QuickEats Secure Pattern:
```csharp
// SECURE: Checks that the authenticated user owns this specific restaurant
[HttpDelete("{id}")]
[Authorize(Roles = "Owner,Admin")]
public async Task<IActionResult> Delete(int id)
{
    var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var restaurant = await _restaurantRepository.GetByIdAsync(id);

    if (restaurant == null)
    {
        return NotFound();
    }

    // Admins can manage any restaurant; Owners can only manage their own
    if (restaurant.OwnerId != currentUserId && !User.IsInRole("Admin"))
    {
        return Forbid(); // HTTP 403 Forbidden
    }

    await _restaurantService.DeleteAsync(id);
    return NoContent();
}
```

---

## 4. Input Validation & Bounds Checking

To prevent Denial of Service (DoS) from unbounded queries or arithmetic overflow, input parameters are strictly validated:

```csharp
// Geospatial input sanitization in RestaurantService.cs
if (latitude is < -90 or > 90)
    throw new BadRequestException("Latitude must be between -90 and 90.");

if (longitude is < -180 or > 180)
    throw new BadRequestException("Longitude must be between -180 and 180.");

if (radiusKm <= 0 || radiusKm > 100)
    throw new BadRequestException("Radius must be greater than 0 and at most 100 km.");
```

---

## 5. Security Checklist for Production Deployment

- [x] Passwords salted and hashed with BCrypt.
- [x] JWT tokens signed with a 256-bit+ secure secret.
- [x] CORS policies restricted to production and local dev origins.
- [x] EF Core parameterized queries used for all database communication.
- [x] Centralized error middleware enabled; detailed error details disabled in production.
- [x] Account deactivation check (`IsActive`) verified at login time.
- [x] Customer order cancellation restricted to pre-kitchen stages (`Pending`, `Confirmed`).

---

## 6. Interview Talking Points

### Q1: What is an IDOR vulnerability, and how did you prevent it?
**Answer:** IDOR (Insecure Direct Object Reference) occurs when an application exposes a reference to an internal object (such as an order ID or restaurant ID) without validating that the authenticated user actually owns that object. In QuickEats, whenever an Owner or Customer performs an update or delete, the backend extracts the `NameIdentifier` claim from the verified JWT and compares it against `entity.OwnerId` or `order.UserId`. If they don't match and the user isn't an Admin, the API returns `403 Forbidden`.

### Q2: Why is HMAC-SHA256 secure for JWT tokens?
**Answer:** HMAC-SHA256 is a symmetric keyed-hash message authentication algorithm. The server combines the JWT header and payload with a secret server-side key to generate a signature. If an attacker modifies any character in the payload (like changing `"role": "Customer"` to `"role": "Admin"`), the resulting hash will not match the signature, causing ASP.NET Core's `JwtBearer` middleware to immediately reject the request as unauthorized.
