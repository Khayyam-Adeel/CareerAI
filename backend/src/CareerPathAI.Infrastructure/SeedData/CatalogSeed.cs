using CareerPathAI.Domain.Entities;
using CareerPathAI.Domain.Enums;

namespace CareerPathAI.Infrastructure.SeedData;

/// <summary>
/// Static in-memory catalog data. Replace this entirely with EF Core + SQL Server later -
/// the repository interfaces in Application already isolate this layer.
/// </summary>
public static class CatalogSeed
{
    public static List<Degree> Degrees { get; } = new()
    {
        new Degree
        {
            Id = 1, Name = "Matric - Science", Level = EducationLevel.Matric,
            Field = "General Science", DurationInYears = 2,
            Description = "10-year secondary education with a science group (Physics, Chemistry, Biology/Computer Science, Math).",
            Subjects = new() { "Physics", "Chemistry", "Mathematics", "Biology or Computer Science" },
            EligibilityRequirements = new() { "Completion of secondary schooling" },
            PrerequisiteDegreeIds = new()
        },
        new Degree
        {
            Id = 2, Name = "FSc Pre-Engineering", Level = EducationLevel.Intermediate,
            Field = "Engineering Foundations", DurationInYears = 2,
            Description = "Intermediate program focused on Physics, Chemistry and Mathematics, the standard gateway into engineering and computing degrees.",
            Subjects = new() { "Physics", "Chemistry", "Mathematics" },
            EligibilityRequirements = new() { "Matric - Science with minimum required grade" },
            PrerequisiteDegreeIds = new() { 1 }
        },
        new Degree
        {
            Id = 3, Name = "FSc Pre-Medical", Level = EducationLevel.Intermediate,
            Field = "Medical Foundations", DurationInYears = 2,
            Description = "Intermediate program focused on Biology, Chemistry and Physics, the standard gateway into medical degrees.",
            Subjects = new() { "Biology", "Chemistry", "Physics" },
            EligibilityRequirements = new() { "Matric - Science with minimum required grade" },
            PrerequisiteDegreeIds = new() { 1 }
        },
        new Degree
        {
            Id = 4, Name = "ICS (Computer Science Intermediate)", Level = EducationLevel.Intermediate,
            Field = "Computer Science Foundations", DurationInYears = 2,
            Description = "Intermediate program with Computer Science, Mathematics and Physics/Statistics.",
            Subjects = new() { "Computer Science", "Mathematics", "Physics or Statistics" },
            EligibilityRequirements = new() { "Matric - Science with minimum required grade" },
            PrerequisiteDegreeIds = new() { 1 }
        },
        new Degree
        {
            Id = 10, Name = "BS Computer Science", Level = EducationLevel.Bachelor,
            Field = "Computer Science", DurationInYears = 4,
            Description = "Four-year bachelor's degree covering programming, algorithms, systems, databases and software engineering.",
            Subjects = new() { "Data Structures", "Algorithms", "Operating Systems", "Databases", "Software Engineering", "AI Fundamentals" },
            EligibilityRequirements = new() { "FSc Pre-Engineering or ICS with minimum required grade" },
            PrerequisiteDegreeIds = new() { 2 },
            LeadsToProfessionIds = new() { 100, 101, 102, 103, 104 }
        },
        new Degree
        {
            Id = 11, Name = "BS Software Engineering", Level = EducationLevel.Bachelor,
            Field = "Software Engineering", DurationInYears = 4,
            Description = "Four-year bachelor's degree emphasizing software design, architecture, quality and large-scale system development.",
            Subjects = new() { "Software Design", "Requirements Engineering", "System Architecture", "DevOps", "Cloud Computing" },
            EligibilityRequirements = new() { "FSc Pre-Engineering or ICS with minimum required grade" },
            PrerequisiteDegreeIds = new() { 2 },
            LeadsToProfessionIds = new() { 100, 105, 106, 107 }
        },
        new Degree
        {
            Id = 12, Name = "MBBS", Level = EducationLevel.Bachelor,
            Field = "Medicine", DurationInYears = 5,
            Description = "Five-year professional medical degree required to practice as a doctor.",
            Subjects = new() { "Anatomy", "Physiology", "Pharmacology", "Pathology", "Clinical Rotations" },
            EligibilityRequirements = new() { "FSc Pre-Medical with minimum required grade", "Medical entrance test" },
            PrerequisiteDegreeIds = new() { 3 },
            LeadsToProfessionIds = new() { 108 }
        },
        new Degree
        {
            Id = 13, Name = "BSc Civil Engineering", Level = EducationLevel.Bachelor,
            Field = "Civil Engineering", DurationInYears = 4,
            Description = "Four-year engineering degree covering structures, geotechnics, transportation and construction management.",
            Subjects = new() { "Structural Analysis", "Geotechnical Engineering", "Surveying", "Construction Management" },
            EligibilityRequirements = new() { "FSc Pre-Engineering with minimum required grade", "Engineering entrance test" },
            PrerequisiteDegreeIds = new() { 2 },
            LeadsToProfessionIds = new() { 109 }
        },
        new Degree
        {
            Id = 20, Name = "MS Computer Science", Level = EducationLevel.Master,
            Field = "Computer Science", DurationInYears = 2,
            Description = "Graduate degree allowing specialization (AI, Data Science, Cybersecurity, Systems).",
            Subjects = new() { "Machine Learning", "Advanced Algorithms", "Research Methodology" },
            EligibilityRequirements = new() { "BS Computer Science or equivalent" },
            PrerequisiteDegreeIds = new() { 10 },
            LeadsToProfessionIds = new() { 101, 103, 104 }
        },
        new Degree
        {
            Id = 30, Name = "PhD Artificial Intelligence", Level = EducationLevel.PhD,
            Field = "Artificial Intelligence", DurationInYears = 4,
            Description = "Doctoral research degree focused on original contributions to AI/ML theory and applications.",
            Subjects = new() { "Research", "Published Thesis", "Advanced Machine Learning Theory" },
            EligibilityRequirements = new() { "MS Computer Science with research aptitude" },
            PrerequisiteDegreeIds = new() { 20 },
            LeadsToProfessionIds = new() { 104 }
        }
    };

    public static List<Profession> Professions { get; } = new()
    {
        new Profession
        {
            Id = 100, Title = "Software Engineer", Field = "Technology",
            Description = "Designs, builds and maintains software applications and systems.",
            SalaryMin = 60000, SalaryMax = 140000, Currency = "USD", Demand = DemandTrend.HighGrowth,
            RequiredSkills = new() { "Programming", "Problem Solving", "Data Structures", "Git" },
            Certifications = new() { "AWS Certified Developer", "Microsoft Certified: Azure Developer" },
            Tags = new() { "coding", "technology", "logic", "software", "computers" },
            QualifyingDegreeIds = new() { 10, 11 }
        },
        new Profession
        {
            Id = 101, Title = "AI Engineer", Field = "Technology",
            Description = "Builds and deploys machine learning models and AI-driven systems into production.",
            SalaryMin = 80000, SalaryMax = 180000, Currency = "USD", Demand = DemandTrend.HighGrowth,
            RequiredSkills = new() { "Python", "Machine Learning", "Deep Learning", "MLOps" },
            Certifications = new() { "TensorFlow Developer Certificate", "AWS Certified Machine Learning" },
            Tags = new() { "ai", "machine learning", "technology", "data", "math" },
            QualifyingDegreeIds = new() { 10, 20 }
        },
        new Profession
        {
            Id = 102, Title = "Data Scientist", Field = "Technology",
            Description = "Analyzes large datasets to extract insights and build predictive models.",
            SalaryMin = 70000, SalaryMax = 160000, Currency = "USD", Demand = DemandTrend.HighGrowth,
            RequiredSkills = new() { "Statistics", "Python", "SQL", "Data Visualization" },
            Certifications = new() { "Google Data Analytics Certificate" },
            Tags = new() { "data", "statistics", "analysis", "technology", "math" },
            QualifyingDegreeIds = new() { 10 }
        },
        new Profession
        {
            Id = 103, Title = "Cyber Security Specialist", Field = "Technology",
            Description = "Protects systems and networks from digital attacks and security breaches.",
            SalaryMin = 65000, SalaryMax = 150000, Currency = "USD", Demand = DemandTrend.HighGrowth,
            RequiredSkills = new() { "Network Security", "Ethical Hacking", "Risk Assessment" },
            Certifications = new() { "CISSP", "CEH", "CompTIA Security+" },
            Tags = new() { "security", "technology", "networks", "hacking" },
            QualifyingDegreeIds = new() { 10 }
        },
        new Profession
        {
            Id = 104, Title = "AI Research Scientist", Field = "Technology",
            Description = "Conducts original research advancing the theory and capability of AI systems.",
            SalaryMin = 90000, SalaryMax = 220000, Currency = "USD", Demand = DemandTrend.HighGrowth,
            RequiredSkills = new() { "Research", "Mathematics", "Deep Learning Theory", "Academic Writing" },
            Certifications = new() { "Published Research (peer review)" },
            Tags = new() { "ai", "research", "academia", "math", "innovation" },
            QualifyingDegreeIds = new() { 30, 20 }
        },
        new Profession
        {
            Id = 105, Title = "DevOps Engineer", Field = "Technology",
            Description = "Builds and manages CI/CD pipelines and cloud infrastructure for fast, reliable software delivery.",
            SalaryMin = 70000, SalaryMax = 150000, Currency = "USD", Demand = DemandTrend.Growing,
            RequiredSkills = new() { "CI/CD", "Docker", "Kubernetes", "Cloud Platforms" },
            Certifications = new() { "AWS Certified DevOps Engineer", "Certified Kubernetes Administrator" },
            Tags = new() { "devops", "cloud", "infrastructure", "technology" },
            QualifyingDegreeIds = new() { 11 }
        },
        new Profession
        {
            Id = 106, Title = "Cloud Architect", Field = "Technology",
            Description = "Designs scalable, secure cloud infrastructure and migration strategies for organizations.",
            SalaryMin = 95000, SalaryMax = 190000, Currency = "USD", Demand = DemandTrend.HighGrowth,
            RequiredSkills = new() { "AWS", "Azure", "System Design", "Networking" },
            Certifications = new() { "AWS Certified Solutions Architect", "Azure Solutions Architect Expert" },
            Tags = new() { "cloud", "architecture", "technology", "infrastructure" },
            QualifyingDegreeIds = new() { 11 }
        },
        new Profession
        {
            Id = 107, Title = "Solution Architect", Field = "Technology",
            Description = "Designs end-to-end technical solutions aligning business requirements with system architecture.",
            SalaryMin = 90000, SalaryMax = 180000, Currency = "USD", Demand = DemandTrend.Growing,
            RequiredSkills = new() { "System Design", "Stakeholder Management", "Cloud Platforms" },
            Certifications = new() { "TOGAF", "AWS Certified Solutions Architect" },
            Tags = new() { "architecture", "technology", "leadership", "design" },
            QualifyingDegreeIds = new() { 11 }
        },
        new Profession
        {
            Id = 108, Title = "Doctor (General Physician)", Field = "Healthcare",
            Description = "Diagnoses and treats illnesses, and provides preventive care to patients.",
            SalaryMin = 50000, SalaryMax = 200000, Currency = "USD", Demand = DemandTrend.Stable,
            RequiredSkills = new() { "Clinical Diagnosis", "Patient Care", "Empathy" },
            Certifications = new() { "Medical License (country-specific)", "PMDC Registration" },
            Tags = new() { "medicine", "healthcare", "biology", "patients", "helping people" },
            QualifyingDegreeIds = new() { 12 }
        },
        new Profession
        {
            Id = 109, Title = "Civil Engineer", Field = "Engineering",
            Description = "Designs, builds and maintains infrastructure such as roads, bridges and buildings.",
            SalaryMin = 55000, SalaryMax = 120000, Currency = "USD", Demand = DemandTrend.Stable,
            RequiredSkills = new() { "Structural Design", "AutoCAD", "Project Management" },
            Certifications = new() { "PE License", "PMP" },
            Tags = new() { "engineering", "construction", "infrastructure", "design", "math" },
            QualifyingDegreeIds = new() { 13 }
        }
    };
}
