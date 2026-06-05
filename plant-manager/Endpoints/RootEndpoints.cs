namespace plant_manager.Endpoints
{
    public static class RootEndpoints
    {
        public static void MapRootEndpoints(this WebApplication app)
        {
            app.MapGet("/", () => Results.Ok(new
            {
                name = "Plant-Man API",
                status = "ok",
                endpoints = new[]
                {
                    "/api/health",
                    "/api/plants",
                    "/api/plant-taxa",
                    "/api/plant-locations",
                    "/api/care-actions",
                    "/api/action-resources",
                    "/api/care-activities",
                    "/api/care-tasks/upcoming",
                    "/api/action-logs",
                    "/api/export/spreadsheet",
                    "/api/plant-info/search"
                }
            }));

            app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
        }
    }
}
