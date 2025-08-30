using ElectronicsStore.Core.DTOs.Common;
using ElectronicsStore.Core.DTOs.ImageUpload;
using ElectronicsStore.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElectronicsStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly IImageService _imageService;

        public ImagesController(IImageService imageService)
        {
            _imageService = imageService;
        }

        /// <summary>
        /// Upload single image
        /// </summary>
        [HttpPost("upload")]
        [Authorize(Roles = "Admin,Manager")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse<string>>> UploadImage([FromForm] SingleFileUploadDto dto, [FromQuery] string folder = "products")
        {
            if (dto.File == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("No file provided"));

            var result = await _imageService.UploadImageAsync(dto.File, folder);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Upload multiple images
        /// </summary>
        [HttpPost("upload-multiple")]
        [Authorize(Roles = "Admin,Manager")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ApiResponse<List<string>>>> UploadMultipleImages([FromForm] MultiFileUploadDto dto, [FromQuery] string folder = "products")
        {
            if (dto.Files == null || !dto.Files.Any())
                return BadRequest(ApiResponse<List<string>>.ErrorResponse("No files provided"));

            var result = await _imageService.UploadImagesAsync(dto.Files, folder);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Delete image
        /// </summary>
        [HttpDelete]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse>> DeleteImage([FromQuery] string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse.ErrorResponse("Image URL is required"));

            var result = await _imageService.DeleteImageAsync(imageUrl);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Resize image
        /// </summary>
        [HttpPost("resize")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<string>>> ResizeImage(
            [FromQuery] string imageUrl,
            [FromQuery] int width,
            [FromQuery] int height)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse<string>.ErrorResponse("Image URL is required"));

            if (width <= 0 || height <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Width and height must be positive"));

            if (width > 5000 || height > 5000)
                return BadRequest(ApiResponse<string>.ErrorResponse("Width and height cannot exceed 5000 pixels"));

            var result = await _imageService.ResizeImageAsync(imageUrl, width, height);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Optimize image
        /// </summary>
        [HttpPost("optimize")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<string>>> OptimizeImage([FromQuery] string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse<string>.ErrorResponse("Image URL is required"));

            var result = await _imageService.OptimizeImageAsync(imageUrl);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Create thumbnails
        /// </summary>
        [HttpPost("thumbnails")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<Dictionary<string, string>>>> CreateThumbnails([FromQuery] string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse<Dictionary<string, string>>.ErrorResponse("Image URL is required"));

            var sizes = new List<(int width, int height)> { (150, 150), (300, 300), (500, 500) };
            var result = await _imageService.CreateThumbnailsAsync(imageUrl, sizes);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Add watermark to image
        /// </summary>
        [HttpPost("watermark")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse<string>>> WatermarkImage(
            [FromQuery] string imageUrl,
            [FromQuery] string watermarkText = "Electronics Store")
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse<string>.ErrorResponse("Image URL is required"));

            var result = await _imageService.WatermarkImageAsync(imageUrl, watermarkText);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get image size
        /// </summary>
        [HttpGet("size")]
        public async Task<ActionResult<ApiResponse<long>>> GetImageSize([FromQuery] string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse<long>.ErrorResponse("Image URL is required"));

            var result = await _imageService.GetImageSizeAsync(imageUrl);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Get image dimensions
        /// </summary>
        [HttpGet("dimensions")]
        public async Task<ActionResult<ApiResponse<(int width, int height)>>> GetImageDimensions([FromQuery] string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest(ApiResponse<(int, int)>.ErrorResponse("Image URL is required"));

            var result = await _imageService.GetImageDimensionsAsync(imageUrl);
            
            if (result.Success)
                return Ok(result);
            
            return BadRequest(result);
        }

        /// <summary>
        /// Validate image file
        /// </summary>
        [HttpPost("validate")]
        public ActionResult<ApiResponse<bool>> ValidateImageFile([FromForm] SingleFileUploadDto dto)
        {
            if (dto.File == null)
                return BadRequest(ApiResponse<bool>.ErrorResponse("No file provided"));

            var isValid = _imageService.IsValidImageFile(dto.File);
            
            if (isValid)
                return Ok(ApiResponse<bool>.SuccessResponse(true, "Valid image file"));
            else
                return Ok(ApiResponse<bool>.SuccessResponse(false, "Invalid image file format or corrupted file"));
        }
    }
}