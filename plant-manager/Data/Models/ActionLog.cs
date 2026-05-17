namespace plant_manager.Data.Models
{
    public class ActionLog
    {
        public int Id { get; set; }
        public int PlantId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateOnly PerformedOn { get; set; }

        public Plant Plant { get; set; } = null!;
    }
}
