using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.User;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IUserService
    {
        Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(UserFilterDto filter, PaginationParams pagination);
        Task<ApiResponse<UserDto>> GetUserByIdAsync(string userId);
        Task<ApiResponse<UserDto>> UpdateUserAsync(string userId, UpdateUserDto updateUserDto);
        Task<ApiResponse<UserDto>> UpdateUserRoleAsync(string userId, UpdateUserRoleDto updateRoleDto);
        Task<ApiResponse> DeactivateUserAsync(string userId);
        Task<ApiResponse> ActivateUserAsync(string userId);
        Task<ApiResponse<UserProfileDto>> GetUserProfileAsync(string userId);
        Task<ApiResponse<UserProfileDto>> UpdateUserProfileAsync(string userId, UpdateUserProfileDto updateProfileDto);
        Task<ApiResponse<IEnumerable<AddressDto>>> GetUserAddressesAsync(string userId);
        Task<ApiResponse<AddressDto>> AddUserAddressAsync(string userId, CreateAddressDto createAddressDto);
        Task<ApiResponse<AddressDto>> UpdateUserAddressAsync(string userId, int addressId, UpdateAddressDto updateAddressDto);
        Task<ApiResponse> DeleteUserAddressAsync(string userId, int addressId);
        Task<ApiResponse<UserStatsDto>> GetUserStatsAsync(string userId);
    }
}