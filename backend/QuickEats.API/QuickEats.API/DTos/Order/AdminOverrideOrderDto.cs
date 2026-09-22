using System.ComponentModel.DataAnnotations;

namespace QuickEats.API.DTos.Order
{
    /// <summary>
    /// Request body for the Admin emergency override action.
    /// The override is validated against the legal order lifecycle plus a small set
    /// of rescue transitions, requires a reason and is persisted to the audit log.
    /// </summary>
    public class AdminOverrideOrderDto
    {
        [Required(ErrorMessage = "Target status is required")]
        public string Status { get; set; } = string.Empty;

        [Required(ErrorMessage = "A reason is required for an admin override")]
        [MinLength(5, ErrorMessage = "Reason must be at least 5 characters")]
        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string Reason { get; set; } = string.Empty;
    }
}