using ElectronicsStore.Core.DTOs.Auth;
using ElectronicsStore.Core.DTOs.Common;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto);
        Task<ApiResponse> LogoutAsync(string userId);
        Task<ApiResponse> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<ApiResponse> ForgotPasswordAsync(string email);
        Task<ApiResponse> ResetPasswordAsync(string email, string token, string newPassword);
        Task<ApiResponse> ConfirmEmailAsync(string userId, string token);
        Task<ApiResponse> ResendEmailConfirmationAsync(string email);
        Task<string> GenerateJwtTokenAsync(string userId);
        Task<bool> ValidateTokenAsync(string token);
    }
}