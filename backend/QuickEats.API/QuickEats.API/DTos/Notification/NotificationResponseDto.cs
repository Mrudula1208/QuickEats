namespace QuickEats.API.DTos.Notification
{
    // DTO used when Backend sends
    // Notification information to Angular.

    public class NotificationResponseDto
    {
        // Unique Notification Id.

        public int NotificationId { get; set; }

        // Notification Title.

        public string Title { get; set; } = string.Empty;

        // Notification Message.

        public string Message { get; set; } = string.Empty;

        // Date and time when Notification was created.

        public DateTime NotificationDate { get; set; }

        // Read Status.
        // true = Read, false = Not Read.

        public bool IsRead { get; set; }
    }
}
