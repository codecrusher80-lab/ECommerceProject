import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

class AuthService {
  private baseURL = API_BASE_URL;

  async login(loginData: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.LOGIN}`, loginData);
    return response.data;
  }

  async register(registerData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.REGISTER}`, registerData);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.LOGOUT}`);
    return response.data;
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.CHANGE_PASSWORD}`, passwordData);
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.FORGOT_PASSWORD}`, { email });
    return response.data;
  }

  async resetPassword(resetData: { email: string; token: string; newPassword: string }): Promise<ApiResponse> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.RESET_PASSWORD}`, resetData);
    return response.data;
  }

  async confirmEmail(userId: string, token: string): Promise<ApiResponse> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.CONFIRM_EMAIL}?userId=${userId}&token=${token}`);
    return response.data;
  }

  async resendEmailConfirmation(email: string): Promise<ApiResponse> {
    const response = await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.RESEND_CONFIRMATION}`, { email });
    return response.data;
  }
  async refreshToken() {
    return await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`);
  }

  async getCurrentUser() {
    return await axios.post(`${this.baseURL}${ENDPOINTS.AUTH.GET_CURRENT_USER}`);
  }
}

export default new AuthService();