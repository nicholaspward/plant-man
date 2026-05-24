namespace plant_manager.Data.Models
{
    public class PlantLocation
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public List<Plant> Plants { get; set; } = [];
    }
}
