import { Injectable, computed, inject, signal } from '@angular/core';
import { AppError, User, UserListParams } from '@core/models/user.model';
import { UserApiService } from '@core/services/user-api.service';
import { LoggerService } from '@core/services/logger.service';

const DEFAULT_PARAMS: UserListParams = { limit: 10, skip: 0 };

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private readonly api = inject(UserApiService);
  private readonly logger = inject(LoggerService);

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

  createUser(payload: Partial<User>): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.api.createUser(payload).subscribe({
      next: (user) => {
        this._users.update((list) => [user, ...list]);
        this._total.update((t) => t + 1);
        this._isLoading.set(false);
        this.logger.log('createUser success', user);
      },
      error: (err: AppError) => {
        this._error.set(err);
        this._isLoading.set(false);
        this.logger.error('createUser failed', err);
      },
    });
  }

  updateUser(id: number, payload: Partial<User>): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.api.updateUser(id, payload).subscribe({
      next: (updated) => {
        this._users.update((list) => list.map((u) => (u.id === id ? updated : u)));
        if (this._selectedUser()?.id === id) this._selectedUser.set(updated);
        this._isLoading.set(false);
        this.logger.log('updateUser success', updated);
      },
      error: (err: AppError) => {
        this._error.set(err);
        this._isLoading.set(false);
        this.logger.error('updateUser failed', err);
      },
    });
  }

  deleteUser(id: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.api.deleteUser(id).subscribe({
      next: () => {
        this._users.update((list) => list.filter((u) => u.id !== id));
        this._total.update((t) => t - 1);
        this._isLoading.set(false);
        this.logger.log('deleteUser success', { id });
      },
      error: (err: AppError) => {
        this._error.set(err);
        this._isLoading.set(false);
        this.logger.error('deleteUser failed', err);
      },
    });
  }

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
}
