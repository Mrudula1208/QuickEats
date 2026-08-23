using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuickEats.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRestaurantOwner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Some databases were created before the owner concept existed and
            // may or may not contain the legacy 'UserId' column, so every step
            // below checks whether the object exists before touching it.
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Restaurants_Users_UserId' AND parent_object_id = OBJECT_ID(N'[dbo].[Restaurants]'))
    ALTER TABLE [Restaurants] DROP CONSTRAINT [FK_Restaurants_Users_UserId];");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Restaurants_UserId' AND object_id = OBJECT_ID(N'[dbo].[Restaurants]'))
    DROP INDEX [IX_Restaurants_UserId] ON [Restaurants];");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Restaurants]') AND name = 'UserId')
    ALTER TABLE [Restaurants] DROP COLUMN [UserId];");

            // Fresh databases do not have an owner column at all yet,
            // while upgraded ones already received it from earlier fixes.
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Restaurants]') AND name = 'OwnerId')
BEGIN
    ALTER TABLE [Restaurants] ADD [OwnerId] int NOT NULL DEFAULT 0;
    CREATE INDEX [IX_Restaurants_OwnerId] ON [Restaurants] ([OwnerId]);
    ALTER TABLE [Restaurants] ADD CONSTRAINT [FK_Restaurants_Users_OwnerId]
        FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Restaurants_Users_OwnerId' AND parent_object_id = OBJECT_ID(N'[dbo].[Restaurants]'))
    ALTER TABLE [Restaurants] DROP CONSTRAINT [FK_Restaurants_Users_OwnerId];");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Restaurants_OwnerId' AND object_id = OBJECT_ID(N'[dbo].[Restaurants]'))
    DROP INDEX [IX_Restaurants_OwnerId] ON [Restaurants];");

            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Restaurants]') AND name = 'UserId')
BEGIN
    ALTER TABLE [Restaurants] ADD [UserId] int NULL;
    CREATE INDEX [IX_Restaurants_UserId] ON [Restaurants] ([UserId]);
    ALTER TABLE [Restaurants] ADD CONSTRAINT [FK_Restaurants_Users_UserId]
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION;
END");
        }
    }
}
