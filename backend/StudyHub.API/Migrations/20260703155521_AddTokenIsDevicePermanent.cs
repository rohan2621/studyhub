using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyHub.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTokenIsDevicePermanent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDevicePermanent",
                table: "Tokens",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDevicePermanent",
                table: "Tokens");
        }
    }
}
