using Microsoft.EntityFrameworkCore;
using QuickEats.API.DTos.Restaurant;
using QuickEats.API.Models;

namespace QuickEats.API.Repositories.Interfaces
{
    public interface IRestaurantRepository
    {

        Task<IEnumerable<Restaurant>> GetAllAsync();

        Task<Restaurant?> GetByIdAsync(int id);

        Task AddAsync(Restaurant restaurant);

        void Update(Restaurant restaurant);

        void Delete(Restaurant restaurant);

        Task SaveChangesAsync();
    }
}
//What actually happens?
//Step 1

//Frontend sends:

//{
//    "name":"Burger King",
//  "address":"Mumbai",
//  "phoneNumber":"9876543210"
//}

//↓

//Step 2

//Controller receives:

//CreateRestaurantDto dto

//↓

//Step 3

//Service receives:

//CreateRestaurantDto dto

//↓

//Step 4

//Service creates Restaurant Entity

//var restaurant = new Restaurant
//                 {
//                     Name = dto.Name,
//                     Address = dto.Address,
//                     PhoneNumber = dto.PhoneNumber
//                 };

//Now:

//DTO Data
//   ↓
//Copied Into
//   ↓
//Restaurant Entity
//Step 5

//Service sends Entity to Repository

//await _repository.AddAsync(restaurant);

//Repository receives:

//Restaurant restaurant
//Step 6

//Repository saves Entity to Database

//await _context.Restaurants.AddAsync(restaurant);

//await _context.SaveChangesAsync();

//Database gets:

//Id Name         Address   Phone
//1     Burger King  Mumbai    9876543210