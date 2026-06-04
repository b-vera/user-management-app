import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  DummyJsonListResponse,
  DummyJsonUser,
  User,
  UserListParams,
  UserListResponse,
  mapDummyJsonToUser,
} from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);

  getUsers(params: UserListParams): Observable<UserListResponse> {
    const httpParams = new HttpParams()
      .set('limit', params.limit)
      .set('skip', params.skip)
      .set('select', 'id,username,email,firstName,lastName,role,image');

    return this.http
      .get<DummyJsonListResponse>('/users', { params: httpParams })
      .pipe(map((res) => this.mapListResponse(res)));
  }

  searchUsers(q: string, params: UserListParams): Observable<UserListResponse> {
    const httpParams = new HttpParams()
      .set('q', q)
      .set('limit', params.limit)
      .set('skip', params.skip);

    return this.http
      .get<DummyJsonListResponse>('/users/search', { params: httpParams })
      .pipe(map((res) => this.mapListResponse(res)));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<DummyJsonUser>(`/users/${id}`).pipe(map((raw) => mapDummyJsonToUser(raw)));
  }

  createUser(payload: Partial<User>): Observable<User> {
    const body = {
      username: payload.username,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name,
      role: payload.role ?? 'user',
    };

    return this.http
      .post<DummyJsonUser>('/users/add', body)
      .pipe(map((raw) => mapDummyJsonToUser(raw)));
  }

  updateUser(id: number, payload: Partial<User>): Observable<User> {
    const body: Record<string, unknown> = {};
    if (payload.first_name !== undefined) body['firstName'] = payload.first_name;
    if (payload.last_name !== undefined) body['lastName'] = payload.last_name;
    if (payload.email !== undefined) body['email'] = payload.email;
    if (payload.username !== undefined) body['username'] = payload.username;
    if (payload.role !== undefined) body['role'] = payload.role;
    if (payload.active !== undefined) body['active'] = payload.active;

    return this.http
      .put<DummyJsonUser>(`/users/${id}`, body)
      .pipe(map((raw) => mapDummyJsonToUser(raw)));
  }

  deleteUser(id: number): Observable<{ id: number; isDeleted: boolean }> {
    return this.http.delete<{ id: number; isDeleted: boolean }>(`/users/${id}`);
  }

  private mapListResponse(res: DummyJsonListResponse): UserListResponse {
    return {
      users: res.users.map((raw, i) => mapDummyJsonToUser(raw, i)),
      total: res.total,
      skip: res.skip,
      limit: res.limit,
    };
  }
}
