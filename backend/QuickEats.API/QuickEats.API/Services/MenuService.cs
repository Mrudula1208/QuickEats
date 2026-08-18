using QuickEats.API.Common;
using QuickEats.API.DTos.Menu;
using QuickEats.API.Exceptions;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepository;
        public MenuService(IMenuRepository menuRepository)
        {
            _menuRepository = menuRepository;
        }

        public async Task<IEnumerable<MenuResponseDto>> GetAllAsync()
        {
            var menuItems = await _menuRepository.GetAllAsync();

            var response = new List<MenuResponseDto>();
            // (3) Loop through every MenuIttem returned from the database.

            foreach (var menuItem in menuItems)

            {     // (4) Convert the MenuItem Entiity into MenuResponseDto.
                response.Add(new MenuResponseDto
                {
                    Id = menuItem.Id,
                    RestaurantId = menuItem.RestaurantId,
                    Name = menuItem.Name,
                    Description = menuItem.Description,
                    Price = menuItem.Price,
                    ImageUrl = menuItem.ImageUrl,
                    IsAvailable = menuItem.IsAvailable,
                    Category = menuItem.Category,
                    IsVeg = menuItem.IsVeg,
                    IsBestseller = menuItem.IsBestseller,
                    DiscountPercent = menuItem.DiscountPercent});
        }
            return response;
        
        }

        public async Task<PagedResult<MenuResponseDto>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var pagedResult = await _menuRepository.GetPagedAsync(page, pageSize, sortBy, sortDesc);

            var response = new List<MenuResponseDto>();

            foreach (var menuItem in pagedResult.Items)
            {
                response.Add(new MenuResponseDto
                {
                    Id = menuItem.Id,
                    RestaurantId = menuItem.RestaurantId,
                    Name = menuItem.Name,
                    Description = menuItem.Description,
                    Price = menuItem.Price,
                    ImageUrl = menuItem.ImageUrl,
                    IsAvailable = menuItem.IsAvailable,
                    Category = menuItem.Category,
                    IsVeg = menuItem.IsVeg,
                    IsBestseller = menuItem.IsBestseller,
                    DiscountPercent = menuItem.DiscountPercent
                });
            }

            return new PagedResult<MenuResponseDto>
            {
                Items = response,
                TotalCount = pagedResult.TotalCount,
                Page = pagedResult.Page,
                PageSize = pagedResult.PageSize
            };
        }


        public async Task<IEnumerable<string>> GetCategoriesAsync()
        {
            var menuItems = await _menuRepository.GetAllAsync();

            return menuItems
                .Select(m => m.Category)
                .Where(c => !string.IsNullOrWhiteSpace(c))
                .Distinct()
                .OrderBy(c => c)
                .ToList();
        }

        public async Task<MenuResponseDto?> GetByIdAsync(int id)
        {
            var menuItem = await _menuRepository.GetByIdAsync(id);
            if (menuItem == null)
            {
                return null;
            }
            var response= new MenuResponseDto
            {
                Id = menuItem.Id,
                RestaurantId = menuItem.RestaurantId,
                Name = menuItem.Name,
                Description = menuItem.Description,
                Price = menuItem.Price,
                ImageUrl = menuItem.ImageUrl,
                IsAvailable = menuItem.IsAvailable,
                    Category = menuItem.Category,
                    IsVeg = menuItem.IsVeg,
                    IsBestseller = menuItem.IsBestseller,
                    DiscountPercent = menuItem.DiscountPercent};
            return response;
        }


        public async Task <IEnumerable<MenuResponseDto>> GetByRestaurantIdAsync(int restaurantId)
        {
            var menuItems = await _menuRepository.GetByRestaurantIdAsync(restaurantId);
            var response = new List<MenuResponseDto>();
            foreach (var menuItem in menuItems)
            {
                response.Add(new MenuResponseDto
                {
                    Id = menuItem.Id,
                    RestaurantId = menuItem.RestaurantId,
                    Name = menuItem.Name,
                    Description = menuItem.Description,
                    Price = menuItem.Price,
                    ImageUrl = menuItem.ImageUrl,
                    IsAvailable = menuItem.IsAvailable,
                    Category = menuItem.Category,
                    IsVeg = menuItem.IsVeg,
                    IsBestseller = menuItem.IsBestseller,
                    DiscountPercent = menuItem.DiscountPercent});
            }
            return response;
        }



        public async Task CreateAsync(CreateMenuDto dto)
        {
            var menuItem = new MenuItem
            {
                RestaurantId = dto.RestaurantId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                ImageUrl = dto.ImageUrl,
                IsAvailable = dto.IsAvailable,
                Category = dto.Category,
                IsVeg = dto.IsVeg,
                IsBestseller = dto.IsBestseller,
                DiscountPercent = dto.DiscountPercent

            };
            //ask repo to add the new menu item
            await _menuRepository.AddAsync(menuItem);
            await _menuRepository.SaveChangesAsync();
        }


        public async Task UpdateAsync(int id,UpdateMenuDto dto)
        {
            var menuItem=await _menuRepository.GetByIdAsync(id);

            if(menuItem==null)
            {
                throw new NotFoundException($"Menu item with id {id} not found.");
            }

            menuItem.Name = dto.Name;
            menuItem.Description = dto.Description;
            menuItem.Price = dto.Price;
            menuItem.ImageUrl = dto.ImageUrl;
            menuItem.IsAvailable = dto.IsAvailable;
            menuItem.Category = dto.Category;
            menuItem.IsVeg = dto.IsVeg;
            menuItem.IsBestseller = dto.IsBestseller;
            menuItem.DiscountPercent = dto.DiscountPercent;

            _menuRepository.Update(menuItem);
            await _menuRepository.SaveChangesAsync();
        }
        public async Task DeleteAsync(int id)
        {
            var menuItem = await _menuRepository.GetByIdAsync(id);
            if (menuItem == null)
            {
                throw new NotFoundException($"Menu item with id {id} not found.");

            }
                _menuRepository.Delete(menuItem);
                await _menuRepository.SaveChangesAsync();
            }


    }
}

