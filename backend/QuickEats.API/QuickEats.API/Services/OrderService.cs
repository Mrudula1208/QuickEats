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
            return orders.Select(ToResponseDto).ToList();
        }

        public async Task<PagedResult<OrderResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var pagedResult = await _orderRepository.GetPagedAsync(page, pageSize, sortBy, sortDesc);

            var response = pagedResult.Items.Select(ToResponseDto).ToList();

            return new PagedResult<OrderResponseDto>
            {
                Items = response,
                TotalCount = pagedResult.TotalCount,
                Page = pagedResult.Page,
                PageSize = pagedResult.PageSize
            };
        }

        public async Task<OrderResponseDto?> GetByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                return null;
            }
            return ToResponseDto(order);
        }

        public async Task<IEnumerable<OrderResponseDto>> GetByUserIdAsync(int userId)
        {
            var orders = await _orderRepository.GetByUserIdAsync(userId);
            return orders.Select(ToResponseDto).ToList();
        }

        public async Task<IEnumerable<OrderResponseDto>> GetByOwnerIdAsync(int ownerId)
        {
            var orders = await _orderRepository.GetByOwnerIdAsync(ownerId);
            return orders.Select(ToResponseDto).ToList();
        }

        public async Task<int> CreateAsync(CreateOrderDto dto, int userId)
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

                // Prevent cross-restaurant item injection: every item must belong
                // to the restaurant the customer is ordering from.
                if (menuItem.RestaurantId != dto.RestaurantId)
                {
                    throw new BadRequestException(
                        $"Menu Item \"{menuItem.Name}\" does not belong to the selected restaurant.");
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

            string normalizedStatus = NormalizeStatus(dto.Status);

            if (!IsValidStatus(normalizedStatus))
            {
                throw new BadRequestException($"Invalid order status: \"{dto.Status}\".");
            }

            ValidateStatusTransition(order.Status, normalizedStatus);

            order.Status = normalizedStatus;

            if (string.Equals(normalizedStatus, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                order.CancelledBy = "Owner";
                order.CancelledAt = DateTime.UtcNow;
            }

            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();

            var notification = new CreateNotificationDto
            {
                UserId = order.UserId,
                Title = "Order Status Updated",
                Message = $"Your order #{order.Id} status has been updated to {normalizedStatus}."
            };

            await _notificationService.CreateAsync(notification);
        }

        /// <summary>
        /// Applies an Admin-authorised emergency override to the order status.
        /// The override is validated against the same legal lifecycle plus a small
        /// set of "rescue" transitions (e.g. cancel a stuck order) and every
        /// override is persisted to the audit table so nothing happens silently.
        /// </summary>
        public async Task<string> OverrideStatusAsync(int id, string newStatus, string reason, int adminId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                throw new NotFoundException($"Order with id {id} not found.");
            }

            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new BadRequestException("A reason is required for an admin override.");
            }

            string normalizedStatus = NormalizeStatus(newStatus);
            if (!IsValidStatus(normalizedStatus))
            {
                throw new BadRequestException($"Invalid order status: \"{newStatus}\".");
            }

            string previousStatus = order.Status;

            // Allow the normal forward transitions plus the admin "rescue" transitions.
            if (!ValidateOverrideTransition(previousStatus, normalizedStatus))
            {
                throw new BadRequestException(
                    $"Admin override from \"{previousStatus}\" to \"{normalizedStatus}\" is not permitted.");
            }

            order.Status = normalizedStatus;

            if (string.Equals(normalizedStatus, "Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                order.CancelledBy = "Admin";
                order.CancelledAt = DateTime.UtcNow;
            }

            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();

            // Audit log: who, what, why, when.
            await _orderRepository.AddAdminOverrideAsync(new AdminOrderOverride
            {
                OrderId = order.Id,
                AdminId = adminId,
                FromStatus = previousStatus,
                ToStatus = normalizedStatus,
                Reason = reason,
                CreatedAt = DateTime.UtcNow
            });
            await _orderRepository.SaveChangesAsync();

            // Notify the customer so the status change is never silent.
            var notification = new CreateNotificationDto
            {
                UserId = order.UserId,
                Title = "Order Status Updated",
                Message = $"Your order #{order.Id} status has been updated to {normalizedStatus}."
            };

            await _notificationService.CreateAsync(notification);

            return normalizedStatus;
        }

        /// <summary>
        /// Cancels an order by an Admin (exceptional cases). Admin can cancel
        /// Pending or Confirmed orders, recording who authorised the cancellation.
        /// </summary>
        public async Task AdminCancelAsync(int id, int adminId)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                throw new NotFoundException($"Order with id {id} not found.");
            }

            if (order.Status != "Pending" && order.Status != "Confirmed")
            {
                throw new BadRequestException(
                    $"Cannot cancel order with status \"{order.Status}\". Only Pending or Confirmed orders can be cancelled.");
            }

            string previousStatus = order.Status;
            order.Status = "Cancelled";
            order.CancelledBy = "Admin";
            order.CancelledAt = DateTime.UtcNow;
            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();

            await _orderRepository.AddAdminOverrideAsync(new AdminOrderOverride
            {
                OrderId = order.Id,
                AdminId = adminId,
                FromStatus = previousStatus,
                ToStatus = "Cancelled",
                Reason = "Admin cancelled the order.",
                CreatedAt = DateTime.UtcNow
            });
            await _orderRepository.SaveChangesAsync();

            var notification = new CreateNotificationDto
            {
                UserId = order.UserId,
                Title = "Order Cancelled",
                Message = $"Your order #{order.Id} has been cancelled."
            };

            await _notificationService.CreateAsync(notification);
        }

        public static string NormalizeStatus(string? status)
        {
            string normalizedStatus = status?.Trim() ?? string.Empty;
            if (string.Equals(normalizedStatus, "Ready", StringComparison.OrdinalIgnoreCase))
                normalizedStatus = "Ready for Pickup";
            else if (string.Equals(normalizedStatus, "OutForDelivery", StringComparison.OrdinalIgnoreCase))
                normalizedStatus = "Out for Delivery";
            else if (string.Equals(normalizedStatus, "PickedUp", StringComparison.OrdinalIgnoreCase))
                normalizedStatus = "Picked Up";

            var validStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Pending", "Confirmed", "Preparing", "Ready for Pickup", "Assigned", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"
            };

            if (validStatuses.Contains(normalizedStatus))
            {
                return validStatuses.First(s => s.Equals(normalizedStatus, StringComparison.OrdinalIgnoreCase));
            }

            return normalizedStatus;
        }

        private static bool IsValidStatus(string status)
        {
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "Pending", "Confirmed", "Preparing", "Ready for Pickup", "Assigned", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"
            }.Contains(status);
        }

        /// <summary>
        /// Enforces the legal order lifecycle so statuses can only move forward.
        /// Pending -> Confirmed -> Preparing -> Ready for Pickup -> Assigned -> Picked Up -> Out for Delivery -> Delivered.
        /// Cancelled is a terminal state that may only be entered from Pending or Confirmed.
        /// </summary>
        private static void ValidateStatusTransition(string currentStatus, string newStatus)
        {
            if (string.Equals(newStatus, currentStatus, StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var allowedTransitions = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["Pending"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Confirmed", "Cancelled" },
                ["Confirmed"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Preparing", "Cancelled" },
                ["Preparing"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ready for Pickup" },
                ["Ready for Pickup"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Assigned" },
                ["Assigned"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Picked Up" },
                ["Picked Up"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Out for Delivery" },
                ["Out for Delivery"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Delivered" },
                ["Delivered"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { },
                ["Cancelled"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { }
            };

            if (!allowedTransitions.TryGetValue(currentStatus, out var nextStatuses) ||
                !nextStatuses.Contains(newStatus))
            {
                throw new BadRequestException(
                    $"Invalid order status transition: \"{currentStatus}\" -> \"{newStatus}\". " +
                    "Order status must advance in sequence: Pending -> Confirmed -> Preparing -> Ready for Pickup -> Assigned -> Picked Up -> Out for Delivery -> Delivered.");
            }
        }

        /// <summary>
        /// Admin override validation: normal forward transitions are always allowed.
        /// In addition Admin may cancel an order from any pre-delivery state (rescue
        /// scenario), but never deliver/pick-up/skip stages or revive a cancelled/completed order.
        /// </summary>
        private static bool ValidateOverrideTransition(string currentStatus, string newStatus)
        {
            if (string.Equals(newStatus, currentStatus, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            var activeStatuses = new[] { "Pending", "Confirmed", "Preparing", "Ready for Pickup", "Assigned", "Picked Up", "Out for Delivery" };

            // Rescue: admin may cancel any in-flight (not yet delivered) order.
            if (string.Equals(newStatus, "Cancelled", StringComparison.OrdinalIgnoreCase) &&
                activeStatuses.Contains(currentStatus, StringComparer.OrdinalIgnoreCase))
            {
                return true;
            }

            // Otherwise only the legal forward transitions are allowed.
            try
            {
                ValidateStatusTransition(currentStatus, newStatus);
                return true;
            }
            catch (BadRequestException)
            {
                return false;
            }
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
            order.CancelledBy = "Customer";
            order.CancelledAt = DateTime.UtcNow;
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
            var order = await _orderRepository.GetByIdAsync(id);

            if (order == null)
            {
                throw new NotFoundException($"Order with id {id} not found.");
            }
            _orderRepository.Delete(order);
            await _orderRepository.SaveChangesAsync();
        }

        // Build the shared response DTO.
        internal static OrderResponseDto ToResponseDto(Order order)
        {
            var delivery = order.OrderDeliveries?.FirstOrDefault();
            var payment = order.Payments?.FirstOrDefault();

            return new OrderResponseDto
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
                PaymentStatus = payment?.PaymentStatus ?? "Pending",
                DeliveryStatus = delivery?.DeliveryStatus ?? "",
                DeliveryPartnerName = delivery?.DeliveryPartner?.Name ?? "",
                CancelledBy = order.CancelledBy,
                CancelledAt = order.CancelledAt,
                CreatedAt = order.CreatedAt,

                Items = order.OrderItems.Select(item => new OrderItemDto
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