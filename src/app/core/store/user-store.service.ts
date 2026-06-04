import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AppError, User, UserListParams } from '@core/models/user.model';
import { UserApiService } from '@core/services/user-api.service';
import { LoggerService } from '@core/services/logger.service';
import { ToastService } from '@core/services/toast.service';

const DEFAULT_PARAMS: UserListParams = { limit: 10, skip: 0 };

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private readonly api = inject(UserApiService);
  private readonly logger = inject(LoggerService);
  private readonly toast = inject(ToastService);

  // Private writable signals
  private readonly _users = signal<User[]>([]);
  private readonly _selectedUser = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<AppError | null>(null);
  private readonly _total = signal(0);
  private readonly _params = signal<UserListParams>(DEFAULT_PARAMS);

  // Public readonly signals
  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = this._total.asReadonly();
  readonly params = this._params.asReadonly();

  // Computed selectors
  readonly isEmpty = computed(() => this._users().length === 0 && !this._isLoading());
  readonly hasError = computed(() => this._error() !== null);

  readonly pagination = computed(() => {
    const { limit, skip } = this._params();
    const total = this._total();
    const currentPage = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    return { currentPage, totalPages, limit, total };
  });

  // ── Read operations ────────────────────────────────────────────────────────

  loadUsers(params: UserListParams = DEFAULT_PARAMS): void {
    this._params.set(params);
    this._isLoading.set(true);
    this._error.set(null);

    this.api.getUsers(params).subscribe({
      next: (res) => {
        this._users.set(res.users);
        this._total.set(res.total);
        this._isLoading.set(false);
        this.logger.log('loadUsers success', { count: res.users.length, total: res.total });
      },
      error: (err: AppError) => {
        this._error.set(err);
        this._isLoading.set(false);
        this.logger.error('loadUsers failed', err);
      },
    });
  }

  searchUsers(q: string, params: UserListParams = DEFAULT_PARAMS): void {
    this._params.set(params);
    this._isLoading.set(true);
    this._error.set(null);

    this.api.searchUsers(q, params).subscribe({
      next: (res) => {
        this._users.set(res.users);
        this._total.set(res.total);
        this._isLoading.set(false);
      },
      error: (err: AppError) => {
        this._error.set(err);
        this._isLoading.set(false);
        this.logger.error('searchUsers failed', err);
      },
    });
  }

  loadUserById(id: number): void {
    this._isLoading.set(true);
    this._error.set(null);
    this._selectedUser.set(null);

    this.api.getUserById(id).subscribe({
      next: (user) => {
        this._selectedUser.set(user);
        this._isLoading.set(false);
      },
      error: (err: AppError) => {
        this._error.set(err);
        this._isLoading.set(false);
        this.logger.error('loadUserById failed', err);
      },
    });
  }

  // ── Write operations with optimistic updates ───────────────────────────────

  createUser(payload: Partial<User>): void {
    this._error.set(null);

    this.api.createUser(payload).subscribe({
      next: (user) => {
        this._users.update((list) => [user, ...list]);
        this._total.update((t) => t + 1);
        this.logger.log('createUser success', user);
        this.toast.success('common.toast.created');
      },
      error: (err: AppError) => {
        this._error.set(err);
        this.logger.error('createUser failed', err);
        this.toast.error(err.message);
      },
    });
  }

  updateUser(id: number, payload: Partial<User>): void {
    const usersSnapshot = this._users();
    const selectedSnapshot = this._selectedUser();

    // Optimistic: apply patch immediately
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, ...payload } : u)));
    if (this._selectedUser()?.id === id) {
      this._selectedUser.update((u) => (u ? { ...u, ...payload } : null));
    }

    this._optimistic(this.api.updateUser(id, payload), {
      onSuccess: (updated) => {
        // Replace optimistic data with confirmed server response
        this._users.update((list) => list.map((u) => (u.id === id ? updated : u)));
        if (this._selectedUser()?.id === id) this._selectedUser.set(updated);
        this.logger.log('updateUser confirmed', updated);
        this.toast.success('common.toast.updated');
      },
      onError: (err) => {
        this._users.set(usersSnapshot);
        this._selectedUser.set(selectedSnapshot);
        this.logger.error('updateUser rollback', err);
        this.toast.error(err.message);
      },
    });
  }

  deleteUser(id: number): void {
    const usersSnapshot = this._users();
    const totalSnapshot = this._total();

    // Optimistic: remove immediately
    this._users.update((list) => list.filter((u) => u.id !== id));
    this._total.update((t) => t - 1);

    this._optimistic(this.api.deleteUser(id), {
      onSuccess: () => {
        this.logger.log('deleteUser confirmed', { id });
        this.toast.success('common.toast.deleted');
      },
      onError: (err) => {
        this._users.set(usersSnapshot);
        this._total.set(totalSnapshot);
        this.logger.error('deleteUser rollback', err);
        this.toast.error(err.message);
      },
    });
  }

  deactivateUser(id: number): void {
    const usersSnapshot = this._users();
    const selectedSnapshot = this._selectedUser();

    // Optimistic: set active = false immediately
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, active: false } : u)));
    if (this._selectedUser()?.id === id) {
      this._selectedUser.update((u) => (u ? { ...u, active: false } : null));
    }

    this._optimistic(this.api.updateUser(id, { active: false }), {
      onSuccess: (updated) => {
        this._users.update((list) => list.map((u) => (u.id === id ? updated : u)));
        if (this._selectedUser()?.id === id) this._selectedUser.set(updated);
        this.logger.log('deactivateUser confirmed', { id });
        this.toast.success('common.toast.deactivated');
      },
      onError: (err) => {
        this._users.set(usersSnapshot);
        this._selectedUser.set(selectedSnapshot);
        this.logger.error('deactivateUser rollback', err);
        this.toast.error(err.message);
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  setParams(params: Partial<UserListParams>): void {
    this._params.update((current) => ({ ...current, ...params }));
  }

  reset(): void {
    this._users.set([]);
    this._selectedUser.set(null);
    this._isLoading.set(false);
    this._error.set(null);
    this._total.set(0);
    this._params.set(DEFAULT_PARAMS);
  }

  // Shared optimistic-update runner: fires the API call and routes to callbacks.
  // The caller is responsible for applying the optimistic mutation before invoking this.
  private _optimistic<T>(
    apiCall$: Observable<T>,
    handlers: { onSuccess: (result: T) => void; onError: (err: AppError) => void },
  ): void {
    this._error.set(null);

    apiCall$.subscribe({
      next: (result) => handlers.onSuccess(result),
      error: (err: AppError) => {
        this._error.set(err);
        handlers.onError(err);
      },
    });
  }
}
