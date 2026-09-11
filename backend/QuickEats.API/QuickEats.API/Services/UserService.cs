using Microsoft.AspNetCore.Identity;
using QuickEats.API.DTos.Auth;
using QuickEats.API.DTos.User;
using QuickEats.API.Exceptions;
using QuickEats.API.Helpers;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IOrderDeliveryRepository _orderDeliveryRepository;

        public UserService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IOrderDeliveryRepository orderDeliveryRepository)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _orderDeliveryRepository = orderDeliveryRepository;
        }

        public async Task RegisterAsync(RegisterRequestDto request)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);

            if (existingUser != null)
            {
                throw new BadRequestException("User already exists");
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = PasswordHasher.Hash(request.Password),
                Role = request.Role,
                IsActive = true
            };
            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // Find user by Email.
            var user = await _userRepository.GetByEmailAsync(request.Email);

            // User not found.
            if (user == null)
            {
                return null;
            }

            // Verify Password.
            bool isValid = PasswordHasher.Verify(
                request.Password,
                user.PasswordHash);

            // Wrong Password.
            if (!isValid)
            {
                return null;
            }

            // Account inactive check
            if (!user.IsActive)
            {
                throw new ForbiddenException("Your account is deactivated. Please contact support.");
            }

            // JWT Token.
            var token = _jwtService.GenerateToken(user);

            // Return Login Response.
            return new LoginResponseDto
            {
                Id = user.Id,
                Token = token,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task UpdateProfileImageUrlAsync(int userId, string imageUrl)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            user.ProfileImageUrl = imageUrl;
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<int> CreateDeliveryPartnerAsync(CreateDeliveryPartnerDto request)
        {
            var existing = await _userRepository.GetByEmailAsync(request.Email);
            if (existing != null)
            {
                throw new BadRequestException("A user with this email already exists.");
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = PasswordHasher.Hash(request.Password),
                Role = "DeliveryPartner",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();
            return user.Id;
        }

        public async Task<bool> ToggleUserStatusAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found.");
            }

            user.IsActive = !user.IsActive;
            await _userRepository.UpdateAsync(user);
            await _userRepository.SaveChangesAsync();
            return user.IsActive;
        }

        public async Task<List<DeliveryPartnerSummaryDto>> GetDeliveryPartnersAsync()
        {
            var allUsers = await _userRepository.GetAllAsync();
            var partners = allUsers.Where(u => u.Role == "DeliveryPartner" || u.Role == "Delivery Partner").ToList();
            var allDeliveries = await _orderDeliveryRepository.GetAllAsync();

            var result = new List<DeliveryPartnerSummaryDto>();
            foreach (var partner in partners)
            {
                var partnerDeliveries = allDeliveries.Where(d => d.DeliveryPartnerId == partner.Id).ToList();
                result.Add(new DeliveryPartnerSummaryDto
                {
                    Id = partner.Id,
                    Name = partner.Name,
                    Email = partner.Email,
                    PhoneNumber = partner.PhoneNumber,
                    ProfileImageUrl = partner.ProfileImageUrl,
                    IsActive = partner.IsActive,
                    ActiveDeliveriesCount = partnerDeliveries.Count(d => d.DeliveryStatus != "Delivered"),
                    CompletedDeliveriesCount = partnerDeliveries.Count(d => d.DeliveryStatus == "Delivered"),
                    CreatedAt = partner.CreatedAt
                });
            }

            return result;
        }
    }
}
