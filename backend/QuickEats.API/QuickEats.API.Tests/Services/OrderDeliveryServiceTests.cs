using Moq;
using QuickEats.API.DTos.Notification;
using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services;
using QuickEats.API.Services.Interfaces;
using Xunit;

namespace QuickEats.API.Tests.Services
{
    public class OrderDeliveryServiceTests
    {
        private readonly Mock<IOrderDeliveryRepository> _deliveryRepoMock;
        private readonly Mock<IOrderRepository> _orderRepoMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<INotificationService> _notificationServiceMock;
        private readonly OrderDeliveryService _deliveryService;

        public OrderDeliveryServiceTests()
        {
            _deliveryRepoMock = new Mock<IOrderDeliveryRepository>();
            _orderRepoMock = new Mock<IOrderRepository>();
            _userRepoMock = new Mock<IUserRepository>();
            _notificationServiceMock = new Mock<INotificationService>();

            _deliveryService = new OrderDeliveryService(
                _deliveryRepoMock.Object,
                _orderRepoMock.Object,
                _userRepoMock.Object,
                _notificationServiceMock.Object);
        }

        #region CreateAsync (Admin Dispatch) Tests

        [Fact]
        public async Task CreateAsync_OrderNotFound_ThrowsNotFoundException()
        {
            // Arrange
            _orderRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Order?)null);

            var dto = new CreateOrderDeliveryDto { OrderId = 999, DeliveryPartnerId = 10 };

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _deliveryService.CreateAsync(dto));
        }

        [Fact]
        public async Task CreateAsync_OrderCancelled_ThrowsBadRequestException()
        {
            // Arrange
            var order = new Order { Id = 1, Status = "Cancelled" };
            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.CreateAsync(dto));
            Assert.Contains("Cannot assign delivery to a cancelled order", ex.Message);
        }

        [Theory]
        [InlineData("Pending")]
        [InlineData("Confirmed")]
        [InlineData("Preparing")]
        [InlineData("Delivered")]
        public async Task CreateAsync_OrderNotReadyForPickup_ThrowsBadRequestException(string invalidStatus)
        {
            // Arrange
            var order = new Order { Id = 1, Status = invalidStatus };
            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _deliveryRepoMock.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync((OrderDelivery?)null);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.CreateAsync(dto));
            Assert.Contains("Ready for Pickup", ex.Message);
        }

        [Fact]
        public async Task CreateAsync_PartnerNotFound_ThrowsNotFoundException()
        {
            // Arrange
            var order = new Order { Id = 1, Status = "Ready for Pickup" };
            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _deliveryRepoMock.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync((OrderDelivery?)null);
            _userRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync((User?)null);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _deliveryService.CreateAsync(dto));
        }

        [Fact]
        public async Task CreateAsync_PartnerInactive_ThrowsBadRequestException()
        {
            // Arrange
            var order = new Order { Id = 1, Status = "Ready for Pickup" };
            var inactivePartner = new User { Id = 10, Name = "Rider Test", IsActive = false };

            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _deliveryRepoMock.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync((OrderDelivery?)null);
            _userRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(inactivePartner);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.CreateAsync(dto));
            Assert.Contains("inactive delivery partner", ex.Message);
        }

        [Fact]
        public async Task CreateAsync_ValidReadyForPickupOrder_CreatesDeliveryAndUpdatesOrderStatusToAssigned()
        {
            // Arrange
            var order = new Order { Id = 1, UserId = 42, Status = "Ready for Pickup" };
            var partner = new User { Id = 10, Name = "Active Rider", IsActive = true };

            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _deliveryRepoMock.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync((OrderDelivery?)null);
            _userRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(partner);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act
            await _deliveryService.CreateAsync(dto);

            // Assert
            _deliveryRepoMock.Verify(r => r.AddAsync(It.Is<OrderDelivery>(d =>
                d.OrderId == 1 &&
                d.DeliveryPartnerId == 10 &&
                d.DeliveryStatus == "Assigned"
            )), Times.Once);

            Assert.Equal("Assigned", order.Status);
            _orderRepoMock.Verify(r => r.Update(order), Times.Once);
            _deliveryRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);

            _notificationServiceMock.Verify(n => n.CreateAsync(It.Is<CreateNotificationDto>(notif =>
                notif.UserId == 42 &&
                notif.Title == "Delivery Partner Assigned"
            )), Times.Once);
        }

        [Theory]
        [InlineData("Picked Up")]
        [InlineData("Out for Delivery")]
        [InlineData("Delivered")]
        public async Task CreateAsync_ReassignmentWhenAlreadyPickedUpOrLater_ThrowsBadRequestException(string advancedStatus)
        {
            // Arrange
            var order = new Order { Id = 1, Status = advancedStatus };
            var existingDelivery = new OrderDelivery
            {
                Id = 100,
                OrderId = 1,
                DeliveryPartnerId = 5,
                DeliveryStatus = advancedStatus
            };

            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _deliveryRepoMock.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync(existingDelivery);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.CreateAsync(dto));
            Assert.Contains("only be reassigned while the delivery is still in the Assigned state", ex.Message);
        }

        [Fact]
        public async Task CreateAsync_ValidReassignmentWhileAssigned_UpdatesPartnerAndResetsTimestamps()
        {
            // Arrange
            var order = new Order { Id = 1, UserId = 42, Status = "Assigned" };
            var existingDelivery = new OrderDelivery
            {
                Id = 100,
                OrderId = 1,
                DeliveryPartnerId = 5,
                DeliveryStatus = "Assigned"
            };
            var newPartner = new User { Id = 10, Name = "New Rider", IsActive = true };

            _orderRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(order);
            _deliveryRepoMock.Setup(r => r.GetByOrderIdAsync(1)).ReturnsAsync(existingDelivery);
            _userRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(newPartner);

            var dto = new CreateOrderDeliveryDto { OrderId = 1, DeliveryPartnerId = 10 };

            // Act
            await _deliveryService.CreateAsync(dto);

            // Assert
            Assert.Equal(10, existingDelivery.DeliveryPartnerId);
            Assert.Equal("Assigned", existingDelivery.DeliveryStatus);
            Assert.Null(existingDelivery.PickedUpAt);
            Assert.Null(existingDelivery.DeliveredAt);

            _deliveryRepoMock.Verify(r => r.Update(existingDelivery), Times.Once);
            _deliveryRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        #endregion

        #region UpdateStatusAsync (Delivery Partner FSM) Tests

        [Fact]
        public async Task UpdateStatusAsync_DeliveryNotFound_ThrowsNotFoundException()
        {
            // Arrange
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((OrderDelivery?)null);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Picked Up" };

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _deliveryService.UpdateStatusAsync(999, dto));
        }

        [Fact]
        public async Task UpdateStatusAsync_InvalidStatusString_ThrowsBadRequestException()
        {
            // Arrange
            var delivery = new OrderDelivery { Id = 1, DeliveryStatus = "Assigned" };
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "UnknownStatus" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.UpdateStatusAsync(1, dto));
            Assert.Contains("Invalid delivery status", ex.Message);
        }

        [Fact]
        public async Task UpdateStatusAsync_SameStatus_ThrowsBadRequestException()
        {
            // Arrange
            var delivery = new OrderDelivery { Id = 1, DeliveryStatus = "Assigned" };
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Assigned" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.UpdateStatusAsync(1, dto));
            Assert.Contains("already in \"Assigned\" state", ex.Message);
        }

        [Fact]
        public async Task UpdateStatusAsync_IllegalJumpAssignedToDelivered_ThrowsBadRequestException()
        {
            // Arrange
            var delivery = new OrderDelivery { Id = 1, DeliveryStatus = "Assigned" };
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Delivered" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.UpdateStatusAsync(1, dto));
            Assert.Contains("Invalid delivery status transition", ex.Message);
        }

        [Fact]
        public async Task UpdateStatusAsync_ValidTransition_AssignedToPickedUp_SetsTimestampAndSyncsOrderStatus()
        {
            // Arrange
            var order = new Order { Id = 10, UserId = 42, Status = "Assigned" };
            var delivery = new OrderDelivery
            {
                Id = 1,
                OrderId = 10,
                DeliveryPartnerId = 5,
                DeliveryStatus = "Assigned",
                Order = order
            };

            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Picked Up" };

            // Act
            await _deliveryService.UpdateStatusAsync(1, dto);

            // Assert
            Assert.Equal("Picked Up", delivery.DeliveryStatus);
            Assert.NotNull(delivery.PickedUpAt);
            Assert.Equal("Picked Up", order.Status);

            _deliveryRepoMock.Verify(r => r.Update(delivery), Times.Once);
            _orderRepoMock.Verify(r => r.Update(order), Times.Once);
            _deliveryRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);

            _notificationServiceMock.Verify(n => n.CreateAsync(It.Is<CreateNotificationDto>(notif =>
                notif.UserId == 42 &&
                notif.Message.Contains("Picked Up")
            )), Times.Once);
        }

        [Fact]
        public async Task UpdateStatusAsync_ValidTransition_PickedUpToOutForDelivery_SyncsOrderStatus()
        {
            // Arrange
            var order = new Order { Id = 10, UserId = 42, Status = "Picked Up" };
            var delivery = new OrderDelivery
            {
                Id = 1,
                OrderId = 10,
                DeliveryPartnerId = 5,
                DeliveryStatus = "Picked Up",
                Order = order
            };

            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Out for Delivery" };

            // Act
            await _deliveryService.UpdateStatusAsync(1, dto);

            // Assert
            Assert.Equal("Out for Delivery", delivery.DeliveryStatus);
            Assert.Equal("Out for Delivery", order.Status);

            _deliveryRepoMock.Verify(r => r.Update(delivery), Times.Once);
            _orderRepoMock.Verify(r => r.Update(order), Times.Once);
            _deliveryRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateStatusAsync_ValidTransition_OutForDeliveryToDelivered_SetsDeliveredAtAndSyncsOrderStatus()
        {
            // Arrange
            var order = new Order { Id = 10, UserId = 42, Status = "Out for Delivery" };
            var delivery = new OrderDelivery
            {
                Id = 1,
                OrderId = 10,
                DeliveryPartnerId = 5,
                DeliveryStatus = "Out for Delivery",
                Order = order
            };

            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Delivered" };

            // Act
            await _deliveryService.UpdateStatusAsync(1, dto);

            // Assert
            Assert.Equal("Delivered", delivery.DeliveryStatus);
            Assert.NotNull(delivery.DeliveredAt);
            Assert.Equal("Delivered", order.Status);

            _deliveryRepoMock.Verify(r => r.Update(delivery), Times.Once);
            _orderRepoMock.Verify(r => r.Update(order), Times.Once);
            _deliveryRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateStatusAsync_FromDeliveredTerminalState_ThrowsBadRequestException()
        {
            // Arrange
            var delivery = new OrderDelivery { Id = 1, DeliveryStatus = "Delivered" };
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            var dto = new UpdateDeliveryStatusDto { DeliveryStatus = "Assigned" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<BadRequestException>(() => _deliveryService.UpdateStatusAsync(1, dto));
            Assert.Contains("Invalid delivery status transition", ex.Message);
        }

        #endregion

        #region DeleteAsync Tests

        [Fact]
        public async Task DeleteAsync_DeliveryNotFound_ThrowsNotFoundException()
        {
            // Arrange
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((OrderDelivery?)null);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() => _deliveryService.DeleteAsync(999));
        }

        [Fact]
        public async Task DeleteAsync_DeliveryExists_CallsDeleteAndSaveChangesAsync()
        {
            // Arrange
            var delivery = new OrderDelivery { Id = 1 };
            _deliveryRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(delivery);

            // Act
            await _deliveryService.DeleteAsync(1);

            // Assert
            _deliveryRepoMock.Verify(r => r.Delete(delivery), Times.Once);
            _deliveryRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        #endregion
    }
}
