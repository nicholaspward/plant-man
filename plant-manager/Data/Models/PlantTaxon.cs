namespace plant_manager.Data.Models
{
    public class PlantTaxon
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Genus { get; set; } = string.Empty;
        public string Species { get; set; } = string.Empty;

        public string? Cultivar { get; set; }
        public string? Variety { get; set; }
        public string? Authority { get; set; }
        public string? Family { get; set; }
        public string? CommonName { get; set; }
        public string ExternalSource { get; set; } = string.Empty;
        public string ExternalId { get; set; } = string.Empty;
    }
}
