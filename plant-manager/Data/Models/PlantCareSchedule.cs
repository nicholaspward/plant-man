namespace plant_manager.Data.Models
{
    public class PlantCareSchedule
    {
        public int Id { get; set; }
        public int PlantId { get; set; }
        public int CareActionId { get; set; }
        public int CareActivityId { get; set; }
        public int EveryDays { get; set; } = 7;
        public DateOnly? ScheduledFor { get; set; }
        public string RecurrenceMode { get; set; } = "weekly";
        public int RepeatEvery { get; set; } = 1;
        public string RepeatUnit { get; set; } = "week";
        public string? RepeatOnDays { get; set; }
        public string EndsMode { get; set; } = "after";
        public DateOnly? EndsOn { get; set; }
        public int? EndsAfterOccurrences { get; set; }
        public bool IsEnabled { get; set; } = true;

        public Plant Plant { get; set; } = null!;
        public CareAction CareAction { get; set; } = null!;
        public CareActivity CareActivity { get; set; } = null!;
    }
}
