import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

// Components imported here as placeholders — replaced in T14, T16, T17
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `<p class="text-neutral-500">Lista de usuarios — próximamente (T14)</p>`,
})
class UserListPlaceholder {}

@Component({
  standalone: true,
  template: `<p class="text-neutral-500">Detalle de usuario — próximamente (T16)</p>`,
})
class UserDetailPlaceholder {}

@Component({
  standalone: true,
  template: `<p class="text-neutral-500">Formulario de usuario — próximamente (T17)</p>`,
})
class UserFormPlaceholder {}

export const usersRoutes: Routes = [
  { path: '', component: UserListPlaceholder, canActivate: [authGuard] },
  { path: 'new', component: UserFormPlaceholder, canActivate: [authGuard] },
  { path: ':id', component: UserDetailPlaceholder, canActivate: [authGuard] },
  { path: ':id/edit', component: UserFormPlaceholder, canActivate: [authGuard] },
];
