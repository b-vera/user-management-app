import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { Component } from '@angular/core';

// Placeholder for T17 — replaced when UserFormComponent is implemented
@Component({
  standalone: true,
  template: `<p class="text-neutral-500 p-6">Formulario de usuario — próximamente (T17)</p>`,
})
class UserFormPlaceholder {}

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-list/user-list.component').then((m) => m.UserListComponent),
    canActivate: [authGuard],
  },
  { path: 'new', component: UserFormPlaceholder, canActivate: [authGuard] },
  {
    path: ':id',
    loadComponent: () =>
      import('./user-detail/user-detail.component').then((m) => m.UserDetailComponent),
    canActivate: [authGuard],
  },
  { path: ':id/edit', component: UserFormPlaceholder, canActivate: [authGuard] },
];
