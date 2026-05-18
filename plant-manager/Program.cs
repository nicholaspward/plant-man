using Microsoft.EntityFrameworkCore;
using plant_manager.Data;
using plant_manager.Endpoints;

var builder = WebApplication.CreateBuilder(args);

const string frontendPolicy = "Frontend";

builder.Services.AddCors(options =>
{
    options.AddPolicy(frontendPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "App_Data"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

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
    DatabaseSeeder.Seed(db);
}

app.MapRootEndpoints();
app.MapPlantEndpoints();
app.MapPlantTaxonEndpoints();
app.MapCareActionEndpoints();
app.MapActionResourceEndpoints();
app.MapCareTaskEndpoints();
app.MapActionLogEndpoints();
app.MapPlantFlagEndpoints();

app.Run();
