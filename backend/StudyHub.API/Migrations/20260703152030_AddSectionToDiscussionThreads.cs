using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyHub.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSectionToDiscussionThreads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Section",
                table: "DiscussionThreads",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Section",
                table: "DiscussionThreads");
        }
    }
}
