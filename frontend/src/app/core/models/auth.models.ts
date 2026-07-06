// These interfaces mirror CareerPathAI.Application.DTOs.AuthDtos on the backend 1:1.
// Keep them in sync if the backend auth DTOs change shape.

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLoginAt: string | null;
}
