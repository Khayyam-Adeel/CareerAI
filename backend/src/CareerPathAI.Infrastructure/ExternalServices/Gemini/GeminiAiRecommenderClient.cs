using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CareerPathAI.Infrastructure.ExternalServices.Gemini;

/// <summary>
/// Calls Google's Gemini API (free tier eligible) to produce a short natural-language
/// explanation for each profession already shortlisted by CareerAdvisorService's rule-based
/// matcher. Never asked to invent or rank professions - only to explain a fixed list.
///
/// Fails soft everywhere: missing API key, network error, malformed response, or rate limit
/// (HTTP 429) all result in a null return, which tells CareerAdvisorService to keep using its
/// own rule-based "MatchedOn" explanations instead. A flaky or absent AI integration can never
/// break the advisor feature - it can only make the wording less polished.
/// </summary>
public class GeminiAiRecommenderClient : IAiRecommenderClient
{
    private readonly HttpClient _http;
    private readonly GeminiOptions _options;
    private readonly ILogger<GeminiAiRecommenderClient> _logger;

    public GeminiAiRecommenderClient(
        HttpClient http,
        IOptions<GeminiOptions> options,
        ILogger<GeminiAiRecommenderClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<Dictionary<int, string>?> ExplainMatchesAsync(
        AdvisorRequestDto request,
        IReadOnlyList<ProfessionDto> shortlist)
    {
        if (!_options.IsConfigured)
        {
            // Not an error - just means no GEMINI__APIKEY was set. Expected in most local setups.
            return null;
        }

        if (shortlist.Count == 0)
            return null;

        try
        {
            var prompt = BuildPrompt(request, shortlist);

            var geminiRequest = new GeminiRequest
            {
                Contents = new List<GeminiContent>
                {
                    new() { Role = "user", Parts = new List<GeminiPart> { new() { Text = prompt } } }
                },
                GenerationConfig = new GeminiGenerationConfig
                {
                    ResponseMimeType = "application/json",
                    Temperature = 0.4
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_options.Model}:generateContent";

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = JsonContent.Create(geminiRequest)
            };
            httpRequest.Headers.Add("x-goog-api-key", _options.ApiKey);

            using var response = await _http.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                // Includes 429 (free-tier rate limit exceeded) - log quietly and fall back.
                _logger.LogWarning(
                    "Gemini API returned {StatusCode} for advisor explanation request.",
                    response.StatusCode);
                return null;
            }

            var body = await response.Content.ReadFromJsonAsync<GeminiResponse>();
            var text = body?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            if (string.IsNullOrWhiteSpace(text))
                return null;

            return ParseExplanations(text, shortlist);
        }
        catch (Exception ex)
        {
            // Network failure, timeout, malformed JSON, etc. Never let this bubble up -
            // the advisor feature must keep working without AI.
            _logger.LogWarning(ex, "Gemini advisor explanation call failed; falling back to rule-based matches.");
            return null;
        }
    }

    private static string BuildPrompt(AdvisorRequestDto request, IReadOnlyList<ProfessionDto> shortlist)
    {
        var sb = new StringBuilder();
        sb.AppendLine("You are a career advisor helping a student understand why certain professions suit them.");
        sb.AppendLine("Below is the student's profile and a FIXED list of professions already chosen by a matching system.");
        sb.AppendLine("Do NOT add, remove, or reorder professions. For EACH profession id given, write one encouraging,");
        sb.AppendLine("concrete sentence (max 30 words) explaining why it fits the student's stated interests/subjects/skills/goal.");
        sb.AppendLine();
        sb.AppendLine("Student profile:");
        sb.AppendLine($"- Interests: {string.Join(", ", request.Interests)}");
        sb.AppendLine($"- Favorite subjects: {string.Join(", ", request.FavoriteSubjects)}");
        sb.AppendLine($"- Skills: {string.Join(", ", request.Skills)}");
        sb.AppendLine($"- Goal: {request.Goal ?? "(not specified)"}");
        sb.AppendLine();
        sb.AppendLine("Professions (id, title, description):");
        foreach (var p in shortlist)
        {
            sb.AppendLine($"- id={p.Id}, title=\"{p.Title}\", description=\"{p.Description}\"");
        }
        sb.AppendLine();
        sb.AppendLine("Respond with ONLY a JSON array, no markdown, in this exact shape:");
        sb.AppendLine("[{\"professionId\": <int>, \"explanation\": \"<string>\"}, ...]");
        sb.AppendLine("Include exactly one entry per profession id listed above, in any order.");

        return sb.ToString();
    }

    private Dictionary<int, string>? ParseExplanations(string rawText, IReadOnlyList<ProfessionDto> shortlist)
    {
        try
        {
            var validIds = shortlist.Select(p => p.Id).ToHashSet();
            var items = JsonSerializer.Deserialize<List<GeminiExplanationItem>>(rawText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (items is null)
                return null;

            // Only keep entries for professions that were actually in the shortlist -
            // defends against the model hallucinating an id that wasn't offered.
            return items
                .Where(i => validIds.Contains(i.ProfessionId) && !string.IsNullOrWhiteSpace(i.Explanation))
                .ToDictionary(i => i.ProfessionId, i => i.Explanation.Trim());
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Could not parse Gemini explanation JSON; falling back to rule-based matches.");
            return null;
        }
    }
}
