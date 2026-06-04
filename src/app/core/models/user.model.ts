export type UserRole = 'admin' | 'user' | 'guest';

export type LogLevel = 'debug' | 'silent';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  active: boolean;
  image?: string;
}

export interface DummyJsonUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  image: string;
}

export interface DummyJsonListResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserListParams {
  limit: number;
  skip: number;
  q?: string;
  role?: UserRole | '';
}

export interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface AppError {
  status: number;
  message: string;
  timestamp: string;
}

const VALID_ROLES: UserRole[] = ['admin', 'user', 'guest'];
const BASE_DATE = new Date('2023-01-01').getTime();

export function mapDummyJsonToUser(raw: DummyJsonUser, index = 0): User {
  const created = new Date(BASE_DATE + index * 86_400_000).toISOString();
  const updated = new Date(BASE_DATE + index * 86_400_000 + 3_600_000).toISOString();

  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    first_name: raw.firstName,
    last_name: raw.lastName,
    role: VALID_ROLES.includes(raw.role as UserRole) ? (raw.role as UserRole) : 'user',
    created_at: created,
    updated_at: updated,
    active: true,
    image: raw.image,
  };
}
