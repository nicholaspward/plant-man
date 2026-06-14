using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Endpoints;
using plant_manager.Services;

var builder = WebApplication.CreateBuilder(args);

const string frontendPolicy = "Frontend";

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
var plantInfoConnectionString = builder.Configuration.GetConnectionString("PlantInfoConnection")
    ?? throw new InvalidOperationException("Connection string 'PlantInfoConnection' not found.");

Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "App_Data"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddDbContext<PlantInfoDbContext>(options =>
    options.UseSqlite(plantInfoConnectionString));
builder.Services.AddScoped<PlantInfoSearchService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors(frontendPolicy);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
    await db.SeedDevelopmentDataAsync();

    var plantInfoDb = scope.ServiceProvider.GetRequiredService<PlantInfoDbContext>();
    await plantInfoDb.EnsureSearchSchemaAsync();
}

app.MapRootEndpoints();
app.MapPlantEndpoints();
app.MapPlantTaxonEndpoints();
app.MapPlantLocationEndpoints();
app.MapPlantGroupEndpoints();
app.MapCareActionEndpoints();
app.MapActionResourceEndpoints();
app.MapCareActivityEndpoints();
app.MapRecipeEndpoints();
app.MapPlantCareScheduleEndpoints();
app.MapCareTaskEndpoints();
app.MapActionLogEndpoints();
app.MapPlantFlagEndpoints();
app.MapExportEndpoints();
app.MapImportEndpoints();
app.MapPlantInfoEndpoints();

app.Run();
