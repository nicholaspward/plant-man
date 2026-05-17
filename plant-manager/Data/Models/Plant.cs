namespace plant_manager.Data.Models
{
    public class Plant
    {
        public int Id { get; set; }
        public int TaxonId { get; set; }
        public string Nickname { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateOnly? LastWateredOn { get; set; }
        public int WaterEveryDays { get; set; } = 7;

        public PlantTaxon Taxon { get; set; } = null!;
        public List<ActionLog> ActionLogs { get; set; } = [];
    }
}
