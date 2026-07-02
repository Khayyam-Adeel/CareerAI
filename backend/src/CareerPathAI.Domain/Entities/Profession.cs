using CareerPathAI.Domain.Enums;

namespace CareerPathAI.Domain.Entities;

/// <summary>
/// Represents a career outcome (e.g. "AI Research Scientist", "Civil Engineer").
/// </summary>
public class Profession
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Field { get; set; } = string.Empty;          // e.g. "Technology", "Healthcare"
    public decimal SalaryMin { get; set; }
    public decimal SalaryMax { get; set; }
    public string Currency { get; set; } = "USD";
    public DemandTrend Demand { get; set; }
    public List<string> RequiredSkills { get; set; } = new();
    public List<string> Certifications { get; set; } = new();
    public List<string> Tags { get; set; } = new();            // used for AI advisor matching

    /// <summary>
    /// Ids of Degree records that typically lead to this profession.
    /// A profession can have multiple valid degree paths (alternative routes).
    /// </summary>
    public List<int> QualifyingDegreeIds { get; set; } = new();
}
