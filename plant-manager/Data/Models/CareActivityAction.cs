namespace plant_manager.Data.Models
{
    public class CareActivityAction
    {
        public int CareActivityId { get; set; }
        public int CareActionId { get; set; }
        public int SortOrder { get; set; }

        public CareActivity CareActivity { get; set; } = null!;
        public CareAction CareAction { get; set; } = null!;
        public List<CareActivityActionResource> Resources { get; set; } = [];
    }
}
