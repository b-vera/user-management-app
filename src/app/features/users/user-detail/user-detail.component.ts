import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { UserStoreService } from '@core/store/user-store.service';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TranslatePipe, SkeletonLoaderComponent, ErrorStateComponent],
  template: `
    <!-- Breadcrumb -->
    <nav
      class="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-6"
      aria-label="Breadcrumb"
    >
      <a
        routerLink="/users"
        class="hover:text-brand-indigo transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo rounded"
      >
        {{ 'nav.users' | translate }}
      </a>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-neutral-900 dark:text-neutral-100 font-medium">
        {{ store.selectedUser()?.username ?? '...' }}
      </span>
    </nav>

    <!-- Loading -->
    @if (store.isLoading()) {
      <app-skeleton-loader [rows]="3" />
    }

    <!-- Error / Not found -->
    @else if (store.hasError() || !store.selectedUser()) {
      <app-error-state
        [message]="store.error()?.message ?? 'users.detail.notFound'"
        (retry)="load()"
      />
    }

    <!-- Profile -->
    @else {
      @let user = store.selectedUser()!;

      <div class="space-y-6">
        <!-- Header card -->
        <div
          class="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-dark-border p-6"
        >
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <!-- Avatar -->
            @if (user.image) {
              <img
                [src]="user.image"
                [alt]="user.first_name + ' ' + user.last_name"
                class="w-20 h-20 rounded-full object-cover ring-4 ring-brand-indigo/20 shrink-0"
              />
            } @else {
              <div
                class="w-20 h-20 rounded-full bg-brand-indigo flex items-center justify-center
                          text-white text-2xl font-bold ring-4 ring-brand-indigo/20 shrink-0"
              >
                {{ initials() }}
              </div>
            }

            <!-- Name + badges -->
            <div class="flex-1 min-w-0">
              <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {{ user.first_name }} {{ user.last_name }}
              </h1>
              <p class="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
                &#64;{{ user.username }}
              </p>
              <div class="flex flex-wrap gap-2 mt-3">
                <span [class]="roleBadge(user.role)">
                  {{ 'users.roles.' + user.role | translate }}
                </span>
                <span [class]="statusBadge(user.active)">
                  {{ (user.active ? 'users.status.active' : 'users.status.inactive') | translate }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2 shrink-0">
              <a
                [routerLink]="['/users', user.id, 'edit']"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                       bg-brand-indigo text-white hover:bg-indigo-900 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2"
                [attr.aria-label]="'users.actions.edit' | translate"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {{ 'users.actions.edit' | translate }}
              </a>

              @if (user.active) {
                <button
                  (click)="onDeactivate()"
                  class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                         border border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400
                         hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  [attr.aria-label]="'users.actions.deactivate' | translate"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  {{ 'users.actions.deactivate' | translate }}
                </button>
              }

              <button
                (click)="onDelete()"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg
                       border border-crimson-300 text-crimson-600 dark:border-crimson-600 dark:text-crimson-400
                       hover:bg-crimson-50 dark:hover:bg-crimson-900/20 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-600"
                [attr.aria-label]="'users.actions.delete' | translate"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {{ 'users.actions.delete' | translate }}
              </button>
            </div>
          </div>
        </div>

        <!-- Info sections -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Personal info -->
          <div
            class="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-dark-border p-6"
          >
            <h2
              class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4"
            >
              {{ 'users.detail.personalInfo' | translate }}
            </h2>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.form.fields.firstName' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.first_name }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.form.fields.lastName' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.last_name }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.form.fields.email' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  <a
                    [href]="'mailto:' + user.email"
                    class="hover:text-brand-indigo transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo rounded"
                  >
                    {{ user.email }}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Account + Activity -->
          <div
            class="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-dark-border p-6"
          >
            <h2
              class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4"
            >
              {{ 'users.detail.account' | translate }}
            </h2>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.form.fields.username' | translate }}
                </dt>
                <dd
                  class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5 font-mono"
                >
                  {{ user.username }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.form.fields.role' | translate }}
                </dt>
                <dd class="mt-0.5">
                  <span [class]="roleBadge(user.role)">{{
                    'users.roles.' + user.role | translate
                  }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.detail.createdAt' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.created_at | date: 'dd/MM/yyyy HH:mm' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-400 dark:text-neutral-500">
                  {{ 'users.detail.updatedAt' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.updated_at | date: 'dd/MM/yyyy HH:mm' }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Back link -->
        <div>
          <a
            routerLink="/users"
            class="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400
                   hover:text-brand-indigo transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo rounded"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {{ 'users.actions.back' | translate }}
          </a>
        </div>
      </div>
    }
  `,
})
export class UserDetailComponent implements OnInit {
  readonly store = inject(UserStoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.store.loadUserById(id);
  }

  onDeactivate(): void {
    const user = this.store.selectedUser();
    if (!user) return;
    const data: ConfirmDialogData = {
      title: 'Desactivar usuario',
      message: `El usuario "${user.username}" perderá acceso a la plataforma.`,
      confirmLabel: 'Desactivar',
      danger: false,
    };
    this.dialog.open<boolean>(ConfirmDialogComponent, { data }).closed.subscribe((result) => {
      if (result) this.store.deactivateUser(user.id);
    });
  }

  onDelete(): void {
    const user = this.store.selectedUser();
    if (!user) return;
    const data: ConfirmDialogData = {
      title: 'Eliminar usuario',
      message: `¿Estás seguro de que deseas eliminar a "${user.username}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    };
    this.dialog.open<boolean>(ConfirmDialogComponent, { data }).closed.subscribe((result) => {
      if (result) {
        this.store.deleteUser(user.id);
        this.router.navigate(['/users']);
      }
    });
  }

  initials(): string {
    const u = this.store.selectedUser();
    if (!u) return '';
    return `${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`.toUpperCase();
  }

  roleBadge(role: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colors: Record<string, string> = {
      admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      guest: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    };
    return `${base} ${colors[role] ?? colors['guest']}`;
  }

  statusBadge(active: boolean): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    return active
      ? `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`
      : `${base} bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400`;
  }
}
