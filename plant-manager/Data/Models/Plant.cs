namespace plant_manager.Data.Models
{
    public class Plant
    {
        public int Id { get; set; }
        public int? TaxonId { get; set; }
        public int? LocationId { get; set; }
        public string Nickname { get; set; } = string.Empty;
        public DateOnly? Birthday { get; set; }

        public PlantTaxon? Taxon { get; set; }
        public PlantLocation? Location { get; set; }
        public List<ActionLog> ActionLogs { get; set; } = [];
        public List<PlantCareSchedule> CareSchedules { get; set; } = [];
        public List<PlantFlag> Flags { get; set; } = [];
        public List<PlantGroupMembership> GroupMemberships { get; set; } = [];
    }
}
