namespace plant_manager.Data.Models
{
    public class CareActivity
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public List<CareActivityAction> Actions { get; set; } = [];
        public List<ActionLog> ActionLogs { get; set; } = [];
        public List<CareDismissal> CareDismissals { get; set; } = [];
        public List<CareSnooze> CareSnoozes { get; set; } = [];
        public List<PlantCareSchedule> PlantCareSchedules { get; set; } = [];
    }
}
