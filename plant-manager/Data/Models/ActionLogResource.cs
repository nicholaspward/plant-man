namespace plant_manager.Data.Models
{
    public class ActionLogResource
    {
        public int ActionLogId { get; set; }
        public int ActionResourceId { get; set; }
        public decimal? Quantity { get; set; }
        public string? Unit { get; set; }

        public ActionLog ActionLog { get; set; } = null!;
        public ActionResource ActionResource { get; set; } = null!;
    }
}
