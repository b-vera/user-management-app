import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';

import { UserStoreService } from './user-store.service';
import { UserApiService } from '@core/services/user-api.service';
import { ToastService } from '@core/services/toast.service';
import { LoggerService } from '@core/services/logger.service';
import { AppError, User, UserListResponse } from '@core/models/user.model';

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'user',
    active: true,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T01:00:00.000Z',
    ...overrides,
  };
}

function mockListResponse(users: User[]): UserListResponse {
  return { users, total: users.length, skip: 0, limit: 10 };
}

function mockAppError(status = 500): AppError {
  return { status, message: 'error.server', timestamp: new Date().toISOString() };
}

describe('UserStoreService', () => {
  let store: UserStoreService;
  let apiSpy: jasmine.SpyObj<UserApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('UserApiService', [
      'getUsers',
      'searchUsers',
      'getUserById',
      'createUser',
      'updateUser',
      'deleteUser',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: UserApiService, useValue: apiSpy },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['success', 'error', 'info']),
        },
        {
          provide: LoggerService,
          useValue: jasmine.createSpyObj('LoggerService', ['log', 'warn', 'error', 'debug']),
        },
      ],
    });

    store = TestBed.inject(UserStoreService);
  });

  it('loadUsers() populates users signal and sets isLoading to false on success', () => {
    const users = [mockUser({ id: 1 }), mockUser({ id: 2, username: 'janedoe' })];
    apiSpy.getUsers.and.returnValue(of(mockListResponse(users)));

    store.loadUsers({ limit: 10, skip: 0 });

    expect(store.users().length).toBe(2);
    expect(store.users()[0].id).toBe(1);
    expect(store.users()[1].username).toBe('janedoe');
    expect(store.total()).toBe(2);
    expect(store.isLoading()).toBeFalse();
    expect(store.hasError()).toBeFalse();
  });

  it('isLoading is true while the API call is pending and false after completion', () => {
    const subject$ = new Subject<UserListResponse>();
    apiSpy.getUsers.and.returnValue(subject$.asObservable());

    store.loadUsers({ limit: 10, skip: 0 });

    expect(store.isLoading()).toBeTrue();

    subject$.next(mockListResponse([mockUser()]));
    subject$.complete();

    expect(store.isLoading()).toBeFalse();
    expect(store.users().length).toBe(1);
  });

  it('deleteUser() removes user from signal before API responds (optimistic)', () => {
    // Seed two users directly via private signal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store as any)['_users'].set([mockUser({ id: 1 }), mockUser({ id: 2, username: 'janedoe' })]);

    const subject$ = new Subject<{ id: number; isDeleted: boolean }>();
    apiSpy.deleteUser.and.returnValue(subject$.asObservable());

    store.deleteUser(1);

    // User removed BEFORE the API has responded
    expect(store.users().length).toBe(1);
    expect(store.users().find((u) => u.id === 1)).toBeUndefined();

    subject$.next({ id: 1, isDeleted: true });
    subject$.complete();
  });

  it('deleteUser() restores the user list when the API returns an error (rollback)', () => {
    const twoUsers = [mockUser({ id: 1 }), mockUser({ id: 2, username: 'janedoe' })];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (store as any)['_users'].set(twoUsers);

    const subject$ = new Subject<{ id: number; isDeleted: boolean }>();
    apiSpy.deleteUser.and.returnValue(subject$.asObservable());

    store.deleteUser(1);
    expect(store.users().length).toBe(1); // optimistically removed

    subject$.error(mockAppError(500));

    // Both users back after rollback
    expect(store.users().length).toBe(2);
    expect(store.users().find((u) => u.id === 1)).toBeDefined();
    expect(store.hasError()).toBeTrue();
  });
});
