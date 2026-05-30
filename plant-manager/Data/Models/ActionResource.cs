namespace plant_manager.Data.Models
{
    public class ActionResource
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public List<CareActivityActionResource> CareActivityActionResources { get; set; } = [];
        public List<ActionLogResource> ActionLogResources { get; set; } = [];
        public List<RecipeComponent> RecipeComponents { get; set; } = [];
        public Recipe? ProducedByRecipe { get; set; }
    }
}
