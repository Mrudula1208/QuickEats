using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Notification;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
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

        // GET: /api/Notification/unread-count
        //
        // Get unread Notification count.

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var count = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(count);
        }

        // PUT: /api/Notification/5
        //
        // Mark one Notification as Read.

        [HttpPut("{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.MarkAsReadAsync(userId, id);

            return Ok("Notification marked as read.");
        }

        // PUT: /api/Notification/mark-all
        //
        // Mark all Notifications as Read.

        [HttpPut("mark-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.MarkAllAsReadAsync(userId);

            return Ok("All notifications marked as read.");
        }

        // DELETE: /api/Notification/5
        //
        // Delete one Notification.

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.DeleteAsync(userId, id);

            return Ok("Notification deleted successfully.");
        }

        // DELETE: /api/Notification/clear
        //
        // Clear all Notifications.

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearAll()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.ClearAllAsync(userId);

            return Ok("All notifications cleared.");
        }
    }
}
