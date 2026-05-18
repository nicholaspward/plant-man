namespace plant_manager.Data.Models
{
    public class ActionResource
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Category { get; set; }
        public string? Notes { get; set; }
        public bool IsEnabled { get; set; } = true;

        public List<ActionLogResource> ActionLogResources { get; set; } = [];
    }
}
