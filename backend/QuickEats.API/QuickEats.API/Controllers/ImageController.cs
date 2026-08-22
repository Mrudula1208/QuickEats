using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Image uploads for restaurants, menu items and profile pictures.
    /// </summary>
    [Tags("Images")]
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

        /// <summary>
        /// Uploads an image and returns its public URL.
        /// </summary>
        /// <remarks>
        /// Allowed categories: "restaurants", "menu", "profile".
        /// Max file size is 5 MB; allowed types are JPG, PNG, WebP and GIF.
        /// </remarks>
        /// <param name="category">Upload category (restaurants, menu or profile).</param>
        /// <param name="file">The image file to upload.</param>
        /// <returns>An object with the relative image URL in the "imageUrl" field.</returns>
        /// <response code="200">Returns the uploaded image URL.</response>
        /// <response code="400">Invalid category, missing file, wrong type or file too large.</response>
        [Authorize(Roles = "Admin,Owner")]
        [HttpPost("upload/{category}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
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
