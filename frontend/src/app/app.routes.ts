import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./features/career-explorer/career-explorer.component').then(m => m.CareerExplorerComponent)
  },
  {
    path: 'roadmap/:professionId',
    loadComponent: () =>
      import('./features/roadmap-viewer/roadmap-viewer.component').then(m => m.RoadmapViewerComponent)
  },
  {
    path: 'advisor',
    loadComponent: () =>
      import('./features/ai-advisor/ai-advisor.component').then(m => m.AiAdvisorComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { path: '**', redirectTo: 'explore' }
];
