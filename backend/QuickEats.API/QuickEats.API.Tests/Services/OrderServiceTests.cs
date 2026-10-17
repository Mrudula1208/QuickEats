using Moq;
using QuickEats.API.DTos.Notification;
using QuickEats.API.DTos.Order;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services;
using QuickEats.API.Services.Interfaces;
using Xunit;

namespace QuickEats.API.Tests.Services
{
    public class OrderServiceTests
    {
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<IMenuRepository> _menuRepoMock;
        private readonly Mock<INotificationService> _notificationServiceMock;
        private readonly OrderService _orderService;

        public OrderServiceTests()
        {
            _orderRepoMock = new Mock<IOrderRepository>();
            _menuRepoMock = new Mock<IMenuRepository>();
            _notificationServiceMock = new Mock<INotificationService>();

            _orderService = new OrderService(
                _orderRepoMock.Object,
                _menuRepoMock.Object,
                _notificationServiceMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ValidItemsWithoutDiscount_CalculatesCorrectTotalAmount()
        {
            // Arrange
            int customerId = 1;
            int restaurantId = 10;
            var menuItem = new MenuItem
            {
                Id = 101,
                RestaurantId = restaurantId,
                Name = "Paneer Butter Masala",
                Price = 150m,
                DiscountPercent = 0
            };

            _menuRepoMock.Setup(m => m.GetByIdAsync(101)).ReturnsAsync(menuItem);

            var createDto = new CreateOrderDto
            {
                RestaurantId = restaurantId,
                DeliveryAddress = "123 Main Street, Bangalore",
                PhoneNumber = "9876543210",
                PaymentMethod = "UPI",
                TotalAmount = 0, // Server recalculates
                Items = new List<OrderItemDto>
                {
                    new OrderItemDto { MenuItemId = 101, Quantity = 2 }
                }
            };

            // Act
            int orderId = await _orderService.CreateAsync(createDto, customerId);

            // Assert: 150 * 2 = 300
            _orderRepoMock.Verify(r => r.AddAsync(It.Is<Order>(o =>
                o.UserId == customerId &&
                o.RestaurantId == restaurantId &&
                o.Status == "Pending" &&
                o.TotalAmount == 300m &&
                o.OrderItems.Count == 1 &&
                o.OrderItems.First().UnitPrice == 150m &&
                o.OrderItems.First().TotalPrice == 300m
            )), Times.Once);

            _orderRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_ValidItemsWithDiscount_AppliesDiscountPercentageCorrectly()
        {
            // Arrange
            int customerId = 1;
            int restaurantId = 10;
            var menuItem = new MenuItem
            {
                Id = 102,
                RestaurantId = restaurantId,
                Name = "Veg Biryani Special",
                Price = 200m,
                DiscountPercent = 10 // 10% discount -> unit price 180
            };

            _menuRepoMock.Setup(m => m.GetByIdAsync(102)).ReturnsAsync(menuItem);

            var createDto = new CreateOrderDto
            {
                RestaurantId = restaurantId,
                DeliveryAddress = "456 Tech Park, Hyderabad",
                PhoneNumber = "9123456780",
                PaymentMethod = "Credit Card",
                TotalAmount = 0,
                Items = new List<OrderItemDto>
                {
                    new OrderItemDto { MenuItemId = 102, Quantity = 3 }
                }
            };

            // Act
            int orderId = await _orderService.CreateAsync(createDto, customerId);

            // Assert: unit price = 180, total for 3 items = 540
            _orderRepoMock.Verify(r => r.AddAsync(It.Is<Order>(o =>
                o.TotalAmount == 540m &&
                o.OrderItems.First().UnitPrice == 180m &&
                o.OrderItems.First().TotalPrice == 540m
            )), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_MenuItemNotFound_ThrowsNotFoundException()
        {
            // Arrange
            _menuRepoMock.Setup(m => m.GetByIdAsync(999)).ReturnsAsync((MenuItem?)null);

            var createDto = new CreateOrderDto
            {
                RestaurantId = 10,
                DeliveryAddress = "123 Test Street",
                PhoneNumber = "9876543210",
                Items = new List<OrderItemDto>
                {
                    new OrderItemDto { MenuItemId = 999, Quantity = 1 }
                }
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
                _orderService.CreateAsync(createDto, userId: 1));

            Assert.Contains("999", ex.Message);
        }

        [Fact]
        public async Task CreateAsync_MenuItemFromDifferentRestaurant_ThrowsBadRequestException()
        {
            // Arrange
            var menuItem = new MenuItem
            {
                Id = 105,
                RestaurantId = 99, // Different restaurant!
                Name = "Cross Restaurant Dish",
                Price = 100m
            };

            _menuRepoMock.Setup(m => m.GetByIdAsync(105)).ReturnsAsync(menuItem);

            var createDto = new CreateOrderDto
            {
                RestaurantId = 10, // Ordering from restaurant 10
                DeliveryAddress = "123 Test Street",
                PhoneNumber = "9876543210",
                Items = new List<OrderItemDto>
                {
                    new OrderItemDto { MenuItemId = 105, Quantity = 1 }
                }
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() =>
                _orderService.CreateAsync(createDto, userId: 1));

            Assert.Contains("does not belong to the selected restaurant", ex.Message);
        }

        [Fact]
        public async Task UpdateStatusAsync_ValidPendingToConfirmed_UpdatesStatusAndNotifiesCustomer()
        {
            // Arrange
            var existingOrder = new Order
            {
                Id = 42,
                UserId = 7,
                Status = "Pending"
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(42)).ReturnsAsync(existingOrder);

            var updateDto = new UpdateOrderStatusDto
            {
                Status = "Confirmed"
            };

            // Act
            await _orderService.UpdateStatusAsync(42, updateDto);

            // Assert
            Assert.Equal("Confirmed", existingOrder.Status);
            _orderRepoMock.Verify(r => r.Update(existingOrder), Times.Once);
            _orderRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);

            _notificationServiceMock.Verify(n => n.CreateAsync(It.Is<CreateNotificationDto>(d =>
                d.UserId == 7 &&
                d.Title == "Order Status Updated" &&
                d.Message.Contains("Confirmed")
            )), Times.Once);
        }

        [Fact]
        public async Task UpdateStatusAsync_InvalidTransitionPendingToDelivered_ThrowsBadRequestException()
        {
            // Arrange
            var existingOrder = new Order
            {
                Id = 42,
                UserId = 7,
                Status = "Pending"
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(42)).ReturnsAsync(existingOrder);

            var updateDto = new UpdateOrderStatusDto
            {
                Status = "Delivered" // Illegal skip from Pending straight to Delivered
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() =>
                _orderService.UpdateStatusAsync(42, updateDto));

            Assert.Contains("Invalid order status transition", ex.Message);
        }

        [Fact]
        public async Task CancelAsync_OrderOwnedByCustomerAndPending_CancelsSuccessfully()
        {
            // Arrange
            int customerId = 15;
            var order = new Order
            {
                Id = 77,
                UserId = customerId,
                Status = "Pending"
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(77)).ReturnsAsync(order);

            // Act
            await _orderService.CancelAsync(77, customerId);

            // Assert
            Assert.Equal("Cancelled", order.Status);
            Assert.Equal("Customer", order.CancelledBy);
            _orderRepoMock.Verify(r => r.Update(order), Times.Once);
            _orderRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CancelAsync_OrderBelongsToDifferentUser_ThrowsForbiddenException()
        {
            // Arrange
            var order = new Order
            {
                Id = 88,
                UserId = 10,
                Status = "Pending"
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(88)).ReturnsAsync(order);

            // Act & Assert: User 99 tries to cancel User 10's order
            await Assert.ThrowsAsync<ForbiddenException>(() =>
                _orderService.CancelAsync(88, userId: 99));
        }

        [Fact]
        public async Task CancelAsync_OrderAlreadyPreparingOrDelivered_ThrowsBadRequestException()
        {
            // Arrange
            int customerId = 10;
            var order = new Order
            {
                Id = 99,
                UserId = customerId,
                Status = "Preparing" // Cannot cancel once restaurant has started preparing
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync(order);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() =>
                _orderService.CancelAsync(99, customerId));

            Assert.Contains("Only Pending or Confirmed orders can be cancelled", ex.Message);
        }

        [Theory]
        [InlineData("ready", "Ready for Pickup")]
        [InlineData("outfordelivery", "Out for Delivery")]
        [InlineData("pickedup", "Picked Up")]
        [InlineData("pending", "Pending")]
        [InlineData("confirmed", "Confirmed")]
        [InlineData("delivered", "Delivered")]
        public void NormalizeStatus_VariousValidInputs_NormalizesToStandardLifecycleNames(string input, string expected)
        {
            // Act
            string normalized = OrderService.NormalizeStatus(input);

            // Assert
            Assert.Equal(expected, normalized);
        }
    }
}
