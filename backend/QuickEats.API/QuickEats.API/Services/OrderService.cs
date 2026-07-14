using QuickEats.API.DTos.Order;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMenuRepository _menuRepository;
        public OrderService(IOrderRepository orderRepository, IMenuRepository menuRepository)
        {
            _orderRepository = orderRepository;
            _menuRepository = menuRepository;
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
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,

                    Items = order.OrderItems.Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity,
                    }).ToList()

                });
            }
            return response;

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
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,

                Items = order.OrderItems.Select(item => new OrderItemDto{
                    MenuItemId = item.MenuItemId,
                    Quantity = item.Quantity
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
                    TotalAmount = order.TotalAmount,
                    Status = order.Status,
                    CreatedAt = order.CreatedAt,

                    Items = order.OrderItems.Select(item => new OrderItemDto
                    {
                        MenuItemId = item.MenuItemId,
                        Quantity = item.Quantity
                    }).ToList()
                });
            }

            return response;


        }





        public async Task CreateAsync(CreateOrderDto dto,int userId)
        {
            var order = new Order
            {
                UserId = userId,
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
                    throw new Exception(
                        $"Menu Item {item.MenuItemId} not found.");
                }

                decimal unitPrice = menuItem.Price;

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
            order.TotalAmount = totalAmount;
            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();

        }


        public async Task UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
            {
                throw new Exception($"Order with Id {id} not found");

            }

            order.Status=dto.Status;
            _orderRepository.Update(order);
            await _orderRepository.SaveChangesAsync();


        }





        public async Task DeleteAsync(int id)
        {
            var order = await  _orderRepository.GetByIdAsync(id);

            if(order == null)
            {
                throw new Exception($"order with id {id}not found ");
            }
            _orderRepository.Delete(order);
          await _orderRepository.SaveChangesAsync();

        }



        
    }
}