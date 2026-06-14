namespace plant_manager.Data.Models
{
    public class PlantCareScheduleAssignment
    {
        public int PlantCareScheduleId { get; set; }
        public int PlantId { get; set; }

        public PlantCareSchedule PlantCareSchedule { get; set; } = null!;
        public Plant Plant { get; set; } = null!;
    }
}
