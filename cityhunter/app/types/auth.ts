export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  handle: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  is_verified?: boolean;
}
