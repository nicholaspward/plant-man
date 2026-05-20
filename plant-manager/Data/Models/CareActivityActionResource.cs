namespace plant_manager.Data.Models
{
    public class CareActivityActionResource
    {
        public int CareActivityId { get; set; }
        public int CareActionId { get; set; }
        public int ActionResourceId { get; set; }
        public decimal? Quantity { get; set; }
        public string? Unit { get; set; }
        public string? Notes { get; set; }

        public CareActivityAction CareActivityAction { get; set; } = null!;
        public ActionResource ActionResource { get; set; } = null!;
    }
}
