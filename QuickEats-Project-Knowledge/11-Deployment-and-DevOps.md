# QuickEats - Deployment & DevOps Guide

## 1. Overview & Cloud Topography
QuickEats is deployed across a decoupled multi-cloud architecture:
- **Frontend Client:** Deployed on **Netlify Edge CDN** with automated SSL and SPA routing rules.
- **Backend API:** Hosted on **Somee Cloud Windows Server** running IIS with the .NET 8 In-Process hosting model.
- **Database:** **Microsoft SQL Server 2022** instance managed on Somee's database tier.

```mermaid
graph LR
    User[End User Browser] --> Netlify[Netlify Edge CDN<br>https://quickeats-web.netlify.app]
    Netlify -- API Calls (CORS) --> SomeeIIS[Somee IIS Server (.NET 8)<br>https://quickeats.somee.com/api]
    SomeeIIS -- TCP/IP SQL Protocol --> MSSQL[(Remote MS SQL Server<br>QuickEatsDB.mssql.somee.com)]
```

---

## 2. Frontend Deployment (Netlify)

### 2.1 Build Configuration
- **Build Command:** `npm run build`
- **Output Directory:** `dist/quickeats-web/browser`
- **Environment Configuration (`environment.prod.ts`):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://quickeats.somee.com/api'
};
```

### 2.2 SPA Routing Rewrite (`_redirects`)
Because Angular is a Single Page Application (SPA), direct browser navigation to deep routes (e.g. `/restaurants` or `/cart`) will cause IIS / Netlify to look for physical directories and return `404 Not Found`.
To resolve this, the `public/_redirects` file is published:
```text
/*    /index.html   200
```
This instructs Netlify to serve `index.html` with an HTTP 200 status code for all routes, allowing the Angular router to resolve the route in the browser.

---

## 3. Backend Deployment (Somee IIS)

### 3.1 Build Command:
```bash
dotnet publish backend/QuickEats.API/QuickEats.API/QuickEats.API.csproj -c Release -o ./publish-output
```

### 3.2 IIS Web.config Configuration:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <location path="." inheritInChildApplications="false">
    <system.webServer>
      <handlers>
        <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
      </handlers>
      <aspNetCore processPath="dotnet" 
                  arguments=".\QuickEats.API.dll" 
                  stdoutLogEnabled="false" 
                  stdoutLogFile=".\logs\stdout" 
                  hostingModel="inprocess">
        <environmentVariables>
          <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
        </environmentVariables>
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
```

### Why `hostingModel="inprocess"`?
In-process hosting runs the ASP.NET Core application inside the IIS worker process (`w3wp.exe`). This bypasses the loopback network adapter and HTTP proxy overhead, providing significantly lower response latency compared to out-of-process reverse proxying.

---

## 4. Cross-Origin Resource Sharing (CORS) Configuration

In `Program.cs`, the CORS policy is configured to allow requests from the live Netlify frontend and local development servers:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowQuickEatsClients", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200",
            "https://quickeats-web.netlify.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// Placed before UseAuthentication
app.UseCors("AllowQuickEatsClients");
```

---

## 5. DevOps & Repository Hygiene

1. **Excluding Compiled Binaries:** Build artifacts, temporary DLLs, and publish output folders are excluded from Git:
   ```gitignore
   bin/
   obj/
   QuickEats-Publish/
   **/publish/
   dist/
   node_modules/
   ```
2. **Environment Variable Protection:** Connection strings and JWT secrets are managed via environment variables or secure app settings in production, avoiding hardcoded credentials in public source repositories.

---

## 6. Interview Talking Points

### Q1: Why did your deep links return 404 when refreshed on Netlify before adding `_redirects`?
**Answer:** In client-side routing (SPAs), the browser URL changes without a full page reload. When a user presses F5 or visits `https://quickeats-web.netlify.app/restaurants` directly, the web server checks its file system for a physical file at `/restaurants/index.html`. Since that file doesn't exist, it returns a 404. Adding `/* /index.html 200` redirects all requests back to `index.html`, allowing Angular's client-side router to parse the path.

### Q2: How does the in-process hosting model in IIS improve performance?
**Answer:** With out-of-process hosting, IIS acts as a reverse proxy, forwarding requests over an internal TCP port to Kestrel. In-process hosting loads the ASP.NET Core runtime directly inside `w3wp.exe`, eliminating inter-process network communication and reducing latency.
