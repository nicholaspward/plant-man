using Microsoft.EntityFrameworkCore;
using plant_manager.Data.Models;

namespace plant_manager.Data
{
    public class PlantInfoDbContext(DbContextOptions<PlantInfoDbContext> options) : DbContext(options)
    {
        public DbSet<PlantInfoRecord> PlantInfoRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PlantInfoRecord>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd();
                entity.Property(e => e.Source).HasMaxLength(40).IsRequired();
                entity.Property(e => e.ExternalId).HasMaxLength(80).IsRequired();
                entity.Property(e => e.ScientificName).HasMaxLength(240).IsRequired();
                entity.Property(e => e.CanonicalName).HasMaxLength(180);
                entity.Property(e => e.Authorship).HasMaxLength(120);
                entity.Property(e => e.CommonName).HasMaxLength(180);
                entity.Property(e => e.AliasesText).HasMaxLength(1000);
                entity.Property(e => e.Family).HasMaxLength(120);
                entity.Property(e => e.Genus).HasMaxLength(120);
                entity.Property(e => e.Species).HasMaxLength(120);
                entity.Property(e => e.Rank).HasMaxLength(40);
                entity.Property(e => e.Status).HasMaxLength(40);
                entity.HasIndex(e => new { e.Source, e.ExternalId }).IsUnique();
                entity.HasIndex(e => e.CanonicalName);
                entity.HasIndex(e => e.CommonName);
                entity.HasIndex(e => e.Genus);
                entity.HasIndex(e => e.Family);
            });
        }

        public async Task EnsureSearchSchemaAsync()
        {
            await Database.EnsureCreatedAsync();

            await Database.ExecuteSqlRawAsync("""
                CREATE VIRTUAL TABLE IF NOT EXISTS PlantInfoSearch USING fts5(
                    CommonName,
                    ScientificName,
                    CanonicalName,
                    AliasesText,
                    Family,
                    Genus,
                    Species,
                    content='PlantInfoRecords',
                    content_rowid='Id'
                );
                """);

            await Database.ExecuteSqlRawAsync("""
                CREATE TRIGGER IF NOT EXISTS PlantInfoRecords_ai AFTER INSERT ON PlantInfoRecords BEGIN
                    INSERT INTO PlantInfoSearch(rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
                    VALUES (new.Id, new.CommonName, new.ScientificName, new.CanonicalName, new.AliasesText, new.Family, new.Genus, new.Species);
                END;
                """);

            await Database.ExecuteSqlRawAsync("""
                CREATE TRIGGER IF NOT EXISTS PlantInfoRecords_ad AFTER DELETE ON PlantInfoRecords BEGIN
                    INSERT INTO PlantInfoSearch(PlantInfoSearch, rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
                    VALUES ('delete', old.Id, old.CommonName, old.ScientificName, old.CanonicalName, old.AliasesText, old.Family, old.Genus, old.Species);
                END;
                """);

            await Database.ExecuteSqlRawAsync("""
                CREATE TRIGGER IF NOT EXISTS PlantInfoRecords_au AFTER UPDATE ON PlantInfoRecords BEGIN
                    INSERT INTO PlantInfoSearch(PlantInfoSearch, rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
                    VALUES ('delete', old.Id, old.CommonName, old.ScientificName, old.CanonicalName, old.AliasesText, old.Family, old.Genus, old.Species);
                    INSERT INTO PlantInfoSearch(rowid, CommonName, ScientificName, CanonicalName, AliasesText, Family, Genus, Species)
                    VALUES (new.Id, new.CommonName, new.ScientificName, new.CanonicalName, new.AliasesText, new.Family, new.Genus, new.Species);
                END;
                """);

            await Database.ExecuteSqlRawAsync("""
                INSERT INTO PlantInfoSearch(PlantInfoSearch) VALUES ('rebuild');
                """);
        }
    }
}
