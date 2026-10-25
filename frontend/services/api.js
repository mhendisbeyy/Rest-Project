import axios from 'axios';

const sensitiveHeaders = /^(authorization|cookie|set-cookie|x-csrf-token|x-xsrf-token)$/i;

function plainHeaders(headers) {
  const values = headers?.toJSON ? headers.toJSON() : headers || {};
  return Object.fromEntries(Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key, sensitiveHeaders.test(key) ? '[MASKELENDİ]' : String(value)]));
}

export const api = axios.create({
  baseURL: '',
  headers: { Accept: 'application/json, application/problem+json' },
  transformResponse: [(data, headers) => {
    if (typeof data === 'string' && data && headers['content-type']?.includes('json')) {
      try { return JSON.parse(data); } catch { return data; }
    }
    return data;
  }],
});

api.interceptors.request.use(config => {
  if (config.data !== undefined) config.headers.set('Content-Type', 'application/json');
  config.workshop = {
    id: crypto.randomUUID(), startedAt: performance.now(),
    requestBody: config.data === undefined ? null : structuredClone(config.data),
    requestHeaders: plainHeaders(config.headers),
  };
  return config;
});

function exchangeFor(config, response) {
  const metadata = config?.workshop;
  return {
    id: metadata?.id || crypto.randomUUID(),
    method: (config?.method || 'get').toUpperCase(),
    url: config ? api.getUri(config) : '',
    requestHeaders: metadata?.requestHeaders || {},
    requestBody: metadata?.requestBody ?? null,
    responseHeaders: plainHeaders(response?.headers),
    status: response?.status ?? null,
    statusText: response?.statusText || '',
    responseBody: response?.status === 204 ? null : response?.data ?? null,
    durationMs: Math.round(performance.now() - (metadata?.startedAt ?? performance.now())),
  };
}

api.interceptors.response.use(response => {
  response.exchange = exchangeFor(response.config, response);
  return response;
}, error => {
  if (!axios.isCancel(error)) error.exchange = exchangeFor(error.config, error.response);
  return Promise.reject(error);
});

export class ApiError extends Error {
  constructor(message, exchange) {
    super(message);
    this.name = 'ApiError';
    this.exchange = exchange;
    const body = exchange.responseBody;
    this.problem = body && typeof body === 'object' && typeof body.status === 'number' ? body : null;
  }
}

function httpError(exchange) {
  const body = exchange.responseBody;
  return new ApiError(body?.detail || `İstek başarısız oldu (HTTP ${exchange.status}).`, exchange);
}

export async function request(url, { method = 'GET', body, params, signal } = {}) {
  let response;
  try {
    response = await api.request({ url, method, data: body, params, signal });
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    const exchange = error.exchange || exchangeFor(error.config, error.response);
    if (exchange.status !== null) throw httpError(exchange);
    throw new ApiError('Sunucuya ulaşılamadı. Bağlantıyı kontrol edip yeniden dene.', exchange);
  }
  const exchange = response.exchange;
  if (response.status >= 400) throw httpError(exchange);
  if (response.status === 204) return { data: undefined, exchange };
  if (!response.data || typeof response.data !== 'object') {
    throw new ApiError('API beklenen JSON yanıtını döndürmedi. Backend ve rewrite ayarlarını kontrol et.', exchange);
  }
  return { data: response.data, exchange };
}

export default api;
