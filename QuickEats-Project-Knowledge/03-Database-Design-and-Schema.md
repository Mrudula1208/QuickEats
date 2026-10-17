# QuickEats — Database Design & Schema Architecture

## 1. Relational Database Overview

QuickEats uses **Microsoft SQL Server** with **Entity Framework Core 8.0** code-first entity mapping. The database schema is normalized (3NF) to ensure data integrity, eliminate redundancy, and support high-frequency transactions (order placement, status transitions, review submissions).

```text
               +-------------------+
               |       Users       |<----------------------+
               +-------------------+                       |
                 |               |                         |
                 | (1:N)         | (1:N)                   | (1:N)
                 v               v                         |
        +-------------+    +-------------+          +-------------+
        | Restaurants |    |   Reviews   |          |    Orders   |
        +-------------+    +-------------+          +-------------+
               |                 ^                         |
               | (1:N)           |                         | (1:N)
               v                 |                         v
        +-------------+          |                  +-------------+
        |  MenuItems  |          |                  |  OrderItems |
        +-------------+          |                  +-------------+
               ^                 |                         |
               |                 |                         | (1:1)
               |                 |                         v
               |                 |                  +-------------+
               +-----------------+------------------|   Payments  |
                                                    +-------------+
                                                           |
                                                           | (1:1 / 1:N)
                                                           v
                                                    +-----------------+
                                                    | OrderDeliveries |
                                                    +-----------------+
```

---

## 2. Core Entities & Table Schema

### 2.1 `Users` (Authentication & Profile)
| Column | Type | Nullable | Constraints & Purpose |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | No | PK, Identity (1,1) |
| `Name` | `nvarchar(100)` | No | Full display name |
| `Email` | `nvarchar(150)` | No | Unique index, login username |
| `PasswordHash` | `nvarchar(max)` | No | BCrypt one-way salted hash |
| `PhoneNumber` | `nvarchar(20)` | No | Contact number |
| `Role` | `nvarchar(50)` | No | `Customer`, `Owner`, `DeliveryPartner`, `Admin` |
| `CreatedAt` | `datetime2` | No | UTC registration timestamp |

---

### 2.2 `Restaurants`
| Column | Type | Nullable | Constraints & Purpose |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | No | PK, Identity (1,1) |
| `OwnerId` | `int` | No | FK ➔ `Users.Id` |
| `Name` | `nvarchar(150)` | No | Restaurant business name |
| `Description` | `nvarchar(500)`| Yes | Bio / description |
| `Address` | `nvarchar(300)` | No | Physical pickup location |
| `PhoneNumber` | `nvarchar(20)` | No | Outlet phone |
| `ImageUrl` | `nvarchar(500)` | Yes | Cloud / static asset URL |
| `IsActive` | `bit` | No | Soft toggle (open/closed) |
| `IsFeatured` | `bit` | No | Priority showcase flag |
| `OpeningTime` | `nvarchar(10)` | Yes | e.g. "09:00" |
| `ClosingTime` | `nvarchar(10)` | Yes | e.g. "23:00" |
| `DeliveryCharge`| `decimal(18,2)`| No | Delivery fee |
| `MinimumOrder` | `decimal(18,2)`| No | Minimum checkout value |
| `Latitude` | `float` | Yes | Coordinates for Haversine distance |
| `Longitude` | `float` | Yes | Coordinates for Haversine distance |
| `CreatedAt` | `datetime2` | No | UTC timestamp |

---

### 2.3 `MenuItems`
| Column | Type | Nullable | Constraints & Purpose |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | No | PK, Identity (1,1) |
| `RestaurantId` | `int` | No | FK ➔ `Restaurants.Id` (Cascade delete) |
| `Name` | `nvarchar(150)` | No | Dish name |
| `Description` | `nvarchar(500)`| Yes | Dish description/ingredients |
| `Price` | `decimal(18,2)`| No | Base retail price |
| `DiscountPercent`| `decimal(5,2)` | No | Promotional discount (e.g. 10.00 = 10%) |
| `Category` | `nvarchar(100)` | No | e.g. "Starters", "Main Course", "Biryani" |
| `IsVeg` | `bit` | No | True = Veg, False = Non-Veg |
| `IsBestseller` | `bit` | No | Chef recommendation flag |
| `IsAvailable` | `bit` | No | In-stock toggle |
| `ImageUrl` | `nvarchar(500)` | Yes | Dish photograph URL |

---

### 2.4 `Orders` & `OrderItems`
- **`Orders` Table:**
  - `Id` (PK)
  - `UserId` (FK ➔ `Users.Id`)
  - `RestaurantId` (FK ➔ `Restaurants.Id`)
  - `TotalAmount` (`decimal(18,2)`): Final payable amount.
  - `Status` (`nvarchar(50)`): Current state in lifecycle.
  - `DeliveryAddress` (`nvarchar(500)`): Destination address.
  - `PhoneNumber` (`nvarchar(20)`): Delivery contact.
  - `PaymentMethod` (`nvarchar(50)`): COD, UPI, Card.
  - `CancelledBy` (`nvarchar(50)`): Recorded if order is cancelled (`Customer`, `Owner`, `Admin`).
  - `CreatedAt` (`datetime2`): UTC creation time.
- **`OrderItems` Table (Composite line items):**
  - `Id` (PK)
  - `OrderId` (FK ➔ `Orders.Id` - Cascade Delete)
  - `MenuItemId` (FK ➔ `MenuItems.Id` - Restrict Delete to preserve history)
  - `Quantity` (`int`): Quantity ordered.
  - `UnitPrice` (`decimal(18,2)`): Price at moment of purchase (historical snapshot).
  - `TotalPrice` (`decimal(18,2)`): `UnitPrice * Quantity`.

---

### 2.5 Supporting Tables
- **`Payments`:** Tracks transaction status (`Pending`, `Completed`, `Failed`), provider reference, and amount.
- **`OrderDeliveries`:** Manages delivery partner assignment (`DeliveryPartnerId`), pickup time, and delivered timestamp.
- **`Reviews`:** Customer rating (1 to 5), text feedback, and verified order link.
- **`Coupons`:** Promo code (`SAVE20`), discount percentage, max discount amount, min order, expiry date.
- **`SavedAddresses`:** Customer multi-address storage (`Home`, `Work`, `Other`).
- **`Favorites` & `WishlistItems`:** Bookmarked restaurants and dishes.
- **`AdminOrderOverrides`:** Audit trail recording who, what, and why an order status was modified by an admin.

---

## 3. Database Design Principles Applied

1. **Precision for Currency (`decimal(18,2)`):**
   - We explicitly use `decimal(18,2)` instead of `float` or `double` for prices, discounts, and order amounts. Floating-point types suffer from binary rounding errors (`0.1 + 0.2 != 0.3`), which is unacceptable for financial balances and billing.
2. **Historical Data Preservation:**
   - `OrderItems` stores a frozen snapshot of `UnitPrice` and `TotalPrice` at the time of purchase. If a restaurant later raises the price of Pizza from ₹300 to ₹400, past receipts and tax totals remain accurate.
3. **UTC Timestamps:**
   - All dates (`DateTime.UtcNow`) are stored in UTC format. Converting to the user's local timezone (e.g. IST) happens exclusively on the client layer.
4. **Appropriate Foreign Key Constraints:**
   - Deleting a restaurant cascades to its menu items.
   - Deleting a menu item is restricted if it appears in past orders (`DeleteBehavior.Restrict`).

---

## 4. Freshers Interview Q&A on Database Design

### Q1: Why did you use `decimal` instead of `float` or `double` for money fields?
> **Answer:** *"Floating-point numbers (float and double) represent fractional numbers using binary approximation, which introduces rounding errors. In e-commerce and billing systems, rounding errors can accumulate into real financial discrepancies. `decimal` in C# and SQL Server uses fixed-point base-10 arithmetic, guaranteeing 100% precision for currency."*

### Q2: What happens to past order receipts if a restaurant changes a dish's price?
> **Answer:** *"The order receipt remains unchanged because `OrderItems` stores the historical `UnitPrice` and `TotalPrice` captured at the exact moment the order was placed. We never calculate past order totals by re-joining with the current `MenuItems.Price`."*

### Q3: How do you prevent SQL injection in your application?
> **Answer:** *"By using Entity Framework Core with parameterized LINQ queries. EF Core automatically translates LINQ expressions into parameterized SQL queries (`@p0`, `@p1`), ensuring user inputs are treated as literal values rather than executable SQL commands."*
