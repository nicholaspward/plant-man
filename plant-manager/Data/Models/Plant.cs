namespace plant_manager.Data.Models
{
    public class Plant
    {
        public int Id { get; set; }
        public int TaxonId { get; set; }
        public string Nickname { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        public PlantTaxon Taxon { get; set; } = null!;
        public List<ActionLog> ActionLogs { get; set; } = [];
        public List<PlantCareSchedule> CareSchedules { get; set; } = [];
        public List<PlantFlag> Flags { get; set; } = [];
    }
}
