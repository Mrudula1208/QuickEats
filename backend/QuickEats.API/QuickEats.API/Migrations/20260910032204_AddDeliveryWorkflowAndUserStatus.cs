using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickEats.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryWorkflowAndUserStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeliveredAt",
                table: "OrderDeliveries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PickedUpAt",
                table: "OrderDeliveries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderDeliveries_DeliveryPartnerId",
                table: "OrderDeliveries",
                column: "DeliveryPartnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderDeliveries_Users_DeliveryPartnerId",
                table: "OrderDeliveries",
                column: "DeliveryPartnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderDeliveries_Users_DeliveryPartnerId",
                table: "OrderDeliveries");

            migrationBuilder.DropIndex(
                name: "IX_OrderDeliveries_DeliveryPartnerId",
                table: "OrderDeliveries");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DeliveredAt",
                table: "OrderDeliveries");

            migrationBuilder.DropColumn(
                name: "PickedUpAt",
                table: "OrderDeliveries");
        }
    }
}
