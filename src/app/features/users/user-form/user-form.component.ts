import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { UserStoreService } from '@core/store/user-store.service';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { noWhitespace, validRole } from '@shared/validators/user.validators';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, SkeletonLoaderComponent],
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
        {{
          isEditMode
            ? ('users.form.edit.title' | translate)
            : ('users.form.create.title' | translate)
        }}
      </span>
    </nav>

    <!-- Loading (edit mode only) -->
    @if (store.isLoading() && isEditMode) {
      <app-skeleton-loader [rows]="3" />
    } @else {
      <div
        class="bg-white dark:bg-dark-surface rounded-xl border border-neutral-200 dark:border-dark-border"
      >
        <!-- Form header -->
        <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h1 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {{
              isEditMode
                ? ('users.form.edit.title' | translate)
                : ('users.form.create.title' | translate)
            }}
          </h1>
        </div>

        <!-- Form body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First name -->
            <div>
              <label
                for="first_name"
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {{ 'users.form.fields.firstName' | translate }}
                <span class="text-crimson-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="first_name"
                formControlName="first_name"
                type="text"
                [attr.aria-describedby]="fieldError('first_name') ? 'first_name-error' : null"
                [attr.aria-invalid]="fieldError('first_name') ? 'true' : null"
                class="w-full px-3 py-2 text-sm rounded-lg border transition-colors
                       bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                [class.border-crimson-500]="fieldError('first_name')"
                [class.border-neutral-300]="!fieldError('first_name')"
                [class.dark:border-neutral-600]="!fieldError('first_name')"
              />
              @if (fieldError('first_name')) {
                <p id="first_name-error" class="mt-1 text-xs text-crimson-600" role="alert">
                  {{ errorMessage('first_name') }}
                </p>
              }
            </div>

            <!-- Last name -->
            <div>
              <label
                for="last_name"
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {{ 'users.form.fields.lastName' | translate }}
                <span class="text-crimson-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="last_name"
                formControlName="last_name"
                type="text"
                [attr.aria-describedby]="fieldError('last_name') ? 'last_name-error' : null"
                [attr.aria-invalid]="fieldError('last_name') ? 'true' : null"
                class="w-full px-3 py-2 text-sm rounded-lg border transition-colors
                       bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                [class.border-crimson-500]="fieldError('last_name')"
                [class.border-neutral-300]="!fieldError('last_name')"
                [class.dark:border-neutral-600]="!fieldError('last_name')"
              />
              @if (fieldError('last_name')) {
                <p id="last_name-error" class="mt-1 text-xs text-crimson-600" role="alert">
                  {{ errorMessage('last_name') }}
                </p>
              }
            </div>

            <!-- Username -->
            <div>
              <label
                for="username"
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {{ 'users.form.fields.username' | translate }}
                <span class="text-crimson-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="username"
                formControlName="username"
                type="text"
                autocomplete="username"
                [attr.aria-describedby]="fieldError('username') ? 'username-error' : null"
                [attr.aria-invalid]="fieldError('username') ? 'true' : null"
                class="w-full px-3 py-2 text-sm rounded-lg border transition-colors font-mono
                       bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                [class.border-crimson-500]="fieldError('username')"
                [class.border-neutral-300]="!fieldError('username')"
                [class.dark:border-neutral-600]="!fieldError('username')"
              />
              @if (fieldError('username')) {
                <p id="username-error" class="mt-1 text-xs text-crimson-600" role="alert">
                  {{ errorMessage('username') }}
                </p>
              }
            </div>

            <!-- Email -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {{ 'users.form.fields.email' | translate }}
                <span class="text-crimson-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                formControlName="email"
                type="email"
                autocomplete="email"
                [attr.aria-describedby]="fieldError('email') ? 'email-error' : null"
                [attr.aria-invalid]="fieldError('email') ? 'true' : null"
                class="w-full px-3 py-2 text-sm rounded-lg border transition-colors
                       bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                [class.border-crimson-500]="fieldError('email')"
                [class.border-neutral-300]="!fieldError('email')"
                [class.dark:border-neutral-600]="!fieldError('email')"
              />
              @if (fieldError('email')) {
                <p id="email-error" class="mt-1 text-xs text-crimson-600" role="alert">
                  {{ errorMessage('email') }}
                </p>
              }
            </div>

            <!-- Role -->
            <div class="md:col-span-2 sm:col-span-1 md:w-1/2">
              <label
                for="role"
                class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                {{ 'users.form.fields.role' | translate }}
                <span class="text-crimson-600 ml-0.5" aria-hidden="true">*</span>
              </label>
              <select
                id="role"
                formControlName="role"
                [attr.aria-describedby]="fieldError('role') ? 'role-error' : null"
                [attr.aria-invalid]="fieldError('role') ? 'true' : null"
                class="w-full px-3 py-2 text-sm rounded-lg border transition-colors
                       bg-white dark:bg-dark-surface text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                [class.border-crimson-500]="fieldError('role')"
                [class.border-neutral-300]="!fieldError('role')"
                [class.dark:border-neutral-600]="!fieldError('role')"
              >
                <option value="">— {{ 'users.form.fields.role' | translate }} —</option>
                <option value="admin">{{ 'users.roles.admin' | translate }}</option>
                <option value="user">{{ 'users.roles.user' | translate }}</option>
                <option value="guest">{{ 'users.roles.guest' | translate }}</option>
              </select>
              @if (fieldError('role')) {
                <p id="role-error" class="mt-1 text-xs text-crimson-600" role="alert">
                  {{ errorMessage('role') }}
                </p>
              }
            </div>
          </div>

          <!-- Form-level error -->
          @if (store.hasError()) {
            <div
              class="mt-4 p-3 rounded-lg bg-crimson-50 dark:bg-crimson-900/20 border border-crimson-200 dark:border-crimson-800"
              role="alert"
            >
              <p class="text-sm text-crimson-700 dark:text-crimson-300">
                {{ store.error()?.message | translate }}
              </p>
            </div>
          }

          <!-- Actions -->
          <div
            class="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700"
          >
            <a
              routerLink="/users"
              class="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600
                     text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800
                     transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            >
              {{ 'common.actions.cancel' | translate }}
            </a>
            <button
              type="submit"
              [disabled]="form.invalid || store.isLoading()"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-indigo
                     hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-brand-indigo focus-visible:ring-offset-2"
              [attr.aria-disabled]="form.invalid || store.isLoading()"
            >
              @if (store.isLoading()) {
                <span class="inline-flex items-center gap-2">
                  <svg
                    class="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {{ 'common.states.loading' | translate }}
                </span>
              } @else {
                {{
                  isEditMode
                    ? ('users.form.edit.submit' | translate)
                    : ('users.form.create.submit' | translate)
                }}
              }
            </button>
          </div>
        </form>
      </div>
    }
  `,
})
export class UserFormComponent implements OnInit {
  readonly store = inject(UserStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  isEditMode = false;
  private userId: number | null = null;

  readonly form = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3), noWhitespace]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required, validRole]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!id;
    this.userId = id ? Number(id) : null;

    if (this.isEditMode && this.userId) {
      this.store.loadUserById(this.userId);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      first_name: raw.first_name ?? '',
      last_name: raw.last_name ?? '',
      username: raw.username ?? '',
      email: raw.email ?? '',
      role: (raw.role as 'admin' | 'user' | 'guest') || 'user',
    };
    this.store.createUser(payload);
    this.router.navigate(['/users']);
  }

  fieldError(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  errorMessage(name: string): string {
    const ctrl = this.form.get(name) as AbstractControl;
    if (ctrl?.errors?.['required']) return this.t('users.form.validation.required');
    if (ctrl?.errors?.['email']) return this.t('users.form.validation.email');
    if (ctrl?.errors?.['minlength'])
      return this.t('users.form.validation.minLength').replace('{{min}}', '3');
    if (ctrl?.errors?.['noWhitespace']) return this.t('users.form.validation.noSpaces');
    if (ctrl?.errors?.['roleInvalid']) return this.t('users.form.validation.roleInvalid');
    return '';
  }

  // Inline translation fallback — replaced by TranslateService in full i18n pass
  private readonly translations: Record<string, string> = {
    'users.form.validation.required': 'Este campo es obligatorio',
    'users.form.validation.email': 'Ingresa un correo electrónico válido',
    'users.form.validation.minLength': 'Mínimo {{min}} caracteres',
    'users.form.validation.noSpaces': 'El nombre de usuario no puede contener espacios',
    'users.form.validation.roleInvalid': 'Selecciona un rol válido',
  };

  private t(key: string): string {
    return this.translations[key] ?? key;
  }
}
