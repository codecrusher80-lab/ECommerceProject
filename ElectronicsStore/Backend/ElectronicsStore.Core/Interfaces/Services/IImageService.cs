using ElectronicsStore.Core.DTOs.Common;
using Microsoft.AspNetCore.Http;

namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IImageService
    {
        Task<ApiResponse<string>> UploadImageAsync(IFormFile file, string folder = "products");
        Task<ApiResponse<List<string>>> UploadImagesAsync(List<IFormFile> files, string folder = "products");
        Task<ApiResponse> DeleteImageAsync(string imageUrl);
        Task<ApiResponse<string>> ResizeImageAsync(string imageUrl, int width, int height);
        Task<ApiResponse<string>> OptimizeImageAsync(string imageUrl);
        bool IsValidImageFile(IFormFile file);
        string GetImagePath(string fileName, string folder);
    }
}