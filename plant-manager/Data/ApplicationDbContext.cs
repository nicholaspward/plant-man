using Microsoft.EntityFrameworkCore;
using plant_manager.Data.Models;

namespace plant_manager.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<PlantTaxon> PlantTaxa { get; set; }
        public DbSet<Plant> Plants { get; set; }
        public DbSet<CareAction> CareActions { get; set; }
        public DbSet<ActionResource> ActionResources { get; set; }
        public DbSet<ActionLog> ActionLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PlantTaxon>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Genus).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Species).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Cultivar).HasMaxLength(120);
                entity.Property(e => e.Variety).HasMaxLength(120);
                entity.Property(e => e.Authority).HasMaxLength(120);
            });

            modelBuilder.Entity<Plant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nickname).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Location).HasMaxLength(120).IsRequired();
                entity.HasOne(e => e.Taxon)
                    .WithMany()
                    .HasForeignKey(e => e.TaxonId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CareAction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(400);
                entity.Property(e => e.IsEnabled).IsRequired();
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<ActionResource>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Category).HasMaxLength(80);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.Property(e => e.IsEnabled).IsRequired();
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<ActionLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Action).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasOne(e => e.Plant)
                    .WithMany(e => e.ActionLogs)
                    .HasForeignKey(e => e.PlantId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
