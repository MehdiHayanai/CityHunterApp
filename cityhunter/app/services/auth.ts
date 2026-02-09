import { fetchWithAuth } from "../lib/api";
import { LoginCredentials, AuthResponse, RegisterData } from "../types/auth"; // Need to define types

// Temporary types until strictly defined in a shared type file
interface LoginPayload {
  username: string; // OAuth2 form expects 'username', but our UI uses email. Backend usually maps this in Depends() or we send JSON.
  password: string;
}

export const authService = {
  // Use JSON login endpoint if available, otherwise form-data for OAuth2
  // Our backend auth.py has @router.post("/login") receiving UserLogin (JSON)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (data: RegisterData) => {
    return fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    });
  },

  getMe: async (): Promise<any> => {
      return fetchWithAuth('/users/profile/me');
  },

  logout: () => {
    // Handled by store mainly, but good to have here
    if (typeof window !== 'undefined') {
        // We will use js-cookie in the store or component
        // But if we want to be safe:
        // document.cookie = ...
    }
  }
};
