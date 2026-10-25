import { request } from './api';

class TaskService {
  getAll({ page, size, status }, signal) {
    return request('/api/tasks', { params: { page, size, ...(status ? { status } : {}) }, signal });
  }
  getById(id, signal) { return request(`/api/tasks/${id}`, { signal }); }
  create(body) { return request('/api/tasks', { method: 'POST', body }); }
  update(id, body) { return request(`/api/tasks/${id}`, { method: 'PUT', body }); }
  updateStatus(id, status) { return request(`/api/tasks/${id}`, { method: 'PATCH', body: { status } }); }
  delete(id) { return request(`/api/tasks/${id}`, { method: 'DELETE' }); }
}

const taskService = new TaskService();
export default taskService;
