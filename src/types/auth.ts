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

export interface UpdateUserRequest {
  name?: string;
  username?: string;
  bio?: string;
  profilePictureUrl?: string | null;
  profileBackgroundUrl?: string | null;
  birthdayDate?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  profileBackgroundUrl?: string;
  /** Compatibility alias used across the codebase for profile picture */
  photoUrl?: string;
  followersCount?: number;
  followingCount?: number;
  isActive?: boolean;
  birthdayDate?: string;
  createdAt: string;
}

export type AuthUser = UserResponse;
export type Credentials = LoginRequest;
export type RegisterData = CreateUserRequest;
