import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserApiService } from './user-api.service';
import { apiInterceptor } from '@core/interceptors/api.interceptor';
import { AppError, DummyJsonListResponse, DummyJsonUser } from '@core/models/user.model';

const API = 'https://dummyjson.com';

function mockRaw(overrides: Partial<DummyJsonUser> = {}): DummyJsonUser {
  return {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    image: 'https://example.com/avatar.jpg',
    ...overrides,
  };
}

function mockListResponse(users: DummyJsonUser[]): DummyJsonListResponse {
  return { users, total: users.length, skip: 0, limit: users.length };
}

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getUsers() maps firstName/lastName to first_name/last_name', () => {
    let result: ReturnType<UserApiService['getUsers']> extends import('rxjs').Observable<infer T>
      ? T
      : never;

    service.getUsers({ limit: 5, skip: 0 }).subscribe((res) => (result = res as typeof result));

    const req = httpMock.expectOne(
      (r) => r.url === `${API}/users` && r.params.get('limit') === '5',
    );
    req.flush(mockListResponse([mockRaw({ firstName: 'Ana', lastName: 'Pérez' })]));

    expect(result!.users.length).toBe(1);
    expect(result!.users[0].first_name).toBe('Ana');
    expect(result!.users[0].last_name).toBe('Pérez');
    expect(result!.users[0].active).toBeTrue();
  });

  it('getUserById() returns User with active:true derived from raw payload', () => {
    let user: ReturnType<UserApiService['getUserById']> extends import('rxjs').Observable<infer T>
      ? T
      : never;

    service.getUserById(1).subscribe((u) => (user = u as typeof user));

    const req = httpMock.expectOne(`${API}/users/1`);
    req.flush(mockRaw({ id: 1, role: 'guest' }));

    expect(user!.id).toBe(1);
    expect(user!.active).toBeTrue();
    expect(user!.role).toBe('guest');
    expect(user!.first_name).toBe('John');
  });

  it('getUserById() throws AppError with status 404 when user not found', () => {
    let error: AppError | undefined;

    service.getUserById(999).subscribe({ error: (err: AppError) => (error = err) });

    const req = httpMock.expectOne(`${API}/users/999`);
    req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });

    expect(error).toBeDefined();
    expect(error!.status).toBe(404);
    expect(error!.message).toBe('error.notFound');
  });

  it('searchUsers() hits /users/search with the q query param', () => {
    let result: ReturnType<UserApiService['searchUsers']> extends import('rxjs').Observable<infer T>
      ? T
      : never;

    service
      .searchUsers('emily', { limit: 10, skip: 0 })
      .subscribe((res) => (result = res as typeof result));

    const req = httpMock.expectOne(
      (r) => r.url === `${API}/users/search` && r.params.get('q') === 'emily',
    );
    req.flush(mockListResponse([mockRaw({ username: 'emilys' })]));

    expect(req.request.method).toBe('GET');
    expect(result!.users.length).toBe(1);
    expect(result!.users[0].username).toBe('emilys');
  });
});
