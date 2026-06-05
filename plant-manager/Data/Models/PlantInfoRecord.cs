namespace plant_manager.Data.Models
{
    public class PlantInfoRecord
    {
        public int Id { get; set; }
        public string Source { get; set; } = "gbif";
        public string ExternalId { get; set; } = string.Empty;
        public string ScientificName { get; set; } = string.Empty;
        public string? CanonicalName { get; set; }
        public string? Authorship { get; set; }
        public string? CommonName { get; set; }
        public string? AliasesText { get; set; }
        public string? Family { get; set; }
        public string? Genus { get; set; }
        public string? Species { get; set; }
        public string? Rank { get; set; }
        public string? Status { get; set; }
    }
}
