using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;
using CareerPathAI.Infrastructure.SeedData;

namespace CareerPathAI.Infrastructure.Repositories;

/// <summary>
/// In-memory implementation seeded from CatalogSeed.
/// Swap for an EF Core + SQL Server implementation later: create
/// CareerPathAI.Persistence.Repositories.EfProfessionRepository implementing the same
/// IProfessionRepository interface, then change one line in Program.cs DI registration.
/// </summary>
public class InMemoryProfessionRepository : IProfessionRepository
{
    private readonly List<Profession> _professions = CatalogSeed.Professions;

    public Task<IReadOnlyList<Profession>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Profession>>(_professions);

    public Task<Profession?> GetByIdAsync(int id) =>
        Task.FromResult(_professions.FirstOrDefault(p => p.Id == id));

    public Task<IReadOnlyList<Profession>> GetByIdsAsync(IEnumerable<int> ids)
    {
        var idSet = ids.ToHashSet();
        return Task.FromResult<IReadOnlyList<Profession>>(
            _professions.Where(p => idSet.Contains(p.Id)).ToList());
    }

    public Task<IReadOnlyList<Profession>> SearchAsync(string? field, string? keyword)
    {
        var query = _professions.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(field))
            query = query.Where(p => p.Field.Equals(field, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim().ToLowerInvariant();
            query = query.Where(p =>
                p.Title.ToLowerInvariant().Contains(k) ||
                p.Description.ToLowerInvariant().Contains(k) ||
                p.Tags.Any(t => t.ToLowerInvariant().Contains(k)));
        }

        return Task.FromResult<IReadOnlyList<Profession>>(query.ToList());
    }
}

public class InMemoryDegreeRepository : IDegreeRepository
{
    private readonly List<Degree> _degrees = CatalogSeed.Degrees;

    public Task<IReadOnlyList<Degree>> GetAllAsync() =>
        Task.FromResult<IReadOnlyList<Degree>>(_degrees);

    public Task<Degree?> GetByIdAsync(int id) =>
        Task.FromResult(_degrees.FirstOrDefault(d => d.Id == id));

    public Task<IReadOnlyList<Degree>> GetByIdsAsync(IEnumerable<int> ids)
    {
        var idSet = ids.ToHashSet();
        return Task.FromResult<IReadOnlyList<Degree>>(
            _degrees.Where(d => idSet.Contains(d.Id)).ToList());
    }
}
