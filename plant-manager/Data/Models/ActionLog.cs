namespace plant_manager.Data.Models
{
    public class ActionLog
    {
        public int Id { get; set; }
        public int PlantId { get; set; }
        public int CareActionId { get; set; }
        public int CareActivityId { get; set; }
        public string ActionNameSnapshot { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateOnly PerformedOn { get; set; }

        public Plant Plant { get; set; } = null!;
        public CareAction CareAction { get; set; } = null!;
        public CareActivity CareActivity { get; set; } = null!;
        public List<ActionLogResource> Resources { get; set; } = [];
    }
}
