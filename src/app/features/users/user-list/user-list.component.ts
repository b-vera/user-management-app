import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { UserStoreService } from '@core/store/user-store.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { User, UserRole } from '@core/models/user.model';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '@shared/components/error-state/error-state.component';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';

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
    AvatarComponent,
    BadgeComponent,
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
      <!-- Mobile: cards (< md) -->
      <div class="md:hidden space-y-3">
        @for (user of displayedUsers(); track user.id) {
          <div
            class="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-dark-border overflow-hidden"
          >
            <div class="p-4 flex items-start gap-3">
              <!-- Avatar -->
              <app-avatar
                [name]="user.first_name + ' ' + user.last_name"
                [imageUrl]="user.image || ''"
                [size]="40"
              />
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {{ user.username }}
                    </p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {{ user.first_name }} {{ user.last_name }}
                    </p>
                  </div>
                  <!-- View + Edit -->
                  <div class="flex items-center gap-1 shrink-0">
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
                  </div>
                </div>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                  {{ user.email }}
                </p>
                <div class="flex flex-wrap items-center gap-2 mt-2">
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
            </div>
            <!-- Destructive actions footer -->
            <div
              class="flex items-center gap-4 px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
            >
              @if (user.active) {
                <button
                  (click)="onDeactivate(user)"
                  class="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                  [attr.aria-label]="('users.actions.deactivate' | translate) + ' ' + user.username"
                >
                  {{ 'users.actions.deactivate' | translate }}
                </button>
              }
              <button
                (click)="onDelete(user)"
                class="text-xs font-medium text-crimson-600 hover:text-crimson-700 dark:text-crimson-400
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-600 rounded"
                [attr.aria-label]="('users.actions.delete' | translate) + ' ' + user.username"
              >
                {{ 'users.actions.delete' | translate }}
              </button>
            </div>
          </div>
        }

        <!-- Mobile pagination -->
        <div class="flex items-center justify-between py-2">
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

      <!-- Tablet+: table (md+) -->
      <div
        class="hidden md:block bg-white dark:bg-dark-surface rounded-xl shadow-sm overflow-hidden border border-neutral-200 dark:border-dark-border"
      >
        <div class="overflow-x-auto">
          <table
            class="w-full text-sm"
            [attr.aria-label]="'users.list.title' | translate"
            [attr.aria-busy]="store.isLoading() ? 'true' : null"
          >
            <thead
              class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700"
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-10"
                ></th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  {{ 'users.columns.username' | translate }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider hidden lg:table-cell"
                >
                  {{ 'users.columns.email' | translate }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  {{ 'users.columns.role' | translate }}
                </th>
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                >
                  {{ 'users.columns.status' | translate }}
                </th>
                <th
                  scope="col"
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
                    <app-avatar
                      [name]="user.first_name + ' ' + user.last_name"
                      [imageUrl]="user.image || ''"
                      [size]="32"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <p class="font-medium text-neutral-900 dark:text-neutral-100">
                      {{ user.username }}
                    </p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {{ user.first_name }} {{ user.last_name }}
                    </p>
                  </td>
                  <td class="px-4 py-3 hidden lg:table-cell text-neutral-600 dark:text-neutral-300">
                    {{ user.email }}
                  </td>
                  <td class="px-4 py-3">
                    <app-badge [variant]="user.role">
                      {{ 'users.roles.' + user.role | translate }}
                    </app-badge>
                  </td>
                  <td class="px-4 py-3">
                    <app-badge [variant]="user.active ? 'active' : 'inactive'">
                      {{
                        (user.active ? 'users.status.active' : 'users.status.inactive') | translate
                      }}
                    </app-badge>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                      <!-- Ver -->
                      <a
                        [routerLink]="['/users', user.id]"
                        class="relative group p-1.5 rounded-lg text-neutral-500 hover:text-brand-indigo hover:bg-indigo-50
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
                        <span
                          class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded px-2 py-1 text-xs text-white bg-neutral-900 dark:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        >
                          {{ 'users.actions.view' | translate }}
                        </span>
                      </a>

                      <!-- Editar -->
                      <a
                        [routerLink]="['/users', user.id, 'edit']"
                        class="relative group p-1.5 rounded-lg text-neutral-500 hover:text-brand-indigo hover:bg-indigo-50
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
                        <span
                          class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded px-2 py-1 text-xs text-white bg-neutral-900 dark:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        >
                          {{ 'users.actions.edit' | translate }}
                        </span>
                      </a>

                      @if (user.active) {
                        <!-- Desactivar -->
                        <button
                          (click)="onDeactivate(user)"
                          class="relative group p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-amber-50
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
                          <span
                            class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded px-2 py-1 text-xs text-white bg-neutral-900 dark:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                          >
                            {{ 'users.actions.deactivate' | translate }}
                          </span>
                        </button>
                      }

                      <!-- Eliminar -->
                      <button
                        (click)="onDelete(user)"
                        class="relative group p-1.5 rounded-lg text-neutral-500 hover:text-crimson-600 hover:bg-crimson-50
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
                        <span
                          class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded px-2 py-1 text-xs text-white bg-neutral-900 dark:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        >
                          {{ 'users.actions.delete' | translate }}
                        </span>
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
  private readonly confirmDialog = inject(ConfirmDialogService);
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
    this.confirmDialog
      .open({
        title: 'Eliminar usuario',
        message: `¿Estás seguro de que deseas eliminar a "${user.username}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        danger: true,
      })
      .subscribe((confirmed) => {
        if (confirmed) this.store.deleteUser(user.id);
      });
  }

  onDeactivate(user: User): void {
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

  private _fetch(q: string, skip = 0): void {
    const limit = this.store.params().limit;
    if (q.trim()) {
      this.store.searchUsers(q.trim(), { limit, skip });
    } else {
      this.store.loadUsers({ limit, skip });
    }
  }
}
