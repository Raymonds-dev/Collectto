export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
  birthdayDate: string;
}
