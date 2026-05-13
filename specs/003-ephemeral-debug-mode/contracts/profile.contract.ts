/**
 * ProfileService Contract aligned with the Swagger API.
 *
 * @file specs/003-ephemeral-debug-mode/contracts/profile.contract.ts
 */

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

export interface ProfileService {
  getMe(): Promise<UserResponse>;
  getById(userId: string): Promise<UserResponse>;
  updateProfile(input: UpdateUserRequest): Promise<UserResponse>;
  getCollectionCount(userId: string): Promise<number>;
  getItemCount(userId: string): Promise<number>;
}
