namespace plant_manager.Data.Models
{
    public class RecipeComponent
    {
        public int RecipeId { get; set; }
        public int ActionResourceId { get; set; }
        public decimal? Quantity { get; set; }
        public string? Unit { get; set; }
        public string? Notes { get; set; }
        public int SortOrder { get; set; }

        public Recipe Recipe { get; set; } = null!;
        public ActionResource ActionResource { get; set; } = null!;
    }
}
