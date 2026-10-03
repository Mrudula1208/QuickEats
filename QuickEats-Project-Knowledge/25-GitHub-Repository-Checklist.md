# QuickEats - GitHub Repository & Recruiter Presentation Checklist

## 1. Overview
Recruiters and hiring managers spend an average of **60 seconds** reviewing a GitHub repository. Having clean documentation, badges, architecture diagrams, and zero build clutter instantly signals high engineering maturity.

---

## 2. GitHub Repository Presentation Checklist

### 2.1 README.md Essentials
- [x] **Project Banner & Badges:** Include status badges:
  - `![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)`
  - `![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)`
  - `![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen)`
  - `![License](https://img.shields.io/badge/License-MIT-blue.svg)`
- [x] **Live Demo Links:** Prominently feature:
  - **Live Web App:** [https://quickeats-web.netlify.app](https://quickeats-web.netlify.app)
  - **Live Swagger API:** [https://quickeats.somee.com/swagger](https://quickeats.somee.com/swagger)
- [x] **Screenshots & GIF Walkthroughs:** Include high-resolution screenshots of the Homepage, Restaurant Menu, and Cart.
- [x] **Architecture Diagram:** Embed the Mermaid clean architecture and state machine diagrams.
- [x] **Features by Persona:** Clearly delineate workflows for Customer, Owner, Rider, and Admin.
- [x] **Quickstart Instructions:** Provide exact copy-paste terminal commands to run both backend and frontend locally.
- [x] **Default Test Accounts:** Provide test credentials table for all 4 roles.

---

### 2.2 Repository Hygiene & Cleanliness
- [x] **No Compiled Binaries:** Verify that `bin/`, `obj/`, `dist/`, and publish folders are completely excluded from Git tracking via `.gitignore`.
- [x] **No Committed Secrets:** Verify no passwords, production connection strings, or private JWT secrets are committed in source code.
- [x] **Meaningful Commit Messages:** Use conventional commit formatting:
  - `feat: implement order lifecycle finite state machine`
  - `fix: allow public browsing of restaurant menus for owners`
  - `test: add 21 unit tests with xUnit and Moq`
  - `perf: optimize catalog reads with EF Core AsNoTracking`

---

### 2.3 Key Repository Metadata
- [x] **Repository About Section:**
  - Description: *"Full-stack food ordering platform built with ASP.NET Core 8 Web API, Angular 21 (Signals & Standalone), SQL Server, and Vitest/xUnit testing."*
  - Topics / Tags: `aspnetcore`, `dotnet8`, `angular`, `typescript`, `entity-framework-core`, `jwt-authentication`, `vitest`, `xunit`, `clean-architecture`
- [x] **Open Source License:** Include standard MIT License file (`LICENSE`).

---

## 3. Recommended Root README.md Template

```markdown
# ðŸ ³ QuickEats - Modern Food Ordering & Delivery Platform

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Tests Passing](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen)](#automated-testing)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?logo=netlify&logoColor=white)](https://quickeats-web.netlify.app)

> A production-ready, full-stack food ordering and delivery system engineered with **ASP.NET Core 8 Web API**, **Angular 21 (Signals & Standalone Components)**, **Entity Framework Core 8**, and **Microsoft SQL Server**.

---

## âœ¨ Key Features
- **Multi-Role Workflows:** Dedicated portals for Customers, Restaurant Owners, Delivery Partners, and Admins.
- **Smart Recommendations:** Intelligent scoring engine utilizing customer order affinity and Haversine geospatial proximity.
- **Order State Machine:** Deterministic finite state machine enforcing strict lifecycle transitions.
- **Modern Security:** Stateless JWT authentication (HMAC-SHA256) and salted BCrypt password hashing.
- **Reactive Cart:** Zero-overhead client-side state management using native Angular Signals.

---

## ðŸš€ Live Demo
- **Frontend App:** [https://quickeats-web.netlify.app](https://quickeats-web.netlify.app)
- **API Documentation:** [https://quickeats.somee.com/swagger](https://quickeats.somee.com/swagger)

---

## 🧪 Automated Testing
- **Backend:** 48 unit tests (`xUnit` + `Moq`) covering crypto helpers, order state machine, price tampering protection, and delivery dispatch (`dotnet test QuickEats.API.sln`).
- **Frontend:** 45 test files / 46 specs (`Vitest`) covering standalone components and guards (`npm test -- --watch=false`).

---

## 👥 Demo Accounts
| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@gmail.com` | `Password@123` |
| **Restaurant Owner** | `owner@gmail.com` | `Owner@123` |
| **Delivery Partner** | `rider@gmail.com` | `Password@123` |
| **Admin** | `admin@gmail.com` | `Admin@123` |
```
