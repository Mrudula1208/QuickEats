using QuickEats.API.DTos.SavedAddress;
using QuickEats.API.Models;
using QuickEats.API.Repositories.Interfaces;
using QuickEats.API.Services.Interfaces;

namespace QuickEats.API.Services
{
    // SavedAddressService
    // Contains the business logic
    // for Saved Addresses.

    public class SavedAddressService : ISavedAddressService
    {
        // Store the SavedAddress Repository.

        private readonly ISavedAddressRepository _addressRepository;

        public SavedAddressService(
            ISavedAddressRepository addressRepository
        )
        {
            _addressRepository = addressRepository;
        }

        // Get all Addresses of one User.

        public async Task<IEnumerable<SavedAddressResponseDto>> GetByUserIdAsync(int userId)
        {
            var addresses = await _addressRepository.GetByUserIdAsync(userId);

            var response = new List<SavedAddressResponseDto>();

            foreach (var address in addresses)
            {
                response.Add(new SavedAddressResponseDto
                {
                    AddressId = address.Id,
                    CustomerName = address.CustomerName,
                    PhoneNumber = address.PhoneNumber,
                    HouseNumber = address.HouseNumber,
                    Area = address.Area,
                    Landmark = address.Landmark,
                    City = address.City,
                    State = address.State,
                    Pincode = address.Pincode,
                    AddressType = address.AddressType,
                    IsDefault = address.IsDefault
                });
            }

            return response;
        }

        // Add a new Address.

        public async Task CreateAsync(int userId, CreateAddressDto dto)
        {
            // First Address is always the Default one.

            var existingAddresses = await _addressRepository.GetByUserIdAsync(userId);

            var isDefault = dto.IsDefault || !existingAddresses.Any();

            if (isDefault)
            {
                // Remove Default from every other Address.

                foreach (var address in existingAddresses)
                {
                    address.IsDefault = false;
                    _addressRepository.Update(address);
                }
            }

            var newAddress = new SavedAddress
            {
                UserId = userId,
                CustomerName = dto.CustomerName,
                PhoneNumber = dto.PhoneNumber,
                HouseNumber = dto.HouseNumber,
                Area = dto.Area,
                Landmark = dto.Landmark,
                City = dto.City,
                State = dto.State,
                Pincode = dto.Pincode,
                AddressType = dto.AddressType,
                IsDefault = isDefault
            };

            await _addressRepository.AddAsync(newAddress);
            await _addressRepository.SaveChangesAsync();
        }

        // Delete one Address.

        public async Task DeleteAsync(int userId, int addressId)
        {
            var address = await _addressRepository.GetByIdAsync(addressId);

            if (address == null)
            {
                throw new Exception($"Address with Id {addressId} not found.");
            }

            // A User can only delete their own Address.

            if (address.UserId != userId)
            {
                throw new Exception("You cannot delete another user's address.");
            }

            _addressRepository.Delete(address);
            await _addressRepository.SaveChangesAsync();

            // If the deleted Address was Default,
            // make the first remaining Address Default.

            if (address.IsDefault)
            {
                var remaining = (await _addressRepository.GetByUserIdAsync(userId)).ToList();

                if (remaining.Any())
                {
                    var newDefault = remaining.First();
                    newDefault.IsDefault = true;
                    _addressRepository.Update(newDefault);
                    await _addressRepository.SaveChangesAsync();
                }
            }
        }

        // Set one Address as Default.

        public async Task SetDefaultAsync(int userId, int addressId)
        {
            var addresses = (await _addressRepository.GetByUserIdAsync(userId)).ToList();

            var selected = addresses.FirstOrDefault(a => a.Id == addressId);

            if (selected == null)
            {
                throw new Exception($"Address with Id {addressId} not found.");
            }

            // Remove Default from every Address,
            // then set Default on the selected one.

            foreach (var address in addresses)
            {
                address.IsDefault = address.Id == addressId;
                _addressRepository.Update(address);
            }

            await _addressRepository.SaveChangesAsync();
        }
    }
}
