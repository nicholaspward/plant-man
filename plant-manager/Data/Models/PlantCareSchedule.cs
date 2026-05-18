namespace plant_manager.Data.Models
{
    public class PlantCareSchedule
    {
        public int Id { get; set; }
        public int PlantId { get; set; }
        public int CareActionId { get; set; }
        public int EveryDays { get; set; } = 7;
        public bool IsEnabled { get; set; } = true;

        public Plant Plant { get; set; } = null!;
        public CareAction CareAction { get; set; } = null!;
    }
}
