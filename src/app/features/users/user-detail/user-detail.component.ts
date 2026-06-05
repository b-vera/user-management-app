import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { UserStoreService } from '@core/store/user-store.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TranslatePipe,
    SkeletonLoaderComponent,
    ErrorStateComponent,
    AvatarComponent,
    BadgeComponent,
  ],
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
          class="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-dark-border overflow-hidden"
        >
          <!-- Gradient banner -->
          <div
            class="h-24 bg-gradient-to-br from-brand-indigo via-indigo-500 to-crimson-600
                   dark:from-indigo-900 dark:via-dark-surface dark:to-dark-bg"
          ></div>

          <!-- Profile content -->
          <div class="px-6 pb-6">
            <div class="-mt-10 flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <!-- Avatar overlapping banner -->
              <div class="shrink-0">
                <app-avatar
                  [name]="user.first_name + ' ' + user.last_name"
                  [size]="80"
                  [showDot]="true"
                  [active]="user.active"
                />
              </div>

              <!-- Name + badges + actions -->
              <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-end gap-4 sm:pt-12">
                <div class="flex-1 min-w-0">
                  <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {{ user.first_name }} {{ user.last_name }}
                  </h1>
                  <p class="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
                    &#64;{{ user.username }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <app-badge [variant]="user.role">
                      {{ 'users.roles.' + user.role | translate }}
                    </app-badge>
                    <app-badge [variant]="user.active ? 'active' : 'inactive'">
                      {{
                        (user.active ? 'users.status.active' : 'users.status.inactive') | translate
                      }}
                    </app-badge>
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
                           border border-crimson-400 text-crimson-600 dark:border-crimson-600 dark:text-crimson-400
                           hover:bg-red-50 dark:hover:bg-crimson-900/20 transition-colors
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
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ 'users.form.fields.firstName' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.first_name }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ 'users.form.fields.lastName' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.last_name }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
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
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ 'users.form.fields.username' | translate }}
                </dt>
                <dd
                  class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5 font-mono"
                >
                  {{ user.username }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ 'users.form.fields.role' | translate }}
                </dt>
                <dd class="mt-0.5">
                  <app-badge [variant]="user.role">
                    {{ 'users.roles.' + user.role | translate }}
                  </app-badge>
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ 'users.detail.createdAt' | translate }}
                </dt>
                <dd class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {{ user.created_at | date: 'dd/MM/yyyy HH:mm' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs text-neutral-500 dark:text-neutral-400">
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
  private readonly confirmDialog = inject(ConfirmDialogService);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id && this.store.selectedUser()?.id !== id) {
      this.store.loadUserById(id);
    }
  }

  onDeactivate(): void {
    const user = this.store.selectedUser();
    if (!user) return;
    this.confirmDialog
      .open({
        title: 'Desactivar usuario',
        message: `El usuario "${user.username}" perderá acceso a la plataforma.`,
        confirmLabel: 'Desactivar',
        danger: false,
      })
      .subscribe((confirmed) => {
        if (confirmed) this.store.deactivateUser(user.id);
      });
  }

  onDelete(): void {
    const user = this.store.selectedUser();
    if (!user) return;
    this.confirmDialog
      .open({
        title: 'Eliminar usuario',
        message: `¿Estás seguro de que deseas eliminar a "${user.username}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.deleteUser(user.id);
          this.router.navigate(['/users']);
        }
      });
  }
}
