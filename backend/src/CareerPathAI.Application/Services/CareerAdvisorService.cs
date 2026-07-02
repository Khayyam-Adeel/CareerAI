using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;

namespace CareerPathAI.Application.Services;

/// <summary>
/// Recommends professions based on a student's interests, favorite subjects, skills and goal.
///
/// Matching itself is always rule-based (keyword overlap against profession tags/skills/field),
/// so results are deterministic and explainable via "MatchedOn" even with no AI configured.
///
/// If an IAiRecommenderClient is supplied (see Gemini implementation in
/// Infrastructure/ExternalServices/Gemini), it is used ONLY to add a friendlier natural-language
/// explanation on top of the existing shortlist - it never changes WHICH professions are
/// recommended or their ranking. This keeps results grounded in real catalog data even if the
/// LLM call fails, times out, or is simply not configured (perfectly normal on the free tier).
/// </summary>
public class CareerAdvisorService
{
    private readonly IProfessionRepository _professionRepo;
    private readonly IAiRecommenderClient? _aiClient;

    public CareerAdvisorService(IProfessionRepository professionRepo, IAiRecommenderClient? aiClient = null)
    {
        _professionRepo = professionRepo;
        _aiClient = aiClient;
    }

    public async Task<AdvisorResultDto> RecommendAsync(AdvisorRequestDto request, int topN = 5)
    {
        var professions = await _professionRepo.GetAllAsync();

        var inputTerms = NormalizeTerms(
            request.Interests
                .Concat(request.FavoriteSubjects)
                .Concat(request.Skills)
                .Concat(request.Goal is null ? Array.Empty<string>() : new[] { request.Goal })
        );

        var scored = new List<AdvisorRecommendationDto>();

        foreach (var profession in professions)
        {
            var professionTerms = NormalizeTerms(
                profession.Tags
                    .Concat(profession.RequiredSkills)
                    .Concat(new[] { profession.Field })
            );

            var matchedTerms = inputTerms.Intersect(professionTerms).ToList();
            if (matchedTerms.Count == 0)
                continue;

            // Score = overlap ratio against the profession's own term set.
            var score = (double)matchedTerms.Count / Math.Max(professionTerms.Count, 1);
            score = Math.Min(score * 1.5, 1.0); // mild boost so partial matches don't all cluster near zero

            scored.Add(new AdvisorRecommendationDto(
                ToDto(profession),
                Math.Round(score, 2),
                matchedTerms
            ));
        }

        var top = scored
            .OrderByDescending(r => r.MatchScore)
            .Take(topN)
            .ToList();

        // Optional enrichment: ask the LLM to explain each shortlisted match in plain language.
        // This NEVER changes which professions are recommended or their order - it only adds
        // a friendlier explanation. If the AI client is missing, unconfigured, or fails for any
        // reason, we silently keep the rule-based "MatchedOn" terms instead.
        if (_aiClient is not null && top.Count > 0)
        {
            var explanations = await _aiClient.ExplainMatchesAsync(
                request, top.Select(r => r.Profession).ToList());

            if (explanations is not null)
            {
                top = top.Select(r => explanations.TryGetValue(r.Profession.Id, out var text)
                    ? r with { AiExplanation = text }
                    : r
                ).ToList();
            }
        }

        return new AdvisorResultDto(top);
    }

    private static HashSet<string> NormalizeTerms(IEnumerable<string> terms) =>
        terms
            .Where(t => !string.IsNullOrWhiteSpace(t))
            .Select(t => t.Trim().ToLowerInvariant())
            .ToHashSet();

    private static ProfessionDto ToDto(Profession p) => new(
        p.Id, p.Title, p.Description, p.Field, p.SalaryMin, p.SalaryMax,
        p.Currency, p.Demand, p.RequiredSkills, p.Certifications, p.Tags
    );
}
