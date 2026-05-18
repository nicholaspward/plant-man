namespace plant_manager.Data.Models
{
    public class PlantFlagDefinition
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Color { get; set; } = "#f2f2f2";
        public bool IsEnabled { get; set; } = true;

        public List<PlantFlag> PlantFlags { get; set; } = [];
    }
}
