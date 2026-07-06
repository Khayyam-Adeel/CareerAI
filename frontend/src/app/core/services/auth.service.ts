import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile
} from '../models/auth.models';

const STORAGE_KEY = 'cpai.auth';

interface StoredSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

/**
 * Owns the client-side auth session (JWT + user) backed by localStorage so a refresh
 * doesn't log the user out. Session validity is checked locally against `expiresAt` -
 * the token's real validity is still enforced server-side on every request.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private readonly session = signal<StoredSession | null>(this.readSession());

  readonly currentUser = computed<AuthUser | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);

  token(): string | null {
    return this.session()?.token ?? null;
  }

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, request).pipe(
      tap(result =>
        this.persistSession({ token: result.token, expiresAt: result.expiresAt, user: result.user })
      )
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/auth/me`);
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private persistSession(session: StoredSession): void {
    this.session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private readSession(): StoredSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
