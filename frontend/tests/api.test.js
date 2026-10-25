import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { api, ApiError, request } from '../services/api';

const originalAdapter = api.defaults.adapter;
function reply(status, data, headers = {}) {
  api.defaults.adapter = vi.fn(async config => ({ status, statusText: status === 204 ? 'No Content' : 'OK', data, headers, config }));
}
beforeEach(() => reply(200, '{}', { 'content-type': 'application/json' }));
afterEach(() => { api.defaults.adapter = originalAdapter; });

describe('Axios HTTP contract', () => {
  it('handles empty DELETE 204 without parsing JSON or adding Content-Type', async () => {
    reply(204, '');
    const result = await request('/api/tasks/1', { method: 'DELETE' });
    expect(result.data).toBeUndefined();
    expect(result.exchange.responseBody).toBeNull();
    expect(result.exchange.status).toBe(204);
    expect(result.exchange.requestHeaders['Content-Type']).toBeUndefined();
  });
  it('records POST payload, status and Location', async () => {
    const body = { title: 'Yeni görev', description: null };
    reply(201, JSON.stringify({ id: 2, ...body, status: 'OPEN' }), { 'content-type': 'application/json', location: '/api/tasks/2' });
    const result = await request('/api/tasks', { method: 'POST', body });
    expect(JSON.parse(api.defaults.adapter.mock.calls[0][0].data)).toEqual(body);
    expect(result.exchange.requestBody).toEqual(body);
    expect(result.exchange.responseHeaders.location).toBe('/api/tasks/2');
    expect(result.exchange.status).toBe(201);
  });
  it('preserves ProblemDetail field errors', async () => {
    const problem = { status: 400, code: 'VALIDATION_ERROR', detail: 'Alanları kontrol edin.', fieldErrors: [{ field: 'title', message: 'Başlık boş olamaz.' }] };
    reply(400, JSON.stringify(problem), { 'content-type': 'application/problem+json' });
    const error = await request('/api/tasks', { method: 'POST', body: { title: '' } }).catch(reason => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.problem).toEqual(problem);
  });
  it('does not turn a network failure into HTTP 500', async () => {
    api.defaults.adapter = config => Promise.reject(new axios.AxiosError('Network error', 'ERR_NETWORK', config));
    const error = await request('/api/tasks').catch(reason => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.exchange.status).toBeNull();
  });
  it('preserves cancellation', async () => {
    const controller = new AbortController(); controller.abort();
    const error = await request('/api/tasks', { signal: controller.signal }).catch(reason => reason);
    expect(axios.isCancel(error)).toBe(true);
    expect(error).not.toBeInstanceOf(ApiError);
  });
  it('rejects HTML fallback but retains the actual response', async () => {
    reply(200, '<html>Fallback</html>', { 'content-type': 'text/html' });
    const error = await request('/api/tasks').catch(reason => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.exchange.responseBody).toContain('<html>');
  });
});
