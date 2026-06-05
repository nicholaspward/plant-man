using plant_manager.Services;

namespace plant_manager.Endpoints
{
    public static class PlantInfoEndpoints
    {
        public static void MapPlantInfoEndpoints(this WebApplication app)
        {
            app.MapGet("/api/plant-info/search", async (
                string q,
                PlantInfoSearchService plantInfo,
                CancellationToken cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
                {
                    return EndpointHelpers.BadRequest("Search query must be at least 2 characters.");
                }

                var results = await plantInfo.SearchAsync(q, cancellationToken);
                return Results.Ok(results);
            });
        }
    }
}
