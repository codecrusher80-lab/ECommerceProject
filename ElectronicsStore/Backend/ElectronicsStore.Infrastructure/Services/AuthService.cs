using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ElectronicsStore.Core.DTOs.Auth;
using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.Entities;
using ElectronicsStore.Core.Interfaces.Services;
using ElectronicsStore.Core.Constants;

namespace ElectronicsStore.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return ApiResponse<AuthResponseDto>.ErrorResponse("User with this email already exists");
                }

                // Create new user
                var user = new User
                {
                    UserName = registerDto.Email,
                    Email = registerDto.Email,
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    PhoneNumber = registerDto.PhoneNumber,
                    DateOfBirth = registerDto.DateOfBirth,
                    Gender = registerDto.Gender,
                    EmailConfirmed = false
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);
                if (!result.Succeeded)
                {
                    return ApiResponse<AuthResponseDto>.ErrorResponse("Failed to create user", result.Errors.Select(e => e.Description).ToList());
                }

                // Add user to Customer role
                await _userManager.AddToRoleAsync(user, AppConstants.Roles.Customer);

                // Generate email confirmation token
                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                
                // Send confirmation email (implement based on your email service)
                await _emailService.SendEmailConfirmationAsync(user.Email, user.FirstName, emailToken);

                // Generate JWT token
                var token = await GenerateJwtTokenAsync(user.Id);
                var roles = await _userManager.GetRolesAsync(user);

                var authResponse = new AuthResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddHours(_configuration.GetValue<int>("JwtSettings:ExpirationHours")),
                    Roles = roles.ToList()
                };

                return ApiResponse<AuthResponseDto>.SuccessResponse(authResponse, "User registered successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse($"Registration failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null || !user.IsActive)
                {
                    return ApiResponse<AuthResponseDto>.ErrorResponse("Invalid email or password");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);
                if (!result.Succeeded)
                {
                    if (result.IsLockedOut)
                    {
                        return ApiResponse<AuthResponseDto>.ErrorResponse("Account is locked out. Please try again later.");
                    }
                    return ApiResponse<AuthResponseDto>.ErrorResponse("Invalid email or password");
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                // Generate JWT token
                var token = await GenerateJwtTokenAsync(user.Id);
                var roles = await _userManager.GetRolesAsync(user);

                var authResponse = new AuthResponseDto
                {
                    UserId = user.Id,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Token = token,
                    ExpiresAt = DateTime.UtcNow.AddHours(_configuration.GetValue<int>("JwtSettings:ExpirationHours")),
                    Roles = roles.ToList()
                };

                return ApiResponse<AuthResponseDto>.SuccessResponse(authResponse, "Login successful");
            }
            catch (Exception ex)
            {
                return ApiResponse<AuthResponseDto>.ErrorResponse($"Login failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse> LogoutAsync(string userId)
        {
            try
            {
                // In a JWT-based system, logout is typically handled on the client side
                // You might want to implement token blacklisting if needed
                await _signInManager.SignOutAsync();
                return ApiResponse.SuccessResponse("Logout successful");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Logout failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse.ErrorResponse("User not found");
                }

                var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
                if (!result.Succeeded)
                {
                    return ApiResponse.ErrorResponse("Failed to change password", result.Errors.Select(e => e.Description).ToList());
                }

                return ApiResponse.SuccessResponse("Password changed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Password change failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ForgotPasswordAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    // Don't reveal that user doesn't exist
                    return ApiResponse.SuccessResponse("If the email exists, a password reset link has been sent");
                }

                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _emailService.SendPasswordResetAsync(user.Email, user.FirstName, resetToken);

                return ApiResponse.SuccessResponse("Password reset email sent");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Password reset failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ResetPasswordAsync(string email, string token, string newPassword)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return ApiResponse.ErrorResponse("Invalid reset token");
                }

                var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
                if (!result.Succeeded)
                {
                    return ApiResponse.ErrorResponse("Failed to reset password", result.Errors.Select(e => e.Description).ToList());
                }

                return ApiResponse.SuccessResponse("Password reset successful");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Password reset failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ConfirmEmailAsync(string userId, string token)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return ApiResponse.ErrorResponse("Invalid confirmation link");
                }

                var result = await _userManager.ConfirmEmailAsync(user, token);
                if (!result.Succeeded)
                {
                    return ApiResponse.ErrorResponse("Email confirmation failed", result.Errors.Select(e => e.Description).ToList());
                }

                return ApiResponse.SuccessResponse("Email confirmed successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Email confirmation failed: {ex.Message}");
            }
        }

        public async Task<ApiResponse> ResendEmailConfirmationAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return ApiResponse.SuccessResponse("If the email exists, a confirmation link has been sent");
                }

                if (user.EmailConfirmed)
                {
                    return ApiResponse.ErrorResponse("Email is already confirmed");
                }

                var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                await _emailService.SendEmailConfirmationAsync(user.Email, user.FirstName, emailToken);

                return ApiResponse.SuccessResponse("Confirmation email sent");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Failed to resend confirmation: {ex.Message}");
            }
        }

        public async Task<string> GenerateJwtTokenAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new ArgumentException("User not found");

            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(AppConstants.JwtClaims.UserId, user.Id),
                new(AppConstants.JwtClaims.Email, user.Email!),
                new(AppConstants.JwtClaims.FirstName, user.FirstName),
                new(AppConstants.JwtClaims.LastName, user.LastName)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key not found");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(_configuration.GetValue<int>("JwtSettings:ExpirationHours")),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key not found");
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return validatedToken != null;
            }
            catch
            {
                return false;
            }
        }
    }
}