# QuickEats - Role-Based Access Control (RBAC) Matrix

## 1. Overview
QuickEats enforces strict security boundaries using **Role-Based Access Control (RBAC)** complemented by **Data-Level Ownership Checks (anti-IDOR)**.

### The 5 Access Personas:
1. **Anonymous / Guest:** Unauthenticated public visitors browsing the food catalog.
2. **Customer:** End-users ordering food, saving addresses, and reviewing orders.
3. **Owner:** Restaurant proprietors managing their own restaurants, menus, and incoming kitchen orders.
4. **Delivery Partner (Rider):** Gig workers picking up food and completing doorstep deliveries.
5. **Administrator:** System operators with platform-wide oversight and emergency override capabilities.

---

## 2. Granular Permissions Matrix

| Endpoint Group | Action | Guest | Customer | Owner | Delivery Partner | Admin |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Auth** | Register / Login | âœ… | âœ… | âœ… | âœ… | âœ… |
| **Restaurants** | Browse All / Filter / Nearby | âœ… | âœ… | âœ… | âœ… | âœ… |
| | View Restaurant Details & Menu | âœ… | âœ… | âœ… | âœ… | âœ… |
| | Create New Restaurant | â Œ | â Œ | âœ… | â Œ | âœ… |
| | Edit / Delete Restaurant | â Œ | â Œ | âœ… *(Own only)* | â Œ | âœ… *(Any)* |
| | Toggle Active / Featured Flag | â Œ | â Œ | â Œ | â Œ | âœ… |
| **Menu Items** | Browse Food Items | âœ… | âœ… | âœ… | âœ… | âœ… |
| | Add / Update / Delete Item | â Œ | â Œ | âœ… *(Own only)* | â Œ | âœ… *(Any)* |
| | Toggle Availability In-Stock | â Œ | â Œ | âœ… *(Own only)* | â Œ | âœ… *(Any)* |
| **Cart & Ordering**| Manage Local Cart (Signals) | âœ… | âœ… | â Œ | â Œ | â Œ |
| | Place Order (`POST /api/Order`)| â Œ | âœ… | â Œ | â Œ | â Œ |
| | View Order History | â Œ | âœ… *(Own)* | âœ… *(Own rest.)*| â Œ | âœ… *(All)* |
| | Cancel Order (Pending/Confirmed)| â Œ | âœ… *(Own)* | âœ… *(Own rest.)*| â Œ | âœ… *(Any)* |
| | Update Status to Preparing/Ready| â Œ | â Œ | âœ… *(Own rest.)*| â Œ | âœ… |
| | Emergency Status Override | â Œ | â Œ | â Œ | â Œ | âœ… *(Audited)* |
| **Deliveries** | View All Platform Deliveries | â Œ | â Œ | â Œ | â Œ | âœ… |
| | View Assigned Deliveries | â Œ | â Œ | â Œ | âœ… *(Assigned)* | â Œ |
| | View Delivery Details by ID | â Œ | âœ… *(Own order)* | â Œ | âœ… *(Assigned)* | âœ… |
| | Assign Delivery Partner (`POST`)| â Œ | â Œ | â Œ | â Œ | âœ… |
| | Advance Delivery Status (`PUT`)| â Œ | â Œ | â Œ | âœ… *(Assigned)* | â Œ |
| | Delete Delivery (`DELETE`) | â Œ | â Œ | â Œ | â Œ | âœ… |
| **Reviews & Ratings**| Read Customer Reviews | âœ… | âœ… | âœ… | âœ… | âœ… |
| | Post Review & Star Rating | â Œ | âœ… *(Verified)* | â Œ | â Œ | â Œ |
| | Delete Review | â Œ | â Œ | â Œ | â Œ | âœ… |
| **Saved Addresses**| Manage Address Book | â Œ | âœ… *(Own)* | â Œ | â Œ | â Œ |
| **Wishlist & Favs**| Bookmark Items & Restaurants | â Œ | âœ… *(Own)* | â Œ | â Œ | â Œ |
| **Admin Analytics**| Dashboard Metrics & Users | â Œ | â Œ | â Œ | â Œ | âœ… |

---

## 3. Frontend Route Guard Enforcement

```mermaid
graph TD
    Nav[Route Navigation Request] --> CheckAuth{authGuard: Has Token?}
    CheckAuth -- No --> Login[Redirect to /login]
    CheckAuth -- Yes --> TargetRoute{Target Route Type}

    TargetRoute --> CustomerRoute[Customer Pages]
    CustomerRoute --> Allow[Allow Access]

    TargetRoute --> OwnerRoute[Owner Pages]
    OwnerRoute --> OwnerGuard{ownerGuard: Role == Owner?}
    OwnerGuard -- Yes --> Allow
    OwnerGuard -- No --> Deny[Redirect to /]

    TargetRoute --> AdminRoute[Admin Pages]
    AdminRoute --> AdminGuard{adminGuard: Role == Admin?}
    AdminGuard -- Yes --> Allow
    AdminGuard -- No --> Deny

    TargetRoute --> RiderRoute[Rider Pages]
    RiderRoute --> RiderGuard{deliveryPartnerGuard: Role == DeliveryPartner?}
    RiderGuard -- Yes --> Allow
    RiderGuard -- No --> Deny
```
