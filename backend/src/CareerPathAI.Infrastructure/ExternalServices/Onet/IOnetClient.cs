namespace CareerPathAI.Infrastructure.ExternalServices.Onet;

/// <summary>
/// Thin abstraction over O*NET Web Services keyword search, kept separate from
/// IProfessionRepository on purpose: O*NET only knows about ~900 standardized US occupations
/// and has zero concept of the Matric-to-PhD degree ladder this app is built around, so it
/// can only ever ENRICH the existing seed catalog (e.g. confirm a real-world description or
/// O*NET-SOC code) - it can never replace CatalogSeed as the source of roadmap structure.
/// </summary>
public interface IOnetClient
{
    /// <summary>
    /// Looks up a profession title against O*NET's live occupation database.
    /// Returns null if not configured, not found, or the call fails for any reason.
    /// </summary>
    Task<OnetOccupationMatch?> FindOccupationAsync(string title);
}

/// <summary>Simplified result returned to callers - internal O*NET JSON shapes stay private to this folder.</summary>
public record OnetOccupationMatch(string OnetSocCode, string Title, string? Description);
