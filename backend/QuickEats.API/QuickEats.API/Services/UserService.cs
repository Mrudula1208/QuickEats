using Microsoft.AspNetCore.Identity;
using QuickEats.API.DTos.Auth;

using QuickEats.API.Helpers;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task RegisterAsync(RegisterRequestDto request)
        {
        var existinguser= await _userRepository.GetByEmailAsync(request.Email);

            if(existinguser != null)
            {
                throw new Exception("user already exits");
            }


            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                PasswordHash = PasswordHasher.Hash(request.Password)
            };
            await _userRepository.AddAsync(user);



         }



        public async Task<string> LoginAsync(LoginRequestDto request)
        {
            var user= await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                throw new Exception("User Not Found");
            }

            bool isValid = PasswordHasher.Verify(request.Password, user.PasswordHash);

            if (!isValid){
                throw new Exception("Invalid Password");
            }

            return "Login Success";
        }













    }
}



















//UserService needs Repository.
//ASP.NET gives Repository.
//UserService stores it in _repository.