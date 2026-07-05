using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyHub.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRevenueAdjustments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RevenueAdjustments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    AdminId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RevenueAdjustments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RevenueAdjustments_Users_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RevenueAdjustments_AdminId",
                table: "RevenueAdjustments",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_RevenueAdjustments_CreatedAt",
                table: "RevenueAdjustments",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RevenueAdjustments");
        }
    }
}
