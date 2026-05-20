namespace plant_manager.Data.Models
{
    public class CareActivity
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsEnabled { get; set; } = true;

        public List<CareActivityAction> Actions { get; set; } = [];
        public List<ActionLog> ActionLogs { get; set; } = [];
        public List<PlantCareSchedule> PlantCareSchedules { get; set; } = [];
    }
}
