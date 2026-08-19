import { apiFetch } from './api';

interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login(email: string, password: string) {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(name: string, email: string, password: string) {
    return apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  logout() {
    return apiFetch<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  getMe() {
    return apiFetch<{ id: string; name: string; email: string; role: string }>('/api/auth/me', {
      method: 'GET',
    });
  },
};
