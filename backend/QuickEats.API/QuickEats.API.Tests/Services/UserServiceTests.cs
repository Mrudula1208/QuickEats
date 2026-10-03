using Moq;
using QuickEats.API.DTos.User;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services;
using QuickEats.API.Services.Interfaces;
using Xunit;

namespace QuickEats.API.Tests.Services
{
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IJwtService> _jwtServiceMock;
        private readonly Mock<IOrderDeliveryRepository> _deliveryRepoMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepoMock = new Mock<IUserRepository>();
            _jwtServiceMock = new Mock<IJwtService>();
            _deliveryRepoMock = new Mock<IOrderDeliveryRepository>();

            _userService = new UserService(
                _userRepoMock.Object,
                _jwtServiceMock.Object,
                _deliveryRepoMock.Object);
        }

        [Fact]
        public async Task GetDeliveryPartnersAsync_DelegatesToRepository_ReturnsPartnersList()
        {
            // Arrange
            var expectedPartners = new List<DeliveryPartnerSummaryDto>
            {
                new DeliveryPartnerSummaryDto
                {
                    Id = 1,
                    Name = "Rohit Rider",
                    Email = "rohit@gmail.com",
                    PhoneNumber = "9820558811",
                    IsActive = true,
                    ActiveDeliveriesCount = 2,
                    CompletedDeliveriesCount = 10,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _userRepoMock.Setup(r => r.GetDeliveryPartnersSummaryAsync())
                .ReturnsAsync(expectedPartners);

            // Act
            var result = await _userService.GetDeliveryPartnersAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("Rohit Rider", result[0].Name);
            Assert.Equal(2, result[0].ActiveDeliveriesCount);
            Assert.Equal(10, result[0].CompletedDeliveriesCount);
            _userRepoMock.Verify(r => r.GetDeliveryPartnersSummaryAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WhenUsersExist_ReturnsUserResponseDtosWithoutPasswordHashes()
        {
            // Arrange
            var users = new List<User>
            {
                new User
                {
                    Id = 1,
                    Name = "Alice Admin",
                    Email = "admin@quickeats.com",
                    PhoneNumber = "9999999999",
                    Role = "Admin",
                    PasswordHash = "$2a$10$supersecretBCryptHash",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    Name = "Bob Customer",
                    Email = "bob@gmail.com",
                    PhoneNumber = "9888888888",
                    Role = "Customer",
                    PasswordHash = "$2a$10$anothersecretBCryptHash",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(users);

            // Act
            var result = (await _userService.GetAllAsync()).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Alice Admin", result[0].Name);
            Assert.Equal("Bob Customer", result[1].Name);
            // Verify PasswordHash property is not present on UserResponseDto
            Assert.IsType<UserResponseDto>(result[0]);
        }

        [Fact]
        public async Task GetByIdAsync_WhenUserExists_ReturnsUserResponseDto()
        {
            // Arrange
            var user = new User
            {
                Id = 5,
                Name = "Sneha Owner",
                Email = "sneha@gmail.com",
                PhoneNumber = "9819225588",
                Role = "Owner",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(user);

            // Act
            var result = await _userService.GetByIdAsync(5);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(5, result!.Id);
            Assert.Equal("Sneha Owner", result.Name);
            Assert.Equal("Owner", result.Role);
        }

        [Fact]
        public async Task GetByIdAsync_WhenUserDoesNotExist_ReturnsNull()
        {
            // Arrange
            _userRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((User?)null);

            // Act
            var result = await _userService.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteAsync_WhenUserExists_DeletesUserAndSavesChanges()
        {
            // Arrange
            var user = new User
            {
                Id = 12,
                Name = "Inactive User",
                Email = "inactive@gmail.com"
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(12)).ReturnsAsync(user);

            // Act
            await _userService.DeleteAsync(12);

            // Assert
            _userRepoMock.Verify(r => r.DeleteAsync(user), Times.Once);
            _userRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteAsync_WhenUserDoesNotExist_ThrowsNotFoundException()
        {
            // Arrange
            _userRepoMock.Setup(r => r.GetByIdAsync(888)).ReturnsAsync((User?)null);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
                _userService.DeleteAsync(888));

            Assert.Contains("User not found", ex.Message);
            _userRepoMock.Verify(r => r.DeleteAsync(It.IsAny<User>()), Times.Never);
        }

        [Fact]
        public async Task ToggleUserStatusAsync_WhenUserExists_InvertsIsActiveFlagAndSaves()
        {
            // Arrange
            var user = new User
            {
                Id = 20,
                Name = "Active Rider",
                IsActive = true
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(20)).ReturnsAsync(user);

            // Act
            bool newStatus = await _userService.ToggleUserStatusAsync(20);

            // Assert
            Assert.False(newStatus);
            Assert.False(user.IsActive);
            _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
            _userRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task ToggleUserStatusAsync_WhenUserDoesNotExist_ThrowsNotFoundException()
        {
            // Arrange
            _userRepoMock.Setup(r => r.GetByIdAsync(777)).ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() =>
                _userService.ToggleUserStatusAsync(777));

            _userRepoMock.Verify(r => r.SaveChangesAsync(), Times.Never);
        }

        [Fact]
        public async Task UpdateProfileImageUrlAsync_WhenUserExists_UpdatesUrlAndSaves()
        {
            // Arrange
            var user = new User
            {
                Id = 30,
                Name = "Profile Tester",
                ProfileImageUrl = null
            };

            _userRepoMock.Setup(r => r.GetByIdAsync(30)).ReturnsAsync(user);

            // Act
            await _userService.UpdateProfileImageUrlAsync(30, "https://images.unsplash.com/avatar.jpg");

            // Assert
            Assert.Equal("https://images.unsplash.com/avatar.jpg", user.ProfileImageUrl);
            _userRepoMock.Verify(r => r.UpdateAsync(user), Times.Once);
            _userRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateProfileImageUrlAsync_WhenUserDoesNotExist_ThrowsNotFoundException()
        {
            // Arrange
            _userRepoMock.Setup(r => r.GetByIdAsync(555)).ReturnsAsync((User?)null);

            // Act & Assert
            await Assert.ThrowsAsync<NotFoundException>(() =>
                _userService.UpdateProfileImageUrlAsync(555, "https://images.unsplash.com/avatar.jpg"));

            _userRepoMock.Verify(r => r.SaveChangesAsync(), Times.Never);
        }
    }
}
