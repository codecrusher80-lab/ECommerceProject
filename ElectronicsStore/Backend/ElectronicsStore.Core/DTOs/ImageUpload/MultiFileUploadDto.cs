using Microsoft.AspNetCore.Http;

namespace ElectronicsStore.Core.DTOs.ImageUpload
{
    public class MultiFileUploadDto
    {
        public List<IFormFile> Files { get; set; }
    }
}
