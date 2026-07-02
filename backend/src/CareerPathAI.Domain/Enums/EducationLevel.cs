namespace CareerPathAI.Domain.Enums;

/// <summary>
/// Represents the sequential stage of education in a career roadmap.
/// Order matters: the numeric value is used to sort roadmap nodes correctly.
/// </summary>
public enum EducationLevel
{
    Matric = 0,           // 10 years education
    Intermediate = 1,      // FSc / FA / A-Levels / Diploma
    AssociateDegree = 2,
    Bachelor = 3,
    Master = 4,
    PhD = 5
}
