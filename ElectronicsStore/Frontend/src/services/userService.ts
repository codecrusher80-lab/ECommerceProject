import { apiClient } from './apiClient';
import { User, PagedResult, PaginationParams, ApiResponse } from '../types';

export interface UserFilters extends PaginationParams {
  isActive?: boolean;
  roles?: string[];
  email?: string;
}

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  roles: string[];
  isActive: boolean;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
  roles: string[];
}

class UserService {
  async getAllUsers(filters: UserFilters): Promise<PagedResult<User>> {
    const response = await apiClient.get('/api/admin/users', { params: filters });
    return response.data.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data.data;
  }

  async createUser(userData: UserCreateRequest): Promise<User> {
    const response = await apiClient.post('/api/admin/users', userData);
    return response.data.data;
  }

  async updateUser(userId: string, userData: UserUpdateRequest): Promise<User> {
    const response = await apiClient.put(`/api/admin/users/${userId}`, userData);
    return response.data.data;
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  }

  async toggleUserStatus(userId: string, isActive: boolean): Promise<ApiResponse> {
    const response = await apiClient.patch(`/api/admin/users/${userId}/toggle-status`, { isActive });
    return response.data;
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<ApiResponse> {
    const response = await apiClient.post(`/api/admin/users/${userId}/reset-password`, { newPassword });
    return response.data;
  }

  async getUserOrderHistory(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/admin/users/${userId}/orders`);
    return response.data.data;
  }

  async exportUsers(filters?: UserFilters): Promise<Blob> {
    const response = await apiClient.get('/api/admin/users/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  async bulkUpdateUsers(userIds: string[], updates: Partial<UserUpdateRequest>): Promise<ApiResponse> {
    const response = await apiClient.patch('/api/admin/users/bulk-update', { userIds, updates });
    return response.data;
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersThisMonth: number;
    usersByRole: { role: string; count: number }[];
  }> {
    const response = await apiClient.get('/api/admin/users/stats');
    return response.data.data;
  }
}

export default new UserService();