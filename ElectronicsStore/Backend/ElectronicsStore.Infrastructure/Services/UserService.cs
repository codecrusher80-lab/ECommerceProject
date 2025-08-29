using AutoMapper;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.User;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Repositories;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ElectronicsStore.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserService(
            IUnitOfWork unitOfWork, 
            IMapper mapper, 
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(UserFilterDto filter, PaginationParams pagination)
        {
            try
            {
                var query = _unitOfWork.Users.Query();

                // Apply filters
                if (!string.IsNullOrEmpty(filter.SearchTerm))
                {
                    query = query.Where(u => u.FirstName.Contains(filter.SearchTerm) ||
                                           u.LastName.Contains(filter.SearchTerm) ||
                                           u.Email.Contains(filter.SearchTerm) ||
                                           u.PhoneNumber.Contains(filter.SearchTerm));
                }

                if (filter.IsActive.HasValue)
                    query = query.Where(u => u.IsActive == filter.IsActive.Value);

                // Role filtering will be done after query execution using UserManager

                if (filter.FromDate.HasValue)
                    query = query.Where(u => u.CreatedAt >= filter.FromDate.Value);

                if (filter.ToDate.HasValue)
                    query = query.Where(u => u.CreatedAt <= filter.ToDate.Value);

                // Apply sorting
                query = filter.SortBy?.ToLower() switch
                {
                    "name" => filter.SortDescending 
                        ? query.OrderByDescending(u => u.FirstName).ThenByDescending(u => u.LastName)
                        : query.OrderBy(u => u.FirstName).ThenBy(u => u.LastName),
                    "email" => filter.SortDescending 
                        ? query.OrderByDescending(u => u.Email)
                        : query.OrderBy(u => u.Email),
                    "date" => filter.SortDescending 
                        ? query.OrderByDescending(u => u.CreatedAt)
                        : query.OrderBy(u => u.CreatedAt),
                    _ => query.OrderByDescending(u => u.CreatedAt)
                };

                var totalItems = await query.CountAsync();
                var users = await query
                    .Skip((pagination.PageNumber - 1) * pagination.PageSize)
                    .Take(pagination.PageSize)
                    .ToListAsync();

                var userDtos = _mapper.Map<List<UserDto>>(users);
                
                var result = new PagedResult<UserDto>
                {
                    Items = userDtos,
                    TotalItems = totalItems,
                    PageNumber = pagination.PageNumber,
                    PageSize = pagination.PageSize
                };

                return ApiResponse<PagedResult<UserDto>>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ApiResponse<PagedResult<UserDto>>.ErrorResponse($"Error retrieving users: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserDto>> GetUserByIdAsync(string userId)
        {
            try
            {
                var user = await _unitOfWork.Users.Query()
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return ApiResponse<UserDto>.ErrorResponse("User not found");

                var userDto = _mapper.Map<UserDto>(user);
                return ApiResponse<UserDto>.SuccessResponse(userDto);
            }
            catch (Exception ex)
            {
                return ApiResponse<UserDto>.ErrorResponse($"Error retrieving user: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserDto>> UpdateUserAsync(string userId, UpdateUserDto updateUserDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return ApiResponse<UserDto>.ErrorResponse("User not found");

                // Update user properties
                if (!string.IsNullOrEmpty(updateUserDto.FirstName))
                    user.FirstName = updateUserDto.FirstName;
                
                if (!string.IsNullOrEmpty(updateUserDto.LastName))
                    user.LastName = updateUserDto.LastName;
                
                if (!string.IsNullOrEmpty(updateUserDto.PhoneNumber))
                    user.PhoneNumber = updateUserDto.PhoneNumber;

                if (updateUserDto.DateOfBirth.HasValue)
                    user.DateOfBirth = updateUserDto.DateOfBirth.Value;

                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return ApiResponse<UserDto>.ErrorResponse(string.Join(", ", result.Errors.Select(e => e.Description)));

                var userDto = _mapper.Map<UserDto>(user);
                return ApiResponse<UserDto>.SuccessResponse(userDto, "User updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<UserDto>.ErrorResponse($"Error updating user: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserDto>> UpdateUserRoleAsync(string userId, UpdateUserRoleDto updateRoleDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return ApiResponse<UserDto>.ErrorResponse("User not found");

                // Check if role exists
                var roleExists = await _roleManager.RoleExistsAsync(updateRoleDto.Role);
                if (!roleExists)
                    return ApiResponse<UserDto>.ErrorResponse("Role does not exist");

                // Remove user from all current roles
                var currentRoles = await _userManager.GetRolesAsync(user);
                if (currentRoles.Any())
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    if (!removeResult.Succeeded)
                        return ApiResponse<UserDto>.ErrorResponse("Failed to remove current roles");
                }

                // Add user to new role
                var addResult = await _userManager.AddToRoleAsync(user, updateRoleDto.Role);
                if (!addResult.Succeeded)
                    return ApiResponse<UserDto>.ErrorResponse("Failed to add new role");

                // Refresh user data
                user = await _unitOfWork.Users.Query()
                    .FirstOrDefaultAsync(u => u.Id == userId);

                var userDto = _mapper.Map<UserDto>(user);
                return ApiResponse<UserDto>.SuccessResponse(userDto, "User role updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<UserDto>.ErrorResponse($"Error updating user role: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeactivateUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return ApiResponse.ErrorResponse("User not found");

                user.IsActive = false;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return ApiResponse.ErrorResponse(string.Join(", ", result.Errors.Select(e => e.Description)));

                return ApiResponse.SuccessResponse("User deactivated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deactivating user: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ActivateUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return ApiResponse.ErrorResponse("User not found");

                user.IsActive = true;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return ApiResponse.ErrorResponse(string.Join(", ", result.Errors.Select(e => e.Description)));

                return ApiResponse.SuccessResponse("User activated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error activating user: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserProfileDto>> GetUserProfileAsync(string userId)
        {
            try
            {
                var user = await _unitOfWork.Users.Query()
                    .Include(u => u.Addresses)
                    .Include(u => u.Orders)
                    .Include(u => u.Reviews)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return ApiResponse<UserProfileDto>.ErrorResponse("User not found");

                var profile = new UserProfileDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    DateOfBirth = user.DateOfBirth,
                    JoinDate = user.CreatedAt,
                    TotalOrders = user.Orders.Count,
                    TotalReviews = user.Reviews.Count,
                    Addresses = _mapper.Map<List<AddressDto>>(user.Addresses)
                };

                return ApiResponse<UserProfileDto>.SuccessResponse(profile);
            }
            catch (Exception ex)
            {
                return ApiResponse<UserProfileDto>.ErrorResponse($"Error retrieving user profile: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserProfileDto>> UpdateUserProfileAsync(string userId, UpdateUserProfileDto updateProfileDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return ApiResponse<UserProfileDto>.ErrorResponse("User not found");

                // Update profile properties
                if (!string.IsNullOrEmpty(updateProfileDto.FirstName))
                    user.FirstName = updateProfileDto.FirstName;
                
                if (!string.IsNullOrEmpty(updateProfileDto.LastName))
                    user.LastName = updateProfileDto.LastName;
                
                if (!string.IsNullOrEmpty(updateProfileDto.PhoneNumber))
                    user.PhoneNumber = updateProfileDto.PhoneNumber;

                if (updateProfileDto.DateOfBirth.HasValue)
                    user.DateOfBirth = updateProfileDto.DateOfBirth.Value;

                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return ApiResponse<UserProfileDto>.ErrorResponse(string.Join(", ", result.Errors.Select(e => e.Description)));

                // Get updated profile
                return await GetUserProfileAsync(userId);
            }
            catch (Exception ex)
            {
                return ApiResponse<UserProfileDto>.ErrorResponse($"Error updating user profile: {ex.Message}");
            }
        }

        public async Task<ApiResponse<IEnumerable<AddressDto>>> GetUserAddressesAsync(string userId)
        {
            try
            {
                var addresses = await _unitOfWork.Addresses.FindAsync(a => a.UserId == userId);
                var addressDtos = _mapper.Map<IEnumerable<AddressDto>>(addresses);
                return ApiResponse<IEnumerable<AddressDto>>.SuccessResponse(addressDtos);
            }
            catch (Exception ex)
            {
                return ApiResponse<IEnumerable<AddressDto>>.ErrorResponse($"Error retrieving user addresses: {ex.Message}");
            }
        }

        public async Task<ApiResponse<AddressDto>> AddUserAddressAsync(string userId, CreateAddressDto createAddressDto)
        {
            try
            {
                var address = _mapper.Map<Address>(createAddressDto);
                address.UserId = userId;

                await _unitOfWork.Addresses.AddAsync(address);
                await _unitOfWork.SaveChangesAsync();

                var addressDto = _mapper.Map<AddressDto>(address);
                return ApiResponse<AddressDto>.SuccessResponse(addressDto, "Address added successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<AddressDto>.ErrorResponse($"Error adding address: {ex.Message}");
            }
        }

        public async Task<ApiResponse<AddressDto>> UpdateUserAddressAsync(string userId, int addressId, UpdateAddressDto updateAddressDto)
        {
            try
            {
                var address = await _unitOfWork.Addresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                    return ApiResponse<AddressDto>.ErrorResponse("Address not found");

                _mapper.Map(updateAddressDto, address);
                await _unitOfWork.Addresses.UpdateAsync(address);
                await _unitOfWork.SaveChangesAsync();

                var addressDto = _mapper.Map<AddressDto>(address);
                return ApiResponse<AddressDto>.SuccessResponse(addressDto, "Address updated successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<AddressDto>.ErrorResponse($"Error updating address: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteUserAddressAsync(string userId, int addressId)
        {
            try
            {
                var address = await _unitOfWork.Addresses
                    .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

                if (address == null)
                    return ApiResponse.ErrorResponse("Address not found");

                await _unitOfWork.Addresses.DeleteAsync(address);
                await _unitOfWork.SaveChangesAsync();

                return ApiResponse.SuccessResponse("Address deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deleting address: {ex.Message}");
            }
        }

        public async Task<ApiResponse<UserStatsDto>> GetUserStatsAsync(string userId)
        {
            try
            {
                var user = await _unitOfWork.Users.Query()
                    .Include(u => u.Orders)
                    .ThenInclude(o => o.OrderItems)
                    .Include(u => u.Reviews)
                    .Include(u => u.WishlistItems)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                    return ApiResponse<UserStatsDto>.ErrorResponse("User not found");

                var totalSpent = user.Orders
                    .Where(o => o.Status == Core.Enums.OrderStatus.Delivered)
                    .Sum(o => o.TotalAmount);

                var stats = new UserStatsDto
                {
                    TotalOrders = user.Orders.Count,
                    CompletedOrders = user.Orders.Count(o => o.Status == Core.Enums.OrderStatus.Delivered),
                    TotalSpent = totalSpent,
                    TotalReviews = user.Reviews.Count,
                    WishlistItems = user.WishlistItems.Count,
                    JoinDate = user.CreatedAt,
                    LastOrderDate = user.Orders.OrderByDescending(o => o.CreatedAt).FirstOrDefault()?.CreatedAt
                };

                return ApiResponse<UserStatsDto>.SuccessResponse(stats);
            }
            catch (Exception ex)
            {
                return ApiResponse<UserStatsDto>.ErrorResponse($"Error retrieving user stats: {ex.Message}");
            }
        }
    }
}