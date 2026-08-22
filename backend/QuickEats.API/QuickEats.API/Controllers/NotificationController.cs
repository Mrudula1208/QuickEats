using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuickEats.API.DTos.Notification;
using QuickEats.API.Services.Interfaces;
using System.Security.Claims;

namespace QuickEats.API.Controllers
{
    /// <summary>
    /// Notifications of the logged in user (order updates, status changes, etc.).
    /// </summary>
    [Tags("Notifications")]
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

        /// <summary>
        /// Gets all notifications of the logged in user.
        /// </summary>

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var notifications = await _notificationService.GetByUserIdAsync(userId);

            return Ok(notifications);
        }

        /// <summary>
        /// Gets the unread notification count of the logged in user.
        /// </summary>

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var count = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(count);
        }

        /// <summary>
        /// Marks one notification as read.
        /// </summary>
        /// <param name="id">Notification id.</param>

        [HttpPut("{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.MarkAsReadAsync(userId, id);

            return Ok("Notification marked as read.");
        }

        /// <summary>
        /// Marks all notifications of the logged in user as read.
        /// </summary>

        [HttpPut("mark-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.MarkAllAsReadAsync(userId);

            return Ok("All notifications marked as read.");
        }

        /// <summary>
        /// Deletes one notification of the logged in user.
        /// </summary>
        /// <param name="id">Notification id.</param>

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(
                User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await _notificationService.DeleteAsync(userId, id);

            return Ok("Notification deleted successfully.");
        }

        /// <summary>
        /// Clears all notifications of the logged in user.
        /// </summary>

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
