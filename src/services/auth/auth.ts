import { apiClient } from '../api/client';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    username: string;
}

interface UpdatePasswordData {
    currentPassword: string;
    newPassword: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export const authAPI = {
    login: async (credentials: LoginCredentials) => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    register: async (data: RegisterData) => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    updatePassword: async (data: UpdatePasswordData) => {
        const response = await apiClient.post('/auth/update-password', data);
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },
};

