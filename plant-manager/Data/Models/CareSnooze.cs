namespace plant_manager.Data.Models
{
    public class CareSnooze
    {
        public int Id { get; set; }
        public int PlantId { get; set; }
        public int CareActivityId { get; set; }
        public DateOnly SnoozedUntil { get; set; }
        public DateOnly CreatedOn { get; set; }
        public string? Notes { get; set; }

        public Plant Plant { get; set; } = null!;
        public CareActivity CareActivity { get; set; } = null!;
    }
}
