/**
 * AuthService Contract aligned with the Swagger API.
 *
 * @file specs/003-debug-mode/contracts/auth.contract.ts
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
}

export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  birthdayDate: string;
}

export interface CreateUserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  profileBackgroundUrl?: string;
  followersCount?: number;
  followingCount?: number;
  isActive?: boolean;
  birthdayDate?: string;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  bio?: string;
  profilePictureUrl?: string | null;
  profileBackgroundUrl?: string | null;
  birthdayDate?: string;
}

export interface AuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  createUser(payload: CreateUserRequest): Promise<CreateUserResponse>;
  updateUser(payload: UpdateUserRequest): Promise<UserResponse>;
  getUserById(userId: string): Promise<UserResponse>;
  getCurrentUser(): Promise<UserResponse | null>;
}
