namespace plant_manager.Data.Models
{
    public class CareAction
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsEnabled { get; set; } = true;
    }
}
