// These interfaces mirror CareerPathAI.Application.DTOs on the backend 1:1.
// Keep them in sync if backend DTOs change shape.

export enum DemandTrend {
  Declining = 0,
  Stable = 1,
  Growing = 2,
  HighGrowth = 3
}

export enum EducationLevel {
  Matric = 0,
  Intermediate = 1,
  AssociateDegree = 2,
  Bachelor = 3,
  Master = 4,
  PhD = 5
}

export const DEMAND_LABELS: Record<DemandTrend, string> = {
  [DemandTrend.Declining]: 'Declining',
  [DemandTrend.Stable]: 'Stable',
  [DemandTrend.Growing]: 'Growing',
  [DemandTrend.HighGrowth]: 'High Growth'
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  [EducationLevel.Matric]: 'Matric',
  [EducationLevel.Intermediate]: 'Intermediate',
  [EducationLevel.AssociateDegree]: 'Associate Degree',
  [EducationLevel.Bachelor]: "Bachelor's",
  [EducationLevel.Master]: "Master's",
  [EducationLevel.PhD]: 'PhD'
};

export interface Profession {
  id: number;
  title: string;
  description: string;
  field: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  demand: DemandTrend;
  requiredSkills: string[];
  certifications: string[];
  tags: string[];
}

export interface Degree {
  id: number;
  name: string;
  level: EducationLevel;
  field: string;
  description: string;
  durationInYears: number;
  subjects: string[];
  eligibilityRequirements: string[];
}

export interface RoadmapNode {
  nodeType: 'Degree' | 'Profession';
  refId: number;
  title: string;
  level: EducationLevel | null;
  order: number;
}

export interface Roadmap {
  professionId: number;
  professionTitle: string;
  nodes: RoadmapNode[];
}

export interface CareerComparison {
  professionA: Profession;
  professionB: Profession;
}

export interface AdvisorRequest {
  interests: string[];
  favoriteSubjects: string[];
  skills: string[];
  goal: string | null;
}

export interface AdvisorRecommendation {
  profession: Profession;
  matchScore: number;
  matchedOn: string[];
  aiExplanation: string | null;
}

export interface AdvisorResult {
  recommendedProfessions: AdvisorRecommendation[];
}

export interface OnetOccupationMatch {
  onetSocCode: string;
  title: string;
  description: string | null;
}
