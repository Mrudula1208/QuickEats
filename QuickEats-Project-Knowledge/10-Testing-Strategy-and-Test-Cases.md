# QuickEats - Testing Strategy & Test Cases Guide

## 1. Overview & Quality Philosophy
Software reliability in QuickEats is verified through automated unit testing on both the backend (.NET 8 with xUnit & Moq) and the frontend (Angular 21 with Vitest).
- **Zero Flakiness:** All tests execute against isolated test doubles (mocks) without touching live databases or network APIs.
- **100% Pass Verification Baseline:**
  - **Backend:** 48 / 48 Tests Passing (0 Errors, 0 Warnings).
  - **Frontend:** 45 / 45 Test Files Passing (46 / 46 Specs Passing).

---

## 2. Backend Testing Architecture (.NET 8 + xUnit + Moq)

Located in `backend/QuickEats.API/QuickEats.API.Tests/`:
- **Framework:** `xUnit`
- **Mocking Library:** `Moq`
- **Assertion Style:** Fluent, AAA Pattern (Arrange-Act-Assert)

### 2.1 Test Matrix Summary

| Test File | Target Class | Test Scenarios | Cases | Status |
|---|---|---|---|---|
| `PasswordHasherTests.cs` | `PasswordHasher` | Hash generation, Salt variance, Match verification, Wrong password rejection | 4 (6 cases) | Passed |
| `OrderServiceTests.cs` | `OrderService` | Order creation, Server-side price tampering protection, Coupon discounts, State transitions, Customer cancellation, Admin override | 15 (21 cases) | Passed |
| `OrderDeliveryServiceTests.cs` | `OrderDeliveryService` | Admin dispatch, Inactive rider rejection, Reassignment guards, Sequential status progression, Terminal state restrictions | 23 | Passed |
| **Total** | | | **48** | **100% Pass** |

---

### 2.2 Sample Test Implementations

#### Salt Uniqueness Verification:
```csharp
[Fact]
public void Hash_ShouldProduceDifferentHashForSamePassword()
{
    // Arrange
    string password = "SecretPassword123!";

    // Act
    string hash1 = PasswordHasher.Hash(password);
    string hash2 = PasswordHasher.Hash(password);

    // Assert: Even with identical input, BCrypt generated salts ensure distinct hashes
    Assert.NotEqual(hash1, hash2);
    Assert.True(PasswordHasher.Verify(password, hash1));
    Assert.True(PasswordHasher.Verify(password, hash2));
}
```

#### Order Cancellation Business Rule Verification:
```csharp
[Theory]
[InlineData("Preparing")]
[InlineData("Ready for Pickup")]
[InlineData("Out for Delivery")]
[InlineData("Delivered")]
public async Task CancelOrderAsync_WhenOrderAlreadyInKitchenOrDelivery_ThrowsBadRequestException(string status)
{
    // Arrange
    var order = new Order { Id = 10, UserId = 5, Status = status };
    _mockOrderRepo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(order);

    // Act & Assert
    var ex = await Assert.ThrowsAsync<BadRequestException>(
        () => _orderService.CancelOrderAsync(10, 5)
    );
    Assert.Contains("Cannot cancel order with status", ex.Message);
}
```

---

## 3. Frontend Testing Architecture (Angular 21 + Vitest)

Located in `frontend/quickeats-web/src/app/**/*.spec.ts`:
- **Runner:** `Vitest`
- **Environment:** Node ESM with JSDOM
- **Key Providers Scaffolded:**
  - `provideHttpClient()` & `provideHttpClientTesting()` (mocks HTTP calls)
  - `provideRouter([])` (mocks routing navigation)
  - `provideToastr()` (mocks UI alert messages)

### 3.1 Component Test Harness Pattern:
```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { RestaurantsComponent } from './restaurants';

describe('RestaurantsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestaurantsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideToastr()
      ]
    }).compileComponents();
  });

  it('should create the component instance', () => {
    const fixture = TestBed.createComponent(RestaurantsComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
```

---

## 4. Test Execution Commands

### Run Backend Tests:
```bash
# Navigate to backend solution folder
cd backend/QuickEats.API
dotnet test QuickEats.API.sln
```
**Expected Output:**
```text
Passed!  - Failed: 0, Passed: 48, Skipped: 0, Total: 48, Duration: 2 s
```

### Run Frontend Tests:
```bash
# Navigate to Angular project folder
cd frontend/quickeats-web
npm test -- --watch=false
```
**Expected Output:**
```text
Test Files  45 passed (45)
     Tests  46 passed (46)
  Duration  8.42s
```

---

## 5. Interview Talking Points

### Q1: What is the AAA pattern in unit testing?
**Answer:** AAA stands for **Arrange, Act, Assert**:
1. **Arrange:** Set up inputs, mock dependencies, and define return values.
2. **Act:** Execute the single method under test.
3. **Assert:** Verify that the output matches expectations and mock interactions occurred as designed.

### Q2: Why mock repositories instead of using an in-memory database?
**Answer:** While in-memory databases (like EF Core In-Memory) can be useful for integration testing, they do not simulate SQL Server constraints or transaction isolation faithfully and can be slow. Using `Moq` to mock repository interfaces (`IRestaurantRepository`, `IOrderRepository`) ensures pure unit isolation, sub-second execution speeds, and allows easy simulation of error conditions (e.g. database returning null or throwing exceptions).
