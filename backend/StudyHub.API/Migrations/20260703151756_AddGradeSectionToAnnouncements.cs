using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyHub.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGradeSectionToAnnouncements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Announcements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Announcements",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Announcements");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "Announcements");
        }
    }
}
