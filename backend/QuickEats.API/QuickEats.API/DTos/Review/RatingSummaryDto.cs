namespace QuickEats.API.DTos.Review
{
    /// <summary>
    /// Average rating and total review count for one restaurant, fetched
    /// together in a single grouped query to avoid redundant round-trips.
    /// </summary>
    public class RatingSummaryDto
    {
        public double Average { get; set; }

        public int Count { get; set; }
    }
}