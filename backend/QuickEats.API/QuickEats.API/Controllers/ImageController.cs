using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace QuickEats.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public ImageController(IWebHostEnvironment env)
        {
            _env = env;
        }

        // Allowed image types
        private static readonly string[] AllowedTypes = {
            "image/jpeg", "image/png", "image/webp", "image/gif"
        };

        // Max file size: 5 MB
        private const long MaxFileSize = 5 * 1024 * 1024;

        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("upload/{category}")]
        public async Task<IActionResult> Upload(string category, IFormFile file)
        {
            // Validate category
            if (category != "restaurants" && category != "menu" && category != "profile")
            {
                return BadRequest("Invalid category. Use: restaurants, menu, or profile.");
            }

            // Validate file exists
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            // Validate file size
            if (file.Length > MaxFileSize)
            {
                return BadRequest("File size must be less than 5 MB.");
            }

            // Validate file type
            if (!AllowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest("Only JPG, PNG, WebP, and GIF files are allowed.");
            }

            // Build upload path: wwwroot/uploads/{category}/
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", category);

            // Create folder if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate unique filename to avoid overwrites
            var uniqueName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL path
            // Frontend can use this directly in img [src]
            var imageUrl = $"/uploads/{category}/{uniqueName}";

            return Ok(new { imageUrl });
        }
    }
}
