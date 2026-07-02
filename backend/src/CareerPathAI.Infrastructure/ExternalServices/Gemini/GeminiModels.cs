using System.Text.Json.Serialization;

namespace CareerPathAI.Infrastructure.ExternalServices.Gemini;

// Minimal subset of the Gemini generateContent request/response shape - just enough
// to send one text prompt and read back one text response. See:
// https://ai.google.dev/api/generate-content

internal class GeminiRequest
{
    [JsonPropertyName("contents")]
    public List<GeminiContent> Contents { get; set; } = new();

    [JsonPropertyName("generationConfig")]
    public GeminiGenerationConfig? GenerationConfig { get; set; }
}

internal class GeminiContent
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = "user";

    [JsonPropertyName("parts")]
    public List<GeminiPart> Parts { get; set; } = new();
}

internal class GeminiPart
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}

internal class GeminiGenerationConfig
{
    /// <summary>Forces Gemini to return raw JSON instead of markdown-wrapped text.</summary>
    [JsonPropertyName("responseMimeType")]
    public string ResponseMimeType { get; set; } = "application/json";

    [JsonPropertyName("temperature")]
    public double Temperature { get; set; } = 0.4;
}

internal class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<GeminiCandidate>? Candidates { get; set; }
}

internal class GeminiCandidate
{
    [JsonPropertyName("content")]
    public GeminiContent? Content { get; set; }

    [JsonPropertyName("finishReason")]
    public string? FinishReason { get; set; }
}

/// <summary>
/// Shape we ask Gemini to return for each shortlisted profession (via the prompt + JSON mode).
/// </summary>
internal class GeminiExplanationItem
{
    [JsonPropertyName("professionId")]
    public int ProfessionId { get; set; }

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = string.Empty;
}
