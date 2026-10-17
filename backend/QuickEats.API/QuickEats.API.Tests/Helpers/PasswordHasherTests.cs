using QuickEats.API.Helpers;
using Xunit;

namespace QuickEats.API.Tests.Helpers
{
    public class PasswordHasherTests
    {
        [Fact]
        public void Hash_ValidPassword_ReturnsHashedString()
        {
            // Arrange
            string plainTextPassword = "SecurePassword123!";

            // Act
            string hash = PasswordHasher.Hash(plainTextPassword);

            // Assert
            Assert.NotNull(hash);
            Assert.NotEmpty(hash);
            Assert.NotEqual(plainTextPassword, hash);
            Assert.StartsWith("$2", hash); // Standard BCrypt format
        }

        [Fact]
        public void Hash_SamePasswordTwice_GeneratesDifferentHashesDueToSalting()
        {
            // Arrange
            string password = "SamePassword456";

            // Act
            string hash1 = PasswordHasher.Hash(password);
            string hash2 = PasswordHasher.Hash(password);

            // Assert
            Assert.NotEqual(hash1, hash2); // BCrypt generates a unique salt per call
            Assert.True(PasswordHasher.Verify(password, hash1));
            Assert.True(PasswordHasher.Verify(password, hash2));
        }

        [Theory]
        [InlineData("Admin@123")]
        [InlineData("Customer_Pass_2026!")]
        [InlineData("simple")]
        public void Verify_CorrectPassword_ReturnsTrue(string password)
        {
            // Arrange
            string hash = PasswordHasher.Hash(password);

            // Act
            bool isValid = PasswordHasher.Verify(password, hash);

            // Assert
            Assert.True(isValid);
        }

        [Fact]
        public void Verify_IncorrectPassword_ReturnsFalse()
        {
            // Arrange
            string realPassword = "CorrectPassword123";
            string wrongPassword = "WrongPassword999";
            string hash = PasswordHasher.Hash(realPassword);

            // Act
            bool isValid = PasswordHasher.Verify(wrongPassword, hash);

            // Assert
            Assert.False(isValid);
        }
    }
}
