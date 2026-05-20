namespace plant_manager.Data.Models
{
    public class PlantFlag
    {
        public int Id { get; set; }
        public int PlantId { get; set; }
        public int PlantFlagDefinitionId { get; set; }
        public DateOnly StartedOn { get; set; }
        public DateOnly? ResolvedOn { get; set; }
        public string? Notes { get; set; }

        public Plant Plant { get; set; } = null!;
        public PlantFlagDefinition Definition { get; set; } = null!;
    }
}
