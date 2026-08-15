using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    // API Controller for Notifications.

    [Authorize]
    // User must be logged in
    // to access these APIs.

    [Route("api/[controller]")]
    // Creates the URL:
    // /api/Notification

    [ApiController]
    public class NotificationController : ControllerBase
    {
        // Store Notification Service.

        private readonly INotificationService _notificationService;

        public NotificationController(
            INotificationService notificationService
        )
        {
            _notificationService = notificationService;
        }

        // GET: /api/Notification
        //
        // Get all Notifications
        // of the logged in User.

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var notifications = await _notificationService.GetByUserIdAsync(userId);

            return Ok(notifications);
        }

        // PUT: /api/Notification/5
        //
        // Mark one Notification as Read.

        [HttpPut("{id}")]
        public async Task<IActionResult> MarkAsRead(
            int id
        )
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.MarkAsReadAsync(userId, id);

            return Ok("Notification marked as read.");
        }
    }
}
