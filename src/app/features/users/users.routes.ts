import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { Component } from '@angular/core';

// Placeholders for T16 and T17 — replaced when those tasks are implemented
@Component({
  standalone: true,
  template: `<p class="text-neutral-500 p-6">Detalle de usuario — próximamente (T16)</p>`,
})
class UserDetailPlaceholder {}

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
  { path: ':id', component: UserDetailPlaceholder, canActivate: [authGuard] },
  { path: ':id/edit', component: UserFormPlaceholder, canActivate: [authGuard] },
];
