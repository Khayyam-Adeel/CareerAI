using CareerPathAI.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CareerPathAI.Persistence.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(100);

        builder.Property(u => u.PasswordHash).IsRequired().HasColumnType("nvarchar(max)");

        builder.Property(u => u.CreatedAt)
            .IsRequired()
            .HasColumnType("datetime2")
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.Property(u => u.LastLoginAt).HasColumnType("datetime2");

        builder.Property(u => u.IsActive).IsRequired().HasDefaultValue(true);
    }
}
