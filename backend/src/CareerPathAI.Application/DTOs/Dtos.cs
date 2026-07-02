using CareerPathAI.Domain.Enums;

namespace CareerPathAI.Application.DTOs;

public record ProfessionDto(
    int Id,
    string Title,
    string Description,
    string Field,
    decimal SalaryMin,
    decimal SalaryMax,
    string Currency,
    DemandTrend Demand,
    List<string> RequiredSkills,
    List<string> Certifications,
    List<string> Tags
);

public record DegreeDto(
    int Id,
    string Name,
    EducationLevel Level,
    string Field,
    string Description,
    int DurationInYears,
    List<string> Subjects,
    List<string> EligibilityRequirements
);

/// <summary>
/// A single node in a visual roadmap chain (e.g. one box in the Matric -> PhD chain).
/// </summary>
public record RoadmapNodeDto(
    string NodeType,        // "Degree" or "Profession"
    int RefId,
    string Title,
    EducationLevel? Level,  // null when NodeType == "Profession"
    int Order
);

/// <summary>
/// A full roadmap: an ordered list of nodes plus the edges connecting them.
/// Returned to the Angular roadmap visualizer as-is.
/// </summary>
public record RoadmapDto(
    int ProfessionId,
    string ProfessionTitle,
    List<RoadmapNodeDto> Nodes
);

public record CareerComparisonDto(
    ProfessionDto ProfessionA,
    ProfessionDto ProfessionB
);

public record AdvisorRequestDto(
    List<string> Interests,
    List<string> FavoriteSubjects,
    List<string> Skills,
    string? Goal
);

public record AdvisorRecommendationDto(
    ProfessionDto Profession,
    double MatchScore,        // 0.0 - 1.0
    List<string> MatchedOn,
    string? AiExplanation = null   // natural-language explanation from Gemini, if available
);

public record AdvisorResultDto(
    List<AdvisorRecommendationDto> RecommendedProfessions
);
