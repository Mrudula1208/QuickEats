using QuickEats.API.Common;
using QuickEats.API.DTos.Notification;
using QuickEats.API.DTos.Order;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMenuRepository _menuRepository;
        private readonly INotificationService _notificationService;
        public OrderService(IOrderRepository orderRepository, IMenuRepository menuRepository, INotificationService notificationService)
        {
            _orderRepository = orderRepository;
            _menuRepository = menuRepository;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<OrderResponseDto>> GetAllAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            var response = new List<OrderResponseDto>();

            foreach (var order in orders)
            {
                response.Add(new OrderResponseDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    CustomerName = order.User?.Name ?? "",
                    RestaurantId = order.RestaurantId,
                    RestaurantName = order.Restaurant?.Name ?? "",
                    DeliveryAddress = order.DeliveryAddress,
                    PhoneNumber = order.PhoneNumber,
                    PaymentMethod = order.PaymentMethod,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,

                    Items = order.OrderItems.Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        Name = item.MenuItem?.Name ?? "",
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    }).ToList()

                });
            }
            return response;

        }

        public async Task<PagedResult<OrderResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var pagedResult = await _orderRepository.GetPagedAsync(page, pageSize, sortBy, sortDesc);

            var response = new List<OrderResponseDto>();

            foreach (var order in pagedResult.Items)
            {
                response.Add(new OrderResponseDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    CustomerName = order.User?.Name ?? "",
                    RestaurantId = order.RestaurantId,
                    RestaurantName = order.Restaurant?.Name ?? "",
                    DeliveryAddress = order.DeliveryAddress,
                    PhoneNumber = order.PhoneNumber,
                    PaymentMethod = order.PaymentMethod,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,
                    Items = order.OrderItems.Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        Name = item.MenuItem?.Name ?? "",
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    }).ToList()
                });
            }

            return new PagedResult<OrderResponseDto>
            {
                Items = response,
                TotalCount = pagedResult.TotalCount,
                Page = pagedResult.Page,
                PageSize = pagedResult.PageSize
            };
        }

        public async Task <OrderResponseDto>GetByIdAsync(int id)
        {
            var order= await _orderRepository.GetByIdAsync(id);
            if(order== null)
            {
                return null;
            }
            var response = new OrderResponseDto
            {
                    Id = order.Id,
                    UserId = order.UserId,
                    CustomerName = order.User?.Name ?? "",
                    RestaurantId = order.RestaurantId,
                RestaurantName = order.Restaurant?.Name ?? "",
                DeliveryAddress = order.DeliveryAddress,
                PhoneNumber = order.PhoneNumber,
                PaymentMethod = order.PaymentMethod,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,

                Items = order.OrderItems.Select(item => new OrderItemDto{
                    MenuItemId = item.MenuItemId,
                    Quantity = item.Quantity,
                    Name = item.MenuItem?.Name ?? "",
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice
                }).ToList()
            };

            return response;
        }


        public async Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId);
            var response = new List<OrderResponseDto>();

            foreach (var order in orders)
            {
                response.Add(new OrderResponseDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    CustomerName = order.User?.Name ?? "",
                    RestaurantId = order.RestaurantId,
                    RestaurantName = order.Restaurant?.Name ?? "",
                    DeliveryAddress = order.DeliveryAddress,
                    PhoneNumber = order.PhoneNumber,
                    PaymentMethod = order.PaymentMethod,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,

                    Items = order.OrderItems.Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        Name = item.MenuItem?.Name ?? "",
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    }).ToList()
                });
            }

            return response;


        }





        public async Task<IEnumerable<OrderResponseDto>> GetByOwnerIdAsync(int ownerId)
        {
            var orders = await _orderRepository.GetByOwnerIdAsync(ownerId);
            var response = new List<OrderResponseDto>();

            foreach (var order in orders)
            {
                response.Add(new OrderResponseDto
                {
                    Id = order.Id,
                    UserId = order.UserId,
                    CustomerName = order.User?.Name ?? "",
                    RestaurantId = order.RestaurantId,
                    RestaurantName = order.Restaurant?.Name ?? "",
                    DeliveryAddress = order.DeliveryAddress,
                    PhoneNumber = order.PhoneNumber,
                    PaymentMethod = order.PaymentMethod,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,

                    Items = order.OrderItems.Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                        Name = item.MenuItem?.Name ?? "",
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.TotalPrice
                    }).ToList()
                });
            }

            return response;
        }




        public async Task<int> CreateAsync(CreateOrderDto dto,int userId)
        {
            var order = new Order
            {
                UserId = userId,
                RestaurantId = dto.RestaurantId,
                DeliveryAddress = dto.DeliveryAddress,
                PhoneNumber = dto.PhoneNumber,
                PaymentMethod = dto.PaymentMethod,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            decimal totalAmount = 0;

            foreach (var item in dto.Items)
            {
                // Get Menu Item
                var menuItem =
                    await _menuRepository.GetByIdAsync(item.MenuItemId);

                if (menuItem == null)
                {
                    throw new NotFoundException(
                        $"Menu Item {item.MenuItemId} not found.");
                }

                // Apply the menu discount if any.
                decimal discountPercent = menuItem.DiscountPercent;

                decimal unitPrice = menuItem.Price;

                if (discountPercent > 0)
                {
                    unitPrice = unitPrice *
                        (1 - discountPercent / 100);
                }

                decimal totalPrice =
                    unitPrice * item.Quantity;

                totalAmount += totalPrice;

                var orderItem = new OrderItem
                {
                    MenuItemId = item.MenuItemId,
                    Quantity = item.Quantity,

                    UnitPrice = unitPrice,

                    TotalPrice = totalPrice
                };

                order.OrderItems.Add(orderItem);
            }
            order.TotalAmount = dto.TotalAmount > 0 ? dto.TotalAmount : totalAmount;
            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

            // Return the new order id.
            return order.Id;
        }


        public async Task UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                throw new NotFoundException($"Order with id {id} not found.");

            }

            // Validate status transition.
            // Defines which status can follow which.
            var allowedTransitions = new Dictionary<string, string[]>
            {
                { "Pending",              new[] { "Confirmed", "Cancelled" } },
                { "Confirmed",            new[] { "Preparing", "Cancelled" } },
                { "Preparing",            new[] { "Out for Delivery", "Cancelled" } },
                { "Out for Delivery",     new[] { "Delivered" } }
            };

            if (allowedTransitions.ContainsKey(order.Status))
            {
                var allowed = allowedTransitions[order.Status];
                if (!allowed.Contains(dto.Status))
                {
                    throw new BadRequestException(
                        $"Cannot change order status from \"{order.Status}\" to \"{dto.Status}\".");
                }
            }
            else
            {
                // Delivered or Cancelled orders cannot be changed.
                throw new BadRequestException(
                    $"Order with status \"{order.Status}\" cannot be updated.");
            }

            order.Status=dto.Status;
            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();

            var notification = new CreateNotificationDto
            {
                UserId = order.UserId,
                Title = "Order Status Updated",
                Message = $"Your order #{order.Id} status has been updated to {dto.Status}."
            };

            await _notificationService.CreateAsync(notification);
        }

        // Customer cancels their own order.
        // Only allowed when status is "Pending" or "Confirmed".
        public async Task CancelAsync(int id, int userId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                throw new NotFoundException($"Order with id {id} not found.");
            }

            // Only the order owner can cancel.
            if (order.UserId != userId)
            {
                throw new ForbiddenException("You can only cancel your own orders.");
            }

            // Only Pending or Confirmed orders can be cancelled.
            // Once Preparing, Out for Delivery, or Delivered, cancellation is not allowed.
            if (order.Status != "Pending" && order.Status != "Confirmed")
            {
                throw new BadRequestException(
                    $"Cannot cancel order with status \"{order.Status}\". Only Pending or Confirmed orders can be cancelled.");
            }

            order.Status = "Cancelled";
            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();

            // Notify the customer about cancellation.
            var notification = new CreateNotificationDto
            {
                UserId = order.UserId,
                Title = "Order Cancelled",
                Message = $"Your order #{order.Id} has been cancelled successfully."
            };

            await _notificationService.CreateAsync(notification);
        }





        public async Task DeleteAsync(int id)
        {
            var order = await  _orderRepository.GetByIdAsync(id);

            if(order == null)
            {
                throw new NotFoundException($"Order with id {id} not found.");
            }
            _orderRepository.Delete(order);
          await _orderRepository.SaveChangesAsync();

        }



        
    }
}
