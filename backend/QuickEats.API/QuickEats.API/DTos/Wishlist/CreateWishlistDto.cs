namespace QuickEats.API.DTos.Wishlist
{
    // DTO used when Customer adds
    // a food item into the Wishlist.

    public class CreateWishlistDto
    {
        // Menu Item Id that is being saved.

        public int MenuId { get; set; }
    }
}
