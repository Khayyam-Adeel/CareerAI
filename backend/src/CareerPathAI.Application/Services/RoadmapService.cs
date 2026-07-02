using CareerPathAI.Application.DTOs;
using CareerPathAI.Application.Interfaces;
using CareerPathAI.Domain.Entities;

namespace CareerPathAI.Application.Services;

/// <summary>
/// Builds an ordered, visual-ready roadmap (Matric -> Intermediate -> ... -> Profession)
/// for a given profession, by walking the degree prerequisite chain.
/// </summary>
public class RoadmapService
{
    private readonly IProfessionRepository _professionRepo;
    private readonly IDegreeRepository _degreeRepo;

    public RoadmapService(IProfessionRepository professionRepo, IDegreeRepository degreeRepo)
    {
        _professionRepo = professionRepo;
        _degreeRepo = degreeRepo;
    }

    /// <summary>
    /// Builds the primary roadmap for a profession: picks the first qualifying degree
    /// and walks its prerequisite chain back to the root (Matric-level) degree.
    /// </summary>
    public async Task<RoadmapDto?> BuildRoadmapAsync(int professionId, int? preferredDegreeId = null)
    {
        var profession = await _professionRepo.GetByIdAsync(professionId);
        if (profession is null || profession.QualifyingDegreeIds.Count == 0)
            return null;

        var startDegreeId = preferredDegreeId is not null && profession.QualifyingDegreeIds.Contains(preferredDegreeId.Value)
            ? preferredDegreeId.Value
            : profession.QualifyingDegreeIds[0];

        var startDegree = await _degreeRepo.GetByIdAsync(startDegreeId);
        if (startDegree is null)
            return null;

        var chain = await WalkPrerequisiteChainAsync(startDegree);

        var nodes = new List<RoadmapNodeDto>();
        for (int i = 0; i < chain.Count; i++)
        {
            var degree = chain[i];
            nodes.Add(new RoadmapNodeDto("Degree", degree.Id, degree.Name, degree.Level, i));
        }

        nodes.Add(new RoadmapNodeDto(
            "Profession",
            profession.Id,
            profession.Title,
            null,
            nodes.Count
        ));

        return new RoadmapDto(profession.Id, profession.Title, nodes);
    }

    /// <summary>
    /// Returns ALL alternative degree paths that lead to a profession
    /// (covers "Alternative Pathways" requirement).
    /// </summary>
    public async Task<List<RoadmapDto>> BuildAllRoadmapsAsync(int professionId)
    {
        var profession = await _professionRepo.GetByIdAsync(professionId);
        if (profession is null)
            return new List<RoadmapDto>();

        var results = new List<RoadmapDto>();
        foreach (var degreeId in profession.QualifyingDegreeIds)
        {
            var roadmap = await BuildRoadmapAsync(professionId, degreeId);
            if (roadmap is not null)
                results.Add(roadmap);
        }
        return results;
    }

    /// <summary>
    /// Walks prerequisite chain from a degree back to its root,
    /// guarding against cycles, then returns the chain in root-first order.
    /// </summary>
    private async Task<List<Degree>> WalkPrerequisiteChainAsync(Degree startDegree)
    {
        var chain = new List<Degree>();
        var visited = new HashSet<int>();
        var current = startDegree;

        while (current is not null && visited.Add(current.Id))
        {
            chain.Add(current);

            if (current.PrerequisiteDegreeIds.Count == 0)
                break;

            // Take the first prerequisite as the primary path.
            var prereqId = current.PrerequisiteDegreeIds[0];
            current = await _degreeRepo.GetByIdAsync(prereqId);
        }

        chain.Reverse(); // root (Matric) first, target degree last
        return chain;
    }
}
