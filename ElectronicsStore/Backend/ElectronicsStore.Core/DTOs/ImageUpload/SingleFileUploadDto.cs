using Microsoft.AspNetCore.Http;

namespace ElectronicsStore.Core.DTOs.ImageUpload
{
    public class SingleFileUploadDto
    {
        public IFormFile File { get; set; }
    }
}
