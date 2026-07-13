using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickEats.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOrderDeliveryModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeliveryPartnerName",
                table: "OrderDeliveries");

            migrationBuilder.RenameColumn(
                name: "Quality",
                table: "OrderItems",
                newName: "Quantity");

            migrationBuilder.AddColumn<int>(
                name: "MenuItemId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeliveryPartnerId",
                table: "OrderDeliveries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_MenuItemId",
                table: "Orders",
                column: "MenuItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_MenuItems_MenuItemId",
                table: "Orders",
                column: "MenuItemId",
                principalTable: "MenuItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_MenuItems_MenuItemId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_MenuItemId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "MenuItemId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DeliveryPartnerId",
                table: "OrderDeliveries");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "OrderItems",
                newName: "Quality");

            migrationBuilder.AddColumn<string>(
                name: "DeliveryPartnerName",
                table: "OrderDeliveries",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
