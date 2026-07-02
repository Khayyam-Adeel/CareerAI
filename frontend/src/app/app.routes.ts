import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'explore' },
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
  { path: '**', redirectTo: 'explore' }
];
