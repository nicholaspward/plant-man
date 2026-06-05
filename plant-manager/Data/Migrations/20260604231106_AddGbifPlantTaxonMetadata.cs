using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace plant_manager.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGbifPlantTaxonMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CommonName",
                table: "PlantTaxa",
                type: "TEXT",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "PlantTaxa",
                type: "TEXT",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalSource",
                table: "PlantTaxa",
                type: "TEXT",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Family",
                table: "PlantTaxa",
                type: "TEXT",
                maxLength: 120,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlantTaxa_ExternalSource_ExternalId",
                table: "PlantTaxa",
                columns: new[] { "ExternalSource", "ExternalId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PlantTaxa_ExternalSource_ExternalId",
                table: "PlantTaxa");

            migrationBuilder.DropColumn(
                name: "CommonName",
                table: "PlantTaxa");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "PlantTaxa");

            migrationBuilder.DropColumn(
                name: "ExternalSource",
                table: "PlantTaxa");

            migrationBuilder.DropColumn(
                name: "Family",
                table: "PlantTaxa");
        }
    }
}
