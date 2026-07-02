using CareerPathAI.Application.DTOs;
using CareerPathAI.Domain.Entities;

namespace CareerPathAI.Application.Interfaces;

/// <summary>
/// Abstraction over profession storage. Implemented in-memory today
/// (see Infrastructure/Repositories/InMemoryProfessionRepository.cs);
/// swap with an EF Core implementation later without touching Application or API layers.
/// </summary>
public interface IProfessionRepository
{
    Task<IReadOnlyList<Profession>> GetAllAsync();
    Task<Profession?> GetByIdAsync(int id);
    Task<IReadOnlyList<Profession>> GetByIdsAsync(IEnumerable<int> ids);
    Task<IReadOnlyList<Profession>> SearchAsync(string? field, string? keyword);
}

public interface IDegreeRepository
{
    Task<IReadOnlyList<Degree>> GetAllAsync();
    Task<Degree?> GetByIdAsync(int id);
    Task<IReadOnlyList<Degree>> GetByIdsAsync(IEnumerable<int> ids);
}

/// <summary>
/// Abstraction over an external LLM used to re-rank and explain advisor recommendations
/// in natural language. Implemented today against Gemini (free tier) - see
/// Infrastructure/ExternalServices/Gemini/GeminiAiRecommenderClient.cs.
///
/// Deliberately narrow: it never invents professions. It only takes a shortlist that was
/// already computed by rule-based matching and returns a natural-language explanation per
/// profession, so a bad or unavailable LLM call can never corrupt the underlying data -
/// it can only make the explanation less polished (CareerAdvisorService falls back to its
/// own rule-based "MatchedOn" terms if this returns null).
/// </summary>
public interface IAiRecommenderClient
{
    /// <summary>
    /// Returns a short, natural-language explanation of why each shortlisted profession
    /// fits the student's stated interests/subjects/skills/goal. Returns null on any
    /// failure (missing API key, network error, rate limit) so callers can fall back.
    /// </summary>
    Task<Dictionary<int, string>?> ExplainMatchesAsync(
        AdvisorRequestDto request,
        IReadOnlyList<ProfessionDto> shortlist);
}
