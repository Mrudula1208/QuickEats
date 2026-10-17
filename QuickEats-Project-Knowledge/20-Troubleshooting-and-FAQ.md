# QuickEats - Troubleshooting & Frequently Asked Questions (FAQ)

## 1. Frontend Troubleshooting

### Q1: Why does reloading any page other than the homepage on Netlify return a 404 error?
- **Cause:** Netlify is a static web host. When the browser requests `https://quickeats-web.netlify.app/restaurants`, Netlify searches its file system for a file located at `/restaurants/index.html`. Since Angular is an SPA with a single root `index.html`, Netlify returns 404.
- **Solution:** Place a `_redirects` file in the frontend `public/` directory containing:
  ```text
  /*    /index.html   200
  ```
  This rewrites all incoming routes to `index.html` with an HTTP 200 code, allowing the Angular router to parse and render the URL.

### Q2: How do I resolve `NullInjectorError: No provider for HttpClient!` during unit tests?
- **Cause:** Standalone components that inject `HttpClient` or services depending on `HttpClient` require HTTP providers in the test bed.
- **Solution:** Add `provideHttpClient()` and `provideHttpClientTesting()` to the TestBed providers:
  ```typescript
  TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [provideHttpClient(), provideHttpClientTesting()]
  });
  ```

### Q3: Why am I seeing `Access-Control-Allow-Origin` CORS errors in the browser console?
- **Cause:** The backend API has not approved the frontend's origin URL in its CORS policy, or the CORS middleware was placed after the authentication middleware.
- **Solution:** In `backend/QuickEats.API/Program.cs`, ensure `app.UseCors("AllowQuickEatsClients")` is called **before** `app.UseAuthentication()` and `app.UseAuthorization()`, and includes `https://quickeats-web.netlify.app`.

---

## 2. Backend Troubleshooting

### Q4: Why were Restaurant Owners getting 403 Forbidden when trying to view restaurant menus?
- **Cause:** The endpoints `GET /api/Restaurant/{id}` and `GET /api/Menu/restaurant/{restaurantId}` contained an overly strict ownership check:
  ```csharp
  if (User.IsInRole("Owner") && !await IsOwnerOfRestaurant(id)) return Forbid();
  ```
  This mistakenly prevented restaurant owners from acting as regular customers to browse other restaurants.
- **Solution:** Public browsing endpoints should allow any authenticated user to view details. Ownership checks should only guard mutations (POST, PUT, DELETE).

### Q5: How do I resolve `SqlException: Cannot open database requested by the login`?
- **Cause:** The connection string in `appsettings.json` points to an incorrect database name, or the SQL Server instance is stopped.
- **Solution:**
  1. For local development, ensure SQL Server Express or LocalDB is running:
     ```bash
     sqllocaldb start mssqllocaldb
     ```
  2. Verify the connection string in `appsettings.Development.json`.

### Q6: Why does IIS on Somee return `HTTP Error 500.19` or `502.5 Process Failure`?
- **Cause:** Either the .NET 8 Hosting Bundle is missing on the server, or `web.config` has invalid XML/permissions.
- **Solution:**
  - Verify that `web.config` specifies `<aspNetCore processPath="dotnet" arguments=".\QuickEats.API.dll" hostingModel="inprocess" />`.
  - Ensure the target server supports the ASP.NET Core Module v2 (`AspNetCoreModuleV2`).

---

## 3. General Development FAQs

### Q7: How do I trust the ASP.NET Core HTTPS development certificate?
- **Command:**
  ```bash
  dotnet dev-certs https --trust
  ```

### Q8: How can I change the default port for Angular if port 4200 is busy?
- **Command:**
  ```bash
  ng serve --port 4300
  ```
