using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ElectronicsStore.Core.DTOs.Image
{
    public class SingleImageDto
    {
        public IFormFile File { get; set; }
    }

    public class MultipleImageDto
    {
        public List<IFormFile> Files { get; set; }
    }
}
