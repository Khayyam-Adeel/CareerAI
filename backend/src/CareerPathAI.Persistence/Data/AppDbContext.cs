using CareerPathAI.Domain.Entities;
using CareerPathAI.Persistence.Data.Configurations;
using Microsoft.EntityFrameworkCore;

namespace CareerPathAI.Persistence.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
    }
}
