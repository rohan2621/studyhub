using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyHub.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemCompletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "TimetableSlots",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "PastPapers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Notes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "Homeworks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "Homeworks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Grade",
                table: "DiscussionThreads",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PushToken",
                table: "Devices",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Section",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "TimetableSlots");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "PastPapers");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Notes");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Homeworks");

            migrationBuilder.DropColumn(
                name: "Section",
                table: "Homeworks");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "DiscussionThreads");

            migrationBuilder.DropColumn(
                name: "PushToken",
                table: "Devices");
        }
    }
}
