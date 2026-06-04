import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { UserStoreService } from '@core/store/user-store.service';
import { User, UserRole } from '@core/models/user.model';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslatePipe,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <!-- Page header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {{ 'users.list.title' | translate }}
      </h1>
      <a
        routerLink="/users/new"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
               bg-brand-indigo rounded-lg hover:bg-indigo-900 transition-colors
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ 'users.list.createNew' | translate }}
      </a>
    </div>

    <!-- Search + Filters bar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <!-- Search -->
      <div class="relative flex-1" role="search">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
          />
        </svg>
        <input
          [formControl]="searchControl"
          type="search"
          [attr.placeholder]="'users.list.search' | translate"
          [attr.aria-label]="'users.list.search' | translate"
          class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600
                 bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
                 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        />
      </div>

      <!-- Role filter -->
      <select
        [value]="filterRole()"
        (change)="onRoleFilter($any($event.target).value)"
        [attr.aria-label]="'users.columns.role' | translate"
        class="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600
               bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
               focus:outline-none focus:ring-2 focus:ring-brand-indigo"
      >
        <option value="">{{ 'users.roles.all' | translate }}</option>
        <option value="admin">{{ 'users.roles.admin' | translate }}</option>
        <option value="user">{{ 'users.roles.user' | translate }}</option>
        <option value="guest">{{ 'users.roles.guest' | translate }}</option>
      </select>

      <!-- Active filter -->
      <select
        (change)="onActiveFilter($any($event.target).value)"
        [attr.aria-label]="'users.columns.status' | translate"
        class="px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600
               bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
               focus:outline-none focus:ring-2 focus:ring-brand-indigo"
      >
        <option value="">{{ 'users.status.all' | translate }}</option>
        <option value="true">{{ 'users.status.active' | translate }}</option>
        <option value="false">{{ 'users.status.inactive' | translate }}</option>
      </select>
    </div>

    <!-- Active filter chips -->
    @if (hasActiveFilters()) {
      <div class="flex flex-wrap gap-2 mb-4">
        @if (searchControl.value) {
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                       bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20"
          >
            "{{ searchControl.value }}"
            <button
              (click)="clearSearch()"
              class="hover:text-crimson-600 focus-visible:outline-none"
              [attr.aria-label]="'Limpiar búsqueda'"
            >
              ✕
            </button>
          </span>
        }
        @if (filterRole()) {
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                       bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20"
          >
            {{ 'users.roles.' + filterRole() | translate }}
            <button
              (click)="onRoleFilter('')"
              class="hover:text-crimson-600 focus-visible:outline-none"
              aria-label="Limpiar filtro de rol"
            >
              ✕
            </button>
          </span>
        }
        @if (filterActive() !== null) {
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                       bg-brand-indigo/10 text-brand-indigo dark:bg-brand-indigo/20"
          >
            {{
              filterActive()
                ? ('users.status.active' | translate)
                : ('users.status.inactive' | translate)
            }}
            <button
              (click)="onActiveFilter('')"
              class="hover:text-crimson-600 focus-visible:outline-none"
              aria-label="Limpiar filtro de estado"
            >
              ✕
            </button>
          </span>
        }
        <button
          (click)="clearAllFilters()"
          class="text-xs text-neutral-500 hover:text-crimson-600 underline focus-visible:outline-none"
        >
          Limpiar todo
        </button>
      </div>
    }

    <!-- Loading -->
    @if (store.isLoading()) {
      <app-skeleton-loader [rows]="10" />
    }

    <!-- Error -->
    @else if (store.hasError()) {
      <app-error-state
        [message]="store.error()?.message ?? 'common.errors.unknown'"
        (retry)="load()"
      />
    }

    <!-- Empty -->
    @else if (displayedUsers().length === 0) {
      <app-empty-state
        [title]="'users.list.empty' | translate"
        [description]="'users.list.emptyDescription' | translate"
        [actionLabel]="hasActiveFilters() ? '' : ('users.list.createNew' | translate)"
        (action)="router.navigate(['/users/new'])"
      />
    }

    <!-- Data -->
    @else {
      <div
        class="bg-white dark:bg-dark-surface rounded-xl shadow-sm overflow-hidden border border-neutral-200 dark:border-dark-border"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-sm" [attr.aria-label]="'users.list.title' | translate">
            <thead
              class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700"
            >
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-10"
                ></th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  {{ 'users.columns.username' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden md:table-cell"
                >
                  {{ 'users.columns.email' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden sm:table-cell"
                >
                  {{ 'users.columns.role' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden sm:table-cell"
                >
                  {{ 'users.columns.status' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  {{ 'users.columns.actions' | translate }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-700">
              @for (user of displayedUsers(); track user.id) {
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td class="px-4 py-3">
                    @if (user.image) {
                      <img
                        [src]="user.image"
                        [alt]="user.first_name + ' ' + user.last_name"
                        class="w-8 h-8 rounded-full object-cover"
                      />
                    } @else {
                      <div
                        class="w-8 h-8 rounded-full bg-brand-indigo flex items-center justify-center text-white text-xs font-semibold"
                      >
                        {{ initials(user) }}
                      </div>
                    }
                  </td>
                  <td class="px-4 py-3">
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">
                      {{ user.username }}
                    </p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {{ user.first_name }} {{ user.last_name }}
                    </p>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell text-neutral-600 dark:text-neutral-300">
                    {{ user.email }}
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span [class]="roleBadge(user.role)">
                      {{ 'users.roles.' + user.role | translate }}
                    </span>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span [class]="statusBadge(user.active)">
                      {{
                        (user.active ? 'users.status.active' : 'users.status.inactive') | translate
                      }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <a
                        [routerLink]="['/users', user.id]"
                        class="p-1.5 rounded-lg text-neutral-500 hover:text-brand-indigo hover:bg-indigo-50
                               dark:hover:bg-indigo-900/20 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
                        [attr.aria-label]="('users.actions.view' | translate) + ' ' + user.username"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </a>
                      <a
                        [routerLink]="['/users', user.id, 'edit']"
                        class="p-1.5 rounded-lg text-neutral-500 hover:text-brand-indigo hover:bg-indigo-50
                               dark:hover:bg-indigo-900/20 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
                        [attr.aria-label]="('users.actions.edit' | translate) + ' ' + user.username"
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
                      </a>
                      @if (user.active) {
                        <button
                          (click)="onDeactivate(user)"
                          class="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-amber-50
                                 dark:hover:bg-amber-900/20 transition-colors
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          [attr.aria-label]="
                            ('users.actions.deactivate' | translate) + ' ' + user.username
                          "
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
                        </button>
                      }
                      <button
                        (click)="onDelete(user)"
                        class="p-1.5 rounded-lg text-neutral-500 hover:text-crimson-600 hover:bg-crimson-50
                               dark:hover:bg-crimson-900/20 transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-600"
                        [attr.aria-label]="
                          ('users.actions.delete' | translate) + ' ' + user.username
                        "
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
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700"
        >
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            {{
              'common.pagination.page'
                | translate
                  : {
                      current: store.pagination().currentPage,
                      total: store.pagination().totalPages,
                    }
            }}
          </p>
          <div class="flex gap-2">
            <button
              (click)="prevPage()"
              [disabled]="store.pagination().currentPage <= 1"
              class="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600
                     text-neutral-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            >
              {{ 'common.pagination.previous' | translate }}
            </button>
            <button
              (click)="nextPage()"
              [disabled]="store.pagination().currentPage >= store.pagination().totalPages"
              class="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600
                     text-neutral-700 dark:text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            >
              {{ 'common.pagination.next' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserListComponent implements OnInit, OnDestroy {
  readonly store = inject(UserStoreService);
  readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly destroy$ = new Subject<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly filterRole = signal<UserRole | ''>('');
  readonly filterActive = signal<boolean | null>(null);

  // Client-side filter applied on top of server results
  readonly displayedUsers = computed(() => {
    let users = this.store.users();
    const role = this.filterRole();
    const active = this.filterActive();
    if (role) users = users.filter((u) => u.role === role);
    if (active !== null) users = users.filter((u) => u.active === active);
    return users;
  });

  readonly hasActiveFilters = computed(
    () => !!this.searchControl.value || !!this.filterRole() || this.filterActive() !== null,
  );

  ngOnInit(): void {
    this.load();
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => this._fetch(q));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.store.loadUsers({ limit: 10, skip: 0 });
  }

  prevPage(): void {
    const { currentPage, limit } = this.store.pagination();
    if (currentPage <= 1) return;
    this._fetch(this.searchControl.value, (currentPage - 2) * limit);
  }

  nextPage(): void {
    const { currentPage, totalPages, limit } = this.store.pagination();
    if (currentPage >= totalPages) return;
    this._fetch(this.searchControl.value, currentPage * limit);
  }

  onRoleFilter(role: UserRole | ''): void {
    this.filterRole.set(role);
  }

  onActiveFilter(value: string): void {
    this.filterActive.set(value === '' ? null : value === 'true');
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  clearAllFilters(): void {
    this.searchControl.setValue('');
    this.filterRole.set('');
    this.filterActive.set(null);
  }

  onDelete(user: User): void {
    const data: ConfirmDialogData = {
      title: `Eliminar usuario`,
      message: `¿Estás seguro de que deseas eliminar a "${user.username}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    };
    this.dialog.open<boolean>(ConfirmDialogComponent, { data }).closed.subscribe((result) => {
      if (result) this.store.deleteUser(user.id);
    });
  }

  onDeactivate(user: User): void {
    const data: ConfirmDialogData = {
      title: `Desactivar usuario`,
      message: `El usuario "${user.username}" perderá acceso a la plataforma.`,
      confirmLabel: 'Desactivar',
      danger: false,
    };
    this.dialog.open<boolean>(ConfirmDialogComponent, { data }).closed.subscribe((result) => {
      if (result) this.store.deactivateUser(user.id);
    });
  }

  initials(user: User): string {
    return `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  }

  roleBadge(role: string): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    const colors: Record<string, string> = {
      admin: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      user: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      guest: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    };
    return `${base} ${colors[role] ?? colors['guest']}`;
  }

  statusBadge(active: boolean): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    return active
      ? `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`
      : `${base} bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400`;
  }

  private _fetch(q: string, skip = 0): void {
    const limit = this.store.params().limit;
    if (q.trim()) {
      this.store.searchUsers(q.trim(), { limit, skip });
    } else {
      this.store.loadUsers({ limit, skip });
    }
  }
}
