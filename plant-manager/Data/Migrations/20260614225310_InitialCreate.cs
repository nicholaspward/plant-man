using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace plant_manager.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ActionResources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionResources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CareActions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 400, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareActions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CareActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareActivities", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlantFlagDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Color = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantFlagDefinitions", x => x.Id);
                });

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
                name: "PlantLocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantLocations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlantTaxa",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Genus = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Species = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Cultivar = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    Variety = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    Authority = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    Family = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    CommonName = table.Column<string>(type: "TEXT", maxLength: 120, nullable: true),
                    ExternalSource = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                    ExternalId = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantTaxa", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recipes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
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
                name: "CareActivityActions",
                columns: table => new
                {
                    CareActivityId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActionId = table.Column<int>(type: "INTEGER", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareActivityActions", x => new { x.CareActivityId, x.CareActionId });
                    table.ForeignKey(
                        name: "FK_CareActivityActions_CareActions_CareActionId",
                        column: x => x.CareActionId,
                        principalTable: "CareActions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CareActivityActions_CareActivities_CareActivityId",
                        column: x => x.CareActivityId,
                        principalTable: "CareActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlantCareSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CareActionId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActivityId = table.Column<int>(type: "INTEGER", nullable: false),
                    EveryDays = table.Column<int>(type: "INTEGER", nullable: false),
                    ScheduledFor = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    RecurrenceMode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    RepeatEvery = table.Column<int>(type: "INTEGER", nullable: false),
                    RepeatUnit = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    RepeatOnDays = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    EndsMode = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    EndsOn = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    EndsAfterOccurrences = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantCareSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlantCareSchedules_CareActions_CareActionId",
                        column: x => x.CareActionId,
                        principalTable: "CareActions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlantCareSchedules_CareActivities_CareActivityId",
                        column: x => x.CareActivityId,
                        principalTable: "CareActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Plants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    TaxonId = table.Column<int>(type: "INTEGER", nullable: true),
                    LocationId = table.Column<int>(type: "INTEGER", nullable: true),
                    Nickname = table.Column<string>(type: "TEXT", maxLength: 120, nullable: false),
                    Birthday = table.Column<DateOnly>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Plants_PlantLocations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "PlantLocations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Plants_PlantTaxa_TaxonId",
                        column: x => x.TaxonId,
                        principalTable: "PlantTaxa",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
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

            migrationBuilder.CreateTable(
                name: "CareActivityActionResources",
                columns: table => new
                {
                    CareActivityId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActionId = table.Column<int>(type: "INTEGER", nullable: false),
                    ActionResourceId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareActivityActionResources", x => new { x.CareActivityId, x.CareActionId, x.ActionResourceId });
                    table.ForeignKey(
                        name: "FK_CareActivityActionResources_ActionResources_ActionResourceId",
                        column: x => x.ActionResourceId,
                        principalTable: "ActionResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CareActivityActionResources_CareActivityActions_CareActivityId_CareActionId",
                        columns: x => new { x.CareActivityId, x.CareActionId },
                        principalTable: "CareActivityActions",
                        principalColumns: new[] { "CareActivityId", "CareActionId" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ActionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActionId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActivityId = table.Column<int>(type: "INTEGER", nullable: false),
                    ActionNameSnapshot = table.Column<string>(type: "TEXT", maxLength: 80, nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true),
                    PerformedOn = table.Column<DateOnly>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ActionLogs_CareActions_CareActionId",
                        column: x => x.CareActionId,
                        principalTable: "CareActions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ActionLogs_CareActivities_CareActivityId",
                        column: x => x.CareActivityId,
                        principalTable: "CareActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ActionLogs_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CareDismissals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActivityId = table.Column<int>(type: "INTEGER", nullable: false),
                    DismissedOn = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareDismissals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareDismissals_CareActivities_CareActivityId",
                        column: x => x.CareActivityId,
                        principalTable: "CareActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CareDismissals_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CareSnoozes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    CareActivityId = table.Column<int>(type: "INTEGER", nullable: false),
                    SnoozedUntil = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    CreatedOn = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareSnoozes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareSnoozes_CareActivities_CareActivityId",
                        column: x => x.CareActivityId,
                        principalTable: "CareActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CareSnoozes_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlantCareScheduleAssignments",
                columns: table => new
                {
                    PlantCareScheduleId = table.Column<int>(type: "INTEGER", nullable: false),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantCareScheduleAssignments", x => new { x.PlantCareScheduleId, x.PlantId });
                    table.ForeignKey(
                        name: "FK_PlantCareScheduleAssignments_PlantCareSchedules_PlantCareScheduleId",
                        column: x => x.PlantCareScheduleId,
                        principalTable: "PlantCareSchedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlantCareScheduleAssignments_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlantFlags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    PlantFlagDefinitionId = table.Column<int>(type: "INTEGER", nullable: false),
                    StartedOn = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    ResolvedOn = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlantFlags", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlantFlags_PlantFlagDefinitions_PlantFlagDefinitionId",
                        column: x => x.PlantFlagDefinitionId,
                        principalTable: "PlantFlagDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlantFlags_Plants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "Plants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "ActionLogResources",
                columns: table => new
                {
                    ActionLogId = table.Column<int>(type: "INTEGER", nullable: false),
                    ActionResourceId = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<decimal>(type: "TEXT", precision: 10, scale: 2, nullable: true),
                    Unit = table.Column<string>(type: "TEXT", maxLength: 40, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionLogResources", x => new { x.ActionLogId, x.ActionResourceId });
                    table.ForeignKey(
                        name: "FK_ActionLogResources_ActionLogs_ActionLogId",
                        column: x => x.ActionLogId,
                        principalTable: "ActionLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActionLogResources_ActionResources_ActionResourceId",
                        column: x => x.ActionResourceId,
                        principalTable: "ActionResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ActionLogResources_ActionResourceId",
                table: "ActionLogResources",
                column: "ActionResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionLogs_CareActionId",
                table: "ActionLogs",
                column: "CareActionId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionLogs_CareActivityId",
                table: "ActionLogs",
                column: "CareActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionLogs_PlantId",
                table: "ActionLogs",
                column: "PlantId");

            migrationBuilder.CreateIndex(
                name: "IX_ActionResources_Name",
                table: "ActionResources",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CareActions_Name",
                table: "CareActions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CareActivities_Name",
                table: "CareActivities",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CareActivityActionResources_ActionResourceId",
                table: "CareActivityActionResources",
                column: "ActionResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_CareActivityActions_CareActionId",
                table: "CareActivityActions",
                column: "CareActionId");

            migrationBuilder.CreateIndex(
                name: "IX_CareActivityActions_CareActivityId_SortOrder",
                table: "CareActivityActions",
                columns: new[] { "CareActivityId", "SortOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CareDismissals_CareActivityId",
                table: "CareDismissals",
                column: "CareActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_CareDismissals_PlantId_CareActivityId_DismissedOn",
                table: "CareDismissals",
                columns: new[] { "PlantId", "CareActivityId", "DismissedOn" });

            migrationBuilder.CreateIndex(
                name: "IX_CareSnoozes_CareActivityId",
                table: "CareSnoozes",
                column: "CareActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_CareSnoozes_PlantId_CareActivityId_SnoozedUntil",
                table: "CareSnoozes",
                columns: new[] { "PlantId", "CareActivityId", "SnoozedUntil" });

            migrationBuilder.CreateIndex(
                name: "IX_PlantCareScheduleAssignments_PlantId_PlantCareScheduleId",
                table: "PlantCareScheduleAssignments",
                columns: new[] { "PlantId", "PlantCareScheduleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlantCareSchedules_CareActionId",
                table: "PlantCareSchedules",
                column: "CareActionId");

            migrationBuilder.CreateIndex(
                name: "IX_PlantCareSchedules_CareActivityId",
                table: "PlantCareSchedules",
                column: "CareActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_PlantFlagDefinitions_Name",
                table: "PlantFlagDefinitions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlantFlags_PlantFlagDefinitionId",
                table: "PlantFlags",
                column: "PlantFlagDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_PlantFlags_PlantId_PlantFlagDefinitionId_ResolvedOn",
                table: "PlantFlags",
                columns: new[] { "PlantId", "PlantFlagDefinitionId", "ResolvedOn" });

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
                name: "IX_PlantLocations_Name",
                table: "PlantLocations",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Plants_LocationId",
                table: "Plants",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Plants_TaxonId",
                table: "Plants",
                column: "TaxonId");

            migrationBuilder.CreateIndex(
                name: "IX_PlantTaxa_ExternalSource_ExternalId",
                table: "PlantTaxa",
                columns: new[] { "ExternalSource", "ExternalId" },
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
                name: "ActionLogResources");

            migrationBuilder.DropTable(
                name: "CareActivityActionResources");

            migrationBuilder.DropTable(
                name: "CareDismissals");

            migrationBuilder.DropTable(
                name: "CareSnoozes");

            migrationBuilder.DropTable(
                name: "PlantCareScheduleAssignments");

            migrationBuilder.DropTable(
                name: "PlantFlags");

            migrationBuilder.DropTable(
                name: "PlantGroupMemberships");

            migrationBuilder.DropTable(
                name: "RecipeComponents");

            migrationBuilder.DropTable(
                name: "ActionLogs");

            migrationBuilder.DropTable(
                name: "CareActivityActions");

            migrationBuilder.DropTable(
                name: "PlantCareSchedules");

            migrationBuilder.DropTable(
                name: "PlantFlagDefinitions");

            migrationBuilder.DropTable(
                name: "PlantGroups");

            migrationBuilder.DropTable(
                name: "Recipes");

            migrationBuilder.DropTable(
                name: "Plants");

            migrationBuilder.DropTable(
                name: "CareActions");

            migrationBuilder.DropTable(
                name: "CareActivities");

            migrationBuilder.DropTable(
                name: "ActionResources");

            migrationBuilder.DropTable(
                name: "PlantLocations");

            migrationBuilder.DropTable(
                name: "PlantTaxa");
        }
    }
}
