import { api } from "../lib/api";

class Service {
  static async signup(data: any) {
    const response = await api.post('/auth/signup', data);
    return response.data;
  }

  static async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  // Task methods
  static async getTasks() {
    const response = await api.get('/tasks');
    return response.data;
  }

  static async createTask(data: any) {
    const response = await api.post('/tasks', data);
    return response.data;
  }

  static async updateTask(id: string, data: any) {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  }

  static async deleteTask(id: string) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }

  // User methods
  static async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  }

  static async getPreferences() {
    const response = await api.get('/users/preferences');
    return response.data;
  }

  static async updatePreferences(data: any) {
    const response = await api.patch('/users/preferences', data);
    return response.data;
  }
}

export default Service;