using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickEats.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantDeliveryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DeliveryCharge",
                table: "Restaurants",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumOrder",
                table: "Restaurants",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryCharge",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "MinimumOrder",
                table: "Restaurants");
        }
    }
}
