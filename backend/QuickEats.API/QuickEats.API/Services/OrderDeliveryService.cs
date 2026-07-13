using QuickEats.API.DTos.OrderDelivery;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;
using System.Collections.Specialized;

namespace QuickEats.API.Services
{
    public class OrderDeliveryService:IOrderDeliveryService
    {
        private readonly IOrderDeliveryRepository _orderDeliveryRepository;
        public OrderDeliveryService(IOrderDeliveryRepository orderDeliveryRepository)
        {
            _orderDeliveryRepository = orderDeliveryRepository;
        }

        public async Task<IEnumerable<OrderDeliveryResponseDto>> GetAllAsync()
        {
            var deliveries= await _orderDeliveryRepository.GetAllAsync();

            var response = new List<OrderDeliveryResponseDto>();

            foreach (var delivery in deliveries)
            {
                response.Add(new OrderDeliveryResponseDto
                {
                    Id = delivery.Id,
                    OrderId = delivery.OrderId,
                    DeliveryPartnerId = delivery.DeliveryPartnerId,
                    DeliveryStatus = delivery.DeliveryStatus,
                    AssignedAt = delivery.AssignedAt,
                });
            }
            return response;
            

        }



        public async Task <OrderDeliveryResponseDto>GetByIdAsync(int id)
        {
            var delivery = await _orderDeliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                return null;
            }
            return new OrderDeliveryResponseDto
            {
                Id = delivery.Id,
                OrderId = delivery.OrderId,
                DeliveryPartnerId = delivery.DeliveryPartnerId,
                DeliveryStatus = delivery.DeliveryStatus,
                AssignedAt = delivery.AssignedAt,
            };


        }

        public async Task <OrderDeliveryResponseDto> GetByOrderidAsync(int orderId)
        {
            var delivery = await _orderDeliveryRepository.GetByOrderIdAsync(orderId);
            if (delivery == null)
            {
                return null;
            }
            return new OrderDeliveryResponseDto
            {
                Id = delivery.Id,
                OrderId = delivery.OrderId,
                DeliveryPartnerId = delivery.DeliveryPartnerId,
                DeliveryStatus = delivery.DeliveryStatus,
                AssignedAt = delivery.AssignedAt,
            };
        }



        public async Task CreateAsync(CreateOrderDeliveryDto dto)
        {
            var delivery = new OrderDelivery
            {
                OrderId = dto.OrderId,
                DeliveryPartnerId = dto.DeliveryPartnerId,
                DeliveryStatus = "Assigned",
                AssignedAt = DateTime.UtcNow
            };
            await _orderDeliveryRepository.AddAsync(delivery);
            await _orderDeliveryRepository.SaveChangesAsync();
        }


        public async Task UpdateStatusAsync(int id, UpdateDeliveryStatusDto dto)
        {
            var delivery = await _orderDeliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                throw new Exception($"Delivery with Id {id} not found.");

            }
            delivery.DeliveryStatus = dto.DeliveryStatus;
            _orderDeliveryRepository.Update(delivery);
            await _orderDeliveryRepository.SaveChangesAsync();
        }
        public async Task DeleteAsync(int id)
        {
            var delivery = await _orderDeliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                throw new Exception($"Delivery with Id {id} not found.");

            }
            _orderDeliveryRepository.Delete(delivery);
            await _orderDeliveryRepository.SaveChangesAsync();
        }



    }
}
