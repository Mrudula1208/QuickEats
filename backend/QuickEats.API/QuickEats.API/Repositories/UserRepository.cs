using Microsoft.EntityFrameworkCore;
using QuickEats.API.Common;
using QuickEats.API.Data;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;

namespace QuickEats.API.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<PagedResult<User>> GetPagedAsync(int page, int pageSize, string? sortBy, bool sortDesc)
        {
            var query = _context.Users.AsQueryable();

            query = sortBy?.ToLower() switch
            {
                "name" => sortDesc ? query.OrderByDescending(u => u.Name) : query.OrderBy(u => u.Name),
                "email" => sortDesc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "role" => sortDesc ? query.OrderByDescending(u => u.Role) : query.OrderBy(u => u.Role),
                "createdat" => sortDesc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                _ => query.OrderByDescending(u => u.CreatedAt)
            };

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return new PagedResult<User>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }


        public async Task AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task <User ?> GetByIdAsync(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(u=>u.Id==id);
        }
        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

    }
}