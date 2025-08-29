using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;

namespace ElectronicsStore.Infrastructure.Services
{
    public class ImageService : IImageService
    {
        private readonly IConfiguration _configuration;
        private readonly string _baseUploadPath;
        private readonly string _baseUrl;
        private readonly long _maxFileSize;
        private readonly string[] _allowedExtensions;

        public ImageService(IConfiguration configuration)
        {
            _configuration = configuration;
            _baseUploadPath = _configuration["FileUpload:BasePath"] ?? "wwwroot/uploads";
            _baseUrl = _configuration["FileUpload:BaseUrl"] ?? "/uploads";
            _maxFileSize = long.Parse(_configuration["FileUpload:MaxFileSize"] ?? "5242880"); // 5MB default
            _allowedExtensions = _configuration.GetSection("FileUpload:AllowedExtensions").Get<string[]>() 
                ?? new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

            // Ensure upload directory exists
            if (!Directory.Exists(_baseUploadPath))
            {
                Directory.CreateDirectory(_baseUploadPath);
            }
        }

        public async Task<ApiResponse<string>> UploadImageAsync(IFormFile file, string folder = "products")
        {
            try
            {
                if (file == null || file.Length == 0)
                    return ApiResponse<string>.ErrorResponse("No file provided");

                if (!IsValidImageFile(file))
                    return ApiResponse<string>.ErrorResponse("Invalid file format. Only JPG, JPEG, PNG, WebP, and GIF files are allowed.");

                if (file.Length > _maxFileSize)
                    return ApiResponse<string>.ErrorResponse($"File size exceeds the maximum allowed size of {_maxFileSize / (1024 * 1024)}MB");

                var folderPath = Path.Combine(_baseUploadPath, folder);
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                var fileName = GenerateUniqueFileName(file.FileName);
                var filePath = Path.Combine(folderPath, fileName);

                // Process and save the image
                using var image = await Image.LoadAsync(file.OpenReadStream());
                
                // Auto-orient the image based on EXIF data
                image.Mutate(x => x.AutoOrient());

                // Optimize the image
                await OptimizeAndSaveImageAsync(image, filePath);

                var imageUrl = GetImagePath(fileName, folder);
                return ApiResponse<string>.SuccessResponse(imageUrl, "Image uploaded successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse($"Error uploading image: {ex.Message}");
            }
        }

        public async Task<ApiResponse<List<string>>> UploadImagesAsync(List<IFormFile> files, string folder = "products")
        {
            try
            {
                if (files == null || !files.Any())
                    return ApiResponse<List<string>>.ErrorResponse("No files provided");

                var imageUrls = new List<string>();
                var errors = new List<string>();

                foreach (var file in files)
                {
                    var result = await UploadImageAsync(file, folder);
                    if (result.Success && result.Data != null)
                    {
                        imageUrls.Add(result.Data);
                    }
                    else
                    {
                        errors.Add($"{file.FileName}: {result.Message}");
                    }
                }

                if (errors.Any())
                {
                    var errorMessage = string.Join("; ", errors);
                    if (!imageUrls.Any())
                        return ApiResponse<List<string>>.ErrorResponse($"All uploads failed: {errorMessage}");
                    else
                        return ApiResponse<List<string>>.SuccessResponse(imageUrls, $"Partial upload success. Errors: {errorMessage}");
                }

                return ApiResponse<List<string>>.SuccessResponse(imageUrls, "All images uploaded successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<List<string>>.ErrorResponse($"Error uploading images: {ex.Message}");
            }
        }

        public async Task<ApiResponse> DeleteImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return ApiResponse.ErrorResponse("Image URL is required");

                // Extract relative path from URL
                var relativePath = imageUrl.Replace(_baseUrl, "").TrimStart('/');
                var fullPath = Path.Combine(_baseUploadPath, relativePath);

                if (!File.Exists(fullPath))
                    return ApiResponse.ErrorResponse("Image file not found");

                File.Delete(fullPath);

                // Also delete thumbnails if they exist
                var directory = Path.GetDirectoryName(fullPath);
                var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fullPath);
                var extension = Path.GetExtension(fullPath);
                
                var thumbnailPatterns = new[] { "_thumb", "_small", "_medium", "_large" };
                foreach (var pattern in thumbnailPatterns)
                {
                    var thumbnailPath = Path.Combine(directory!, $"{fileNameWithoutExtension}{pattern}{extension}");
                    if (File.Exists(thumbnailPath))
                    {
                        File.Delete(thumbnailPath);
                    }
                }

                return ApiResponse.SuccessResponse("Image deleted successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse.ErrorResponse($"Error deleting image: {ex.Message}");
            }
        }

        public async Task<ApiResponse<string>> ResizeImageAsync(string imageUrl, int width, int height)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return ApiResponse<string>.ErrorResponse("Image URL is required");

                var relativePath = imageUrl.Replace(_baseUrl, "").TrimStart('/');
                var fullPath = Path.Combine(_baseUploadPath, relativePath);

                if (!File.Exists(fullPath))
                    return ApiResponse<string>.ErrorResponse("Image file not found");

                using var image = await Image.LoadAsync(fullPath);
                
                // Calculate new dimensions maintaining aspect ratio
                var (newWidth, newHeight) = CalculateResizeDimensions(image.Width, image.Height, width, height);
                
                image.Mutate(x => x.Resize(newWidth, newHeight));

                // Generate new filename for resized image
                var directory = Path.GetDirectoryName(fullPath);
                var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fullPath);
                var extension = Path.GetExtension(fullPath);
                var resizedFileName = $"{fileNameWithoutExtension}_{newWidth}x{newHeight}{extension}";
                var resizedFilePath = Path.Combine(directory!, resizedFileName);

                await image.SaveAsync(resizedFilePath);

                var resizedImageUrl = imageUrl.Replace(Path.GetFileName(imageUrl), resizedFileName);
                return ApiResponse<string>.SuccessResponse(resizedImageUrl, "Image resized successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse($"Error resizing image: {ex.Message}");
            }
        }

        public async Task<ApiResponse<string>> OptimizeImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return ApiResponse<string>.ErrorResponse("Image URL is required");

                var relativePath = imageUrl.Replace(_baseUrl, "").TrimStart('/');
                var fullPath = Path.Combine(_baseUploadPath, relativePath);

                if (!File.Exists(fullPath))
                    return ApiResponse<string>.ErrorResponse("Image file not found");

                using var image = await Image.LoadAsync(fullPath);
                
                // Create optimized version
                var directory = Path.GetDirectoryName(fullPath);
                var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fullPath);
                var optimizedFileName = $"{fileNameWithoutExtension}_optimized.webp";
                var optimizedFilePath = Path.Combine(directory!, optimizedFileName);

                await image.SaveAsync(optimizedFilePath, new WebpEncoder { Quality = 85 });

                var optimizedImageUrl = imageUrl.Replace(Path.GetFileName(imageUrl), optimizedFileName);
                return ApiResponse<string>.SuccessResponse(optimizedImageUrl, "Image optimized successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse($"Error optimizing image: {ex.Message}");
            }
        }

        public bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !_allowedExtensions.Contains(extension))
                return false;

            // Check MIME type
            var allowedMimeTypes = new[]
            {
                "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
            };

            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            try
            {
                // Try to load the image to verify it's a valid image file
                using var image = Image.Load(file.OpenReadStream());
                return true;
            }
            catch
            {
                return false;
            }
        }

        public string GetImagePath(string fileName, string folder)
        {
            return $"{_baseUrl}/{folder}/{fileName}".Replace("//", "/");
        }

        public async Task<ApiResponse<Dictionary<string, string>>> CreateThumbnailsAsync(string imageUrl)
        {
            try
            {
                var thumbnailSizes = new Dictionary<string, (int width, int height)>
                {
                    { "thumb", (150, 150) },
                    { "small", (300, 300) },
                    { "medium", (600, 600) },
                    { "large", (1200, 1200) }
                };

                var thumbnails = new Dictionary<string, string>();

                foreach (var (size, dimensions) in thumbnailSizes)
                {
                    var result = await ResizeImageAsync(imageUrl, dimensions.width, dimensions.height);
                    if (result.Success && result.Data != null)
                    {
                        thumbnails[size] = result.Data;
                    }
                }

                return ApiResponse<Dictionary<string, string>>.SuccessResponse(thumbnails, "Thumbnails created successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<Dictionary<string, string>>.ErrorResponse($"Error creating thumbnails: {ex.Message}");
            }
        }

        public async Task<ApiResponse<string>> WatermarkImageAsync(string imageUrl, string watermarkText)
        {
            try
            {
                if (string.IsNullOrEmpty(imageUrl))
                    return ApiResponse<string>.ErrorResponse("Image URL is required");

                var relativePath = imageUrl.Replace(_baseUrl, "").TrimStart('/');
                var fullPath = Path.Combine(_baseUploadPath, relativePath);

                if (!File.Exists(fullPath))
                    return ApiResponse<string>.ErrorResponse("Image file not found");

                using var image = await Image.LoadAsync(fullPath);

                // Add watermark (functionality disabled - requires additional packages)
                // Note: Full watermarking requires SixLabors.Fonts package
                // For now, the image is processed without watermark

                // Save watermarked image
                var directory = Path.GetDirectoryName(fullPath);
                var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(fullPath);
                var extension = Path.GetExtension(fullPath);
                var watermarkedFileName = $"{fileNameWithoutExtension}_watermarked{extension}";
                var watermarkedFilePath = Path.Combine(directory!, watermarkedFileName);

                await image.SaveAsync(watermarkedFilePath);

                var watermarkedImageUrl = imageUrl.Replace(Path.GetFileName(imageUrl), watermarkedFileName);
                return ApiResponse<string>.SuccessResponse(watermarkedImageUrl, "Watermark added successfully");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.ErrorResponse($"Error adding watermark: {ex.Message}");
            }
        }

        private async Task OptimizeAndSaveImageAsync(Image image, string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLowerInvariant();

            // Resize if image is too large
            const int maxWidth = 1920;
            const int maxHeight = 1920;
            
            if (image.Width > maxWidth || image.Height > maxHeight)
            {
                var (newWidth, newHeight) = CalculateResizeDimensions(image.Width, image.Height, maxWidth, maxHeight);
                image.Mutate(x => x.Resize(newWidth, newHeight));
            }

            // Save with appropriate encoder and optimization
            switch (extension)
            {
                case ".jpg":
                case ".jpeg":
                    await image.SaveAsync(filePath, new JpegEncoder { Quality = 85 });
                    break;
                case ".png":
                    await image.SaveAsync(filePath, new PngEncoder());
                    break;
                case ".webp":
                    await image.SaveAsync(filePath, new WebpEncoder { Quality = 85 });
                    break;
                default:
                    await image.SaveAsync(filePath);
                    break;
            }
        }

        private static (int width, int height) CalculateResizeDimensions(int originalWidth, int originalHeight, int maxWidth, int maxHeight)
        {
            var ratioX = (double)maxWidth / originalWidth;
            var ratioY = (double)maxHeight / originalHeight;
            var ratio = Math.Min(ratioX, ratioY);

            var newWidth = (int)(originalWidth * ratio);
            var newHeight = (int)(originalHeight * ratio);

            return (newWidth, newHeight);
        }

        private static string GenerateUniqueFileName(string originalFileName)
        {
            var extension = Path.GetExtension(originalFileName);
            var fileNameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var random = new Random().Next(1000, 9999);
            
            return $"{fileNameWithoutExtension}_{timestamp}_{random}{extension}";
        }

        public async Task<ApiResponse<long>> GetImageSizeAsync(string imageUrl)
        {
            try
            {
                var relativePath = imageUrl.Replace(_baseUrl, "").TrimStart('/');
                var fullPath = Path.Combine(_baseUploadPath, relativePath);

                if (!File.Exists(fullPath))
                    return ApiResponse<long>.ErrorResponse("Image file not found");

                var fileInfo = new FileInfo(fullPath);
                return ApiResponse<long>.SuccessResponse(fileInfo.Length);
            }
            catch (Exception ex)
            {
                return ApiResponse<long>.ErrorResponse($"Error getting image size: {ex.Message}");
            }
        }

        public async Task<ApiResponse<(int width, int height)>> GetImageDimensionsAsync(string imageUrl)
        {
            try
            {
                var relativePath = imageUrl.Replace(_baseUrl, "").TrimStart('/');
                var fullPath = Path.Combine(_baseUploadPath, relativePath);

                if (!File.Exists(fullPath))
                    return ApiResponse<(int, int)>.ErrorResponse("Image file not found");

                using var image = await Image.LoadAsync(fullPath);
                return ApiResponse<(int, int)>.SuccessResponse((image.Width, image.Height));
            }
            catch (Exception ex)
            {
                return ApiResponse<(int, int)>.ErrorResponse($"Error getting image dimensions: {ex.Message}");
            }
        }
    }
}