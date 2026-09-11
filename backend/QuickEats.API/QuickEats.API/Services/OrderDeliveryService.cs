using QuickEats.API.DTos.Notification;
using QuickEats.API.DTos.Order;
using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class OrderDeliveryService : IOrderDeliveryService
    {
        private readonly IOrderDeliveryRepository _orderDeliveryRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;

        public OrderDeliveryService(
            IOrderDeliveryRepository orderDeliveryRepository,
            IOrderRepository orderRepository,
            IUserRepository userRepository,
            INotificationService notificationService)
        {
            _orderDeliveryRepository = orderDeliveryRepository;
            _orderRepository = orderRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<OrderDeliveryResponseDto>> GetAllAsync()
        {
            var deliveries = await _orderDeliveryRepository.GetAllAsync();
            var response = new List<OrderDeliveryResponseDto>();

            foreach (var delivery in deliveries)
            {
                response.Add(ToResponseDto(delivery));
            }
            return response;
        }

        public async Task<OrderDeliveryResponseDto?> GetByIdAsync(int id)
        {
            var delivery = await _orderDeliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                return null;
            }
            return ToResponseDto(delivery);
        }

        public async Task<OrderDeliveryResponseDto?> GetByOrderidAsync(int orderId)
        {
            var delivery = await _orderDeliveryRepository.GetByOrderIdAsync(orderId);
            if (delivery == null)
            {
                return null;
            }
            return ToResponseDto(delivery);
        }

        // All deliveries assigned to one Delivery Partner.
        public async Task<IEnumerable<OrderDeliveryResponseDto>> GetByPartnerIdAsync(int partnerId)
        {
            var deliveries = await _orderDeliveryRepository.GetByPartnerIdAsync(partnerId);
            var response = new List<OrderDeliveryResponseDto>();

            foreach (var delivery in deliveries)
            {
                response.Add(ToResponseDto(delivery));
            }
            return response;
        }

        public async Task CreateAsync(CreateOrderDeliveryDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(dto.OrderId);
            if (order == null)
            {
                throw new NotFoundException($"Order with Id {dto.OrderId} not found.");
            }

            if (order.Status == "Cancelled")
            {
                throw new BadRequestException("Cannot assign delivery to a cancelled order.");
            }

            var partner = await _userRepository.GetByIdAsync(dto.DeliveryPartnerId);
            if (partner == null)
            {
                throw new NotFoundException($"Delivery partner with Id {dto.DeliveryPartnerId} not found.");
            }

            if (!partner.IsActive)
            {
                throw new BadRequestException("Cannot assign delivery to an inactive delivery partner.");
            }

            var existingDelivery = await _orderDeliveryRepository.GetByOrderIdAsync(dto.OrderId);
            if (existingDelivery != null)
            {
                // Reassign delivery partner
                existingDelivery.DeliveryPartnerId = dto.DeliveryPartnerId;
                existingDelivery.DeliveryStatus = "Assigned";
                existingDelivery.AssignedAt = DateTime.UtcNow;
                existingDelivery.PickedUpAt = null;
                existingDelivery.DeliveredAt = null;
                _orderDeliveryRepository.Update(existingDelivery);
            }
            else
            {
                var delivery = new OrderDelivery
                {
                    OrderId = dto.OrderId,
                    DeliveryPartnerId = dto.DeliveryPartnerId,
                    DeliveryStatus = "Assigned",
                    AssignedAt = DateTime.UtcNow
                };
                await _orderDeliveryRepository.AddAsync(delivery);
            }

            order.Status = "Assigned";
            _orderRepository.Update(order);
            await _orderDeliveryRepository.SaveChangesAsync();

            // Send notification to customer
            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                UserId = order.UserId,
                Title = "Delivery Partner Assigned",
                Message = $"Your order #{order.Id} has been assigned to delivery partner {partner.Name}."
            });
        }

        public async Task UpdateStatusAsync(int id, UpdateDeliveryStatusDto dto)
        {
            var delivery = await _orderDeliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                throw new NotFoundException($"Delivery with Id {id} not found.");
            }

            delivery.DeliveryStatus = dto.DeliveryStatus;

            if (dto.DeliveryStatus == "Picked Up")
            {
                delivery.PickedUpAt = DateTime.UtcNow;
            }
            else if (dto.DeliveryStatus == "Delivered")
            {
                delivery.DeliveredAt = DateTime.UtcNow;
            }

            _orderDeliveryRepository.Update(delivery);

            // Sync order status
            if (delivery.Order != null)
            {
                delivery.Order.Status = dto.DeliveryStatus;
                _orderRepository.Update(delivery.Order);

                // Notify customer of delivery status update
                await _notificationService.CreateAsync(new CreateNotificationDto
                {
                    UserId = delivery.Order.UserId,
                    Title = "Delivery Status Updated",
                    Message = $"Your order #{delivery.OrderId} status is now: {dto.DeliveryStatus}."
                });
            }

            await _orderDeliveryRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var delivery = await _orderDeliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                throw new NotFoundException($"Delivery with Id {id} not found.");
            }
            _orderDeliveryRepository.Delete(delivery);
            await _orderDeliveryRepository.SaveChangesAsync();
        }

        // Convert a delivery to the response DTO.
        private OrderDeliveryResponseDto ToResponseDto(OrderDelivery delivery)
        {
            return new OrderDeliveryResponseDto
            {
                Id = delivery.Id,
                OrderId = delivery.OrderId,
                DeliveryPartnerId = delivery.DeliveryPartnerId,
                DeliveryStatus = delivery.DeliveryStatus,
                AssignedAt = delivery.AssignedAt,
                PickedUpAt = delivery.PickedUpAt,
                DeliveredAt = delivery.DeliveredAt,

                DeliveryPartnerName = delivery.DeliveryPartner?.Name ?? "",
                DeliveryPartnerPhone = delivery.DeliveryPartner?.PhoneNumber ?? "",

                RestaurantName = delivery.Order?.Restaurant?.Name ?? "",
                RestaurantAddress = delivery.Order?.Restaurant?.Address ?? "",
                RestaurantPhone = delivery.Order?.Restaurant?.PhoneNumber ?? "",
                CustomerName = delivery.Order?.User?.Name ?? "",
                DeliveryAddress = delivery.Order?.DeliveryAddress ?? "",
                PhoneNumber = delivery.Order?.PhoneNumber ?? "",
                PaymentMethod = delivery.Order?.PaymentMethod ?? "",
                TotalAmount = delivery.Order?.TotalAmount ?? 0,
                OrderStatus = delivery.Order?.Status ?? "",
                OrderCreatedAt = delivery.Order?.CreatedAt ?? DateTime.UtcNow,

                Items = (delivery.Order?.OrderItems ?? new List<OrderItem>())
                    .Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        Name = item.MenuItem?.Name ?? "",
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    }).ToList()
            };
        }
    }
}
