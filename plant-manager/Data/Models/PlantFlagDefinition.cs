namespace plant_manager.Data.Models
{
    public class PlantFlagDefinition
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = "#f2f2f2";

        public List<PlantFlag> PlantFlags { get; set; } = [];
    }
}
