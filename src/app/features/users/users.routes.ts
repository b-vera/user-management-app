import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then((m) => m.UserListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'new',
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [authGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./user-detail/user-detail.component').then((m) => m.UserDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./user-form/user-form.component').then((m) => m.UserFormComponent),
    canActivate: [authGuard],
  },
];
