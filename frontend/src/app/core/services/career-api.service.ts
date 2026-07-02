import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdvisorRequest,
  AdvisorResult,
  CareerComparison,
  Degree,
  OnetOccupationMatch,
  Profession,
  Roadmap
} from '../models/career.models';

/**
 * Single point of contact with the CareerPath AI backend.
 * Components never call HttpClient directly - they go through this service,
 * so the API contract only has to be known in one place on the frontend.
 */
@Injectable({ providedIn: 'root' })
export class CareerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getProfessions(field?: string, keyword?: string): Observable<Profession[]> {
    let params = new HttpParams();
    if (field) params = params.set('field', field);
    if (keyword) params = params.set('keyword', keyword);
    return this.http.get<Profession[]>(`${this.baseUrl}/professions`, { params });
  }

  getProfessionById(id: number): Observable<Profession> {
    return this.http.get<Profession>(`${this.baseUrl}/professions/${id}`);
  }

  compareProfessions(aId: number, bId: number): Observable<CareerComparison> {
    const params = new HttpParams().set('aId', aId).set('bId', bId);
    return this.http.get<CareerComparison>(`${this.baseUrl}/professions/compare`, { params });
  }

  /**
   * Optional live enrichment lookup against O*NET's real occupation database.
   * Returns null (not an error) if O*NET isn't configured on the backend or has no match -
   * callers should treat a null result as "just show the seed data", not as a failure.
   */
  getOnetMatch(professionId: number): Observable<OnetOccupationMatch | null> {
    return this.http.get<OnetOccupationMatch | null>(`${this.baseUrl}/professions/${professionId}/onet-match`);
  }

  getDegrees(): Observable<Degree[]> {
    return this.http.get<Degree[]>(`${this.baseUrl}/degrees`);
  }

  getDegreeById(id: number): Observable<Degree> {
    return this.http.get<Degree>(`${this.baseUrl}/degrees/${id}`);
  }

  getRoadmap(professionId: number, degreeId?: number): Observable<Roadmap> {
    let params = new HttpParams();
    if (degreeId) params = params.set('degreeId', degreeId);
    return this.http.get<Roadmap>(`${this.baseUrl}/roadmap/${professionId}`, { params });
  }

  getAllRoadmapAlternatives(professionId: number): Observable<Roadmap[]> {
    return this.http.get<Roadmap[]>(`${this.baseUrl}/roadmap/${professionId}/alternatives`);
  }

  getAdvisorRecommendations(request: AdvisorRequest): Observable<AdvisorResult> {
    return this.http.post<AdvisorResult>(`${this.baseUrl}/advisor/recommend`, request);
  }
}
