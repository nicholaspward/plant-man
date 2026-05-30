using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace plant_manager.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipesPlantTimelineAndGroups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "Birthday",
                table: "Plants",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PlantGroups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Type = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    MeasurementMode = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    OutputResourceId = table.Column<int>(type: "INTEGER", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recipes_ActionResources_OutputResourceId",
                        column: x => x.OutputResourceId,
                        principalTable: "ActionResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "PlantGroupMemberships",
                columns: table => new
                {
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    PlantGroupId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantGroupMemberships", x => new { x.PlantId, x.PlantGroupId });
                    table.ForeignKey(
                        name: "FK_PlantGroupMemberships_PlantGroups_PlantGroupId",
                        column: x => x.PlantGroupId,
                        principalTable: "PlantGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlantGroupMemberships_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecipeComponents",
                columns: table => new
                {
                    RecipeId = table.Column<int>(type: "INTEGER", nullable: false),
                    ActionResourceId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeComponents", x => new { x.RecipeId, x.ActionResourceId });
                    table.ForeignKey(
                        name: "FK_RecipeComponents_ActionResources_ActionResourceId",
                        column: x => x.ActionResourceId,
                        principalTable: "ActionResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecipeComponents_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlantGroupMemberships_PlantGroupId",
                table: "PlantGroupMemberships",
                column: "PlantGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PlantGroups_Name",
                table: "PlantGroups",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecipeComponents_ActionResourceId",
                table: "RecipeComponents",
                column: "ActionResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeComponents_RecipeId_SortOrder",
                table: "RecipeComponents",
                columns: new[] { "RecipeId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_Name",
                table: "Recipes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_OutputResourceId",
                table: "Recipes",
                column: "OutputResourceId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlantGroupMemberships");

            migrationBuilder.DropTable(
                name: "RecipeComponents");

            migrationBuilder.DropTable(
                name: "PlantGroups");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropColumn(
                name: "Birthday",
                table: "Plants");
        }
    }
}
