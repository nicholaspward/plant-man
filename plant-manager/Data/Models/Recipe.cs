namespace plant_manager.Data.Models
{
    public class Recipe
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string MeasurementMode { get; set; } = "quantity";
        public int? OutputResourceId { get; set; }
        public string? Notes { get; set; }

        public ActionResource? OutputResource { get; set; }
        public List<RecipeComponent> Components { get; set; } = [];
    }
}
