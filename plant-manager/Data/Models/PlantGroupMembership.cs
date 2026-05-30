namespace plant_manager.Data.Models
{
    public class PlantGroupMembership
    {
        public int PlantId { get; set; }
        public int PlantGroupId { get; set; }

        public Plant Plant { get; set; } = null!;
        public PlantGroup PlantGroup { get; set; } = null!;
    }
}
