import apiClient from '@/utils/apiClient.util';

const AUTH_BASE = '/auth';

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RefreshPayload {
    refreshToken: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    resetToken: string;
    newPassword: string;
}

class AuthService {
    async signup(payload: SignupPayload) {
        try {
            const { data } = await apiClient.post(`${AUTH_BASE}/signup`, payload);
            return data;
        } catch (error: any) {
            console.error('[AuthService] Signup error:', error)
            console.error('[AuthService] Error response:', error?.response?.data)
            console.error('[AuthService] Error status:', error?.response?.status)

            // Axios throws error for status >= 400
            // Extract error message from response
            const errorData = error?.response?.data;
            const errorMessage = errorData?.message ||
                errorData?.error ||
                (errorData && typeof errorData === 'string' ? errorData : null) ||
                error?.message ||
                (error?.response?.status === 400 ? 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' : 'Đăng ký thất bại. Vui lòng thử lại.');

            throw new Error(errorMessage);
        }
    }

    async login(payload: LoginPayload) {
        const { data } = await apiClient.post(`${AUTH_BASE}/login`, payload);
        return data;
    }

    async refreshTokens(payload: RefreshPayload) {
        const { data } = await apiClient.post(`${AUTH_BASE}/refresh`, payload);
        return data;
    }

    async changePassword(payload: ChangePasswordPayload) {
        const { data } = await apiClient.put(`${AUTH_BASE}/change-password`, payload);
        return data;
    }

    async forgotPassword(payload: ForgotPasswordPayload) {
        const { data } = await apiClient.post(`${AUTH_BASE}/forgot-password`, payload);
        return data;
    }

    async resetPassword(payload: ResetPasswordPayload) {
        const { data } = await apiClient.post(`${AUTH_BASE}/reset-password`, payload);
        return data;
    }
}

export default new AuthService();

