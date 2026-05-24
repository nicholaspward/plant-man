using Microsoft.EntityFrameworkCore;
using plant_manager.Data.Models;

namespace plant_manager.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<PlantTaxon> PlantTaxa { get; set; }
        public DbSet<PlantLocation> PlantLocations { get; set; }
        public DbSet<Plant> Plants { get; set; }
        public DbSet<CareAction> CareActions { get; set; }
        public DbSet<ActionResource> ActionResources { get; set; }
        public DbSet<CareActivity> CareActivities { get; set; }
        public DbSet<CareActivityAction> CareActivityActions { get; set; }
        public DbSet<CareActivityActionResource> CareActivityActionResources { get; set; }
        public DbSet<ActionLog> ActionLogs { get; set; }
        public DbSet<ActionLogResource> ActionLogResources { get; set; }
        public DbSet<PlantCareSchedule> PlantCareSchedules { get; set; }
        public DbSet<PlantFlagDefinition> PlantFlagDefinitions { get; set; }
        public DbSet<PlantFlag> PlantFlags { get; set; }

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
                entity.HasOne(e => e.Taxon)
                    .WithMany()
                    .HasForeignKey(e => e.TaxonId)
                    .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Location)
                    .WithMany(e => e.Plants)
                    .HasForeignKey(e => e.LocationId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<PlantLocation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<CareAction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Description).HasMaxLength(400);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<ActionResource>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<CareActivity>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<CareActivityAction>(entity =>
            {
                entity.HasKey(e => new { e.CareActivityId, e.CareActionId });
                entity.Property(e => e.SortOrder).IsRequired();
                entity.HasIndex(e => new { e.CareActivityId, e.SortOrder }).IsUnique();
                entity.HasOne(e => e.CareActivity)
                    .WithMany(e => e.Actions)
                    .HasForeignKey(e => e.CareActivityId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CareAction)
                    .WithMany(e => e.CareActivityActions)
                    .HasForeignKey(e => e.CareActionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<CareActivityActionResource>(entity =>
            {
                entity.HasKey(e => new { e.CareActivityId, e.CareActionId, e.ActionResourceId });
                entity.Property(e => e.Quantity).HasPrecision(10, 2);
                entity.Property(e => e.Unit).HasMaxLength(40);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasOne(e => e.CareActivityAction)
                    .WithMany(e => e.Resources)
                    .HasForeignKey(e => new { e.CareActivityId, e.CareActionId })
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.ActionResource)
                    .WithMany(e => e.CareActivityActionResources)
                    .HasForeignKey(e => e.ActionResourceId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ActionLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ActionNameSnapshot).HasMaxLength(80).IsRequired();
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasOne(e => e.Plant)
                    .WithMany(e => e.ActionLogs)
                    .HasForeignKey(e => e.PlantId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CareAction)
                    .WithMany(e => e.ActionLogs)
                    .HasForeignKey(e => e.CareActionId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.CareActivity)
                    .WithMany(e => e.ActionLogs)
                    .HasForeignKey(e => e.CareActivityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ActionLogResource>(entity =>
            {
                entity.HasKey(e => new { e.ActionLogId, e.ActionResourceId });
                entity.Property(e => e.Quantity).HasPrecision(10, 2);
                entity.Property(e => e.Unit).HasMaxLength(40);
                entity.HasOne(e => e.ActionLog)
                    .WithMany(e => e.Resources)
                    .HasForeignKey(e => e.ActionLogId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.ActionResource)
                    .WithMany(e => e.ActionLogResources)
                    .HasForeignKey(e => e.ActionResourceId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PlantCareSchedule>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.EveryDays).IsRequired();
                entity.Property(e => e.ScheduledFor);
                entity.Property(e => e.RecurrenceMode).HasMaxLength(20).IsRequired();
                entity.Property(e => e.RepeatEvery).IsRequired();
                entity.Property(e => e.RepeatUnit).HasMaxLength(20).IsRequired();
                entity.Property(e => e.RepeatOnDays).HasMaxLength(40);
                entity.Property(e => e.EndsMode).HasMaxLength(20).IsRequired();
                entity.Property(e => e.EndsOn);
                entity.Property(e => e.EndsAfterOccurrences);
                entity.HasIndex(e => new { e.PlantId, e.CareActionId }).IsUnique(false);
                entity.HasIndex(e => new { e.PlantId, e.CareActivityId }).IsUnique();
                entity.HasOne(e => e.Plant)
                    .WithMany(e => e.CareSchedules)
                    .HasForeignKey(e => e.PlantId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.CareAction)
                    .WithMany(e => e.PlantCareSchedules)
                    .HasForeignKey(e => e.CareActionId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.CareActivity)
                    .WithMany(e => e.PlantCareSchedules)
                    .HasForeignKey(e => e.CareActivityId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PlantFlagDefinition>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Name).HasMaxLength(120).IsRequired();
                entity.Property(e => e.Color).HasMaxLength(20).IsRequired();
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<PlantFlag>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                      .ValueGeneratedOnAdd();
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.HasIndex(e => new { e.PlantId, e.PlantFlagDefinitionId, e.ResolvedOn });
                entity.HasOne(e => e.Plant)
                    .WithMany(e => e.Flags)
                    .HasForeignKey(e => e.PlantId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Definition)
                    .WithMany(e => e.PlantFlags)
                    .HasForeignKey(e => e.PlantFlagDefinitionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
