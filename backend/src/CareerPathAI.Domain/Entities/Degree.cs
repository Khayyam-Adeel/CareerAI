using CareerPathAI.Domain.Enums;

namespace CareerPathAI.Domain.Entities;

/// <summary>
/// Represents a single educational qualification step
/// (e.g. "FSc Pre-Engineering", "BS Computer Science", "MS Artificial Intelligence").
/// </summary>
public class Degree
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public EducationLevel Level { get; set; }
    public string Field { get; set; } = string.Empty;          // e.g. "Computer Science"
    public string Description { get; set; } = string.Empty;
    public int DurationInYears { get; set; }
    public List<string> Subjects { get; set; } = new();
    public List<string> EligibilityRequirements { get; set; } = new();

    /// <summary>
    /// Ids of Degree records that are valid prerequisites for this degree.
    /// Empty for the root (Matric) level.
    /// </summary>
    public List<int> PrerequisiteDegreeIds { get; set; } = new();

    /// <summary>
    /// Ids of professions directly reachable after completing this degree.
    /// </summary>
    public List<int> LeadsToProfessionIds { get; set; } = new();
}
