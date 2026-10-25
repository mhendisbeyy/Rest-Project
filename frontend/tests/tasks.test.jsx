import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { PrimeReactProvider } from 'primereact/api';
import TasksPage from '../app/(main)/pages/gorevler/components/TasksPage';
import { api } from '../services/api';
import { makeStore } from '../store/store';

let tasks;
let nextId;
const originalAdapter = api.defaults.adapter;
beforeEach(() => {
  tasks = [{ id: 1, title: 'Başlangıç görevi', description: 'İlk açıklama', status: 'OPEN' }];
  nextId = 2;
  api.defaults.adapter = async config => {
    const method = config.method.toUpperCase();
    const id = Number(config.url.split('/').at(-1));
    const body = config.data ? JSON.parse(config.data) : {};
    function reply(data, status = 200) {
      return { config, status, statusText: ({ 200: 'OK', 201: 'Created', 204: 'No Content', 400: 'Bad Request', 409: 'Conflict' })[status], data: status === 204 ? '' : JSON.stringify(data), headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/json' } };
    }
    if (method === 'GET' && config.url === '/api/tasks') {
      const { page = 0, size = 5, status } = config.params;
      const filtered = tasks.filter(task => !status || task.status === status);
      return reply({ items: filtered.slice(page * size, (page + 1) * size), page, size, totalElements: filtered.length, totalPages: Math.ceil(filtered.length / size) });
    }
    if (method === 'GET') return reply(tasks.find(task => task.id === id));
    if (method === 'POST') {
      if (!body.title.trim()) return reply({ status: 400, detail: 'İstek alanlarını kontrol edin.', code: 'VALIDATION_ERROR', fieldErrors: [{ field: 'title', message: 'Başlık boş olamaz.' }] }, 400);
      const task = { id: nextId++, ...body, status: 'OPEN' }; tasks.push(task); return reply(task, 201);
    }
    if (method === 'DELETE') { tasks = tasks.filter(task => task.id !== id); return reply(null, 204); }
    const index = tasks.findIndex(task => task.id === id);
    if (tasks[index].status === 'DONE' && body.status !== 'DONE') return reply({ status: 409, code: 'TASK_STATE_CONFLICT', detail: 'Tamamlanmış görev yeniden açılamaz.' }, 409);
    tasks[index] = { ...tasks[index], ...body }; return reply(tasks[index]);
  };
});
afterEach(() => { api.defaults.adapter = originalAdapter; });

function renderPage() {
  const store = makeStore();
  render(<Provider store={store}><PrimeReactProvider value={{ cssTransition: false, ripple: false }}><TasksPage /></PrimeReactProvider></Provider>);
  return store;
}
async function openDetail(user, title = 'Başlangıç görevi') {
  await user.click(await screen.findByRole('button', { name: `${title} görev detayını aç` }));
  await screen.findByRole('region', { name: 'Seçili görev detayı' });
}
async function choose(user, label, option) {
  await user.click(screen.getByLabelText(label, { exact: true }).closest('.p-dropdown'));
  await user.click(await screen.findByRole('option', { name: option }));
}

describe('YKH PrimeReact CRUD screen', () => {
  it('keeps POST 201 selected after list refresh', async () => {
    const user = userEvent.setup(); const store = renderPage();
    await screen.findByRole('button', { name: 'Başlangıç görevi görev detayını aç' });
    await user.click(screen.getByRole('button', { name: 'Yeni görev' }));
    await user.type(screen.getByRole('textbox', { name: /Başlık/ }), 'Eklenen görev');
    await user.click(screen.getByRole('button', { name: 'Görevi oluştur' }));
    await screen.findByText('Görev #2 oluşturuldu.');
    await screen.findByRole('button', { name: 'Eklenen görev görev detayını aç' });
    expect(screen.getByText('201 Created')).toBeTruthy();
    const { exchanges, selectedId } = store.getState().http;
    expect(exchanges.find(item => item.id === selectedId).method).toBe('POST');
  });
  it('shows backend field errors and retains the description draft', async () => {
    const user = userEvent.setup(); renderPage();
    await screen.findByRole('button', { name: 'Başlangıç görevi görev detayını aç' });
    await user.click(screen.getByRole('button', { name: 'Yeni görev' }));
    await user.type(screen.getByRole('textbox', { name: 'Açıklama' }), 'Korunacak taslak');
    await user.click(screen.getByRole('button', { name: 'Görevi oluştur' }));
    await screen.findByText('Başlık boş olamaz.');
    expect(screen.getByRole('textbox', { name: /Başlık/ }).getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('textbox', { name: 'Açıklama' }).value).toBe('Korunacak taslak');
    expect(tasks).toHaveLength(1);
  });
  it('sends complete PUT input including a cleared description', async () => {
    const user = userEvent.setup(); renderPage(); await openDetail(user);
    await user.click(screen.getByRole('button', { name: 'Düzenle PUT' }));
    await user.clear(screen.getByRole('textbox', { name: /Başlık/ }));
    await user.type(screen.getByRole('textbox', { name: /Başlık/ }), 'Düzenlenen görev');
    await user.clear(screen.getByRole('textbox', { name: 'Açıklama' }));
    await choose(user, 'Durum', 'Devam ediyor');
    await user.click(screen.getByRole('button', { name: 'Değişiklikleri kaydet' }));
    await screen.findByText('Görev #1 güncellendi.');
    expect(tasks[0]).toMatchObject({ title: 'Düzenlenen görev', description: null, status: 'IN_PROGRESS' });
  });
  it('reports PATCH conflict while keeping DONE unchanged', async () => {
    tasks[0].status = 'DONE';
    const user = userEvent.setup(); renderPage(); await openDetail(user);
    await choose(user, 'Yeni durum', 'Yapılacak');
    await user.click(screen.getByRole('button', { name: 'Durumu değiştir PATCH' }));
    await screen.findByText('409 Conflict');
    expect(screen.getByRole('alert').textContent).toContain('Tamamlanmış görev yeniden açılamaz.');
    expect(tasks[0].status).toBe('DONE');
  });
  it('requires delete confirmation and displays empty 204 correctly', async () => {
    const user = userEvent.setup(); renderPage(); await openDetail(user);
    await user.click(screen.getByRole('button', { name: 'Sil DELETE' }));
    expect(tasks).toHaveLength(1);
    await user.click(within(screen.getByRole('dialog', { name: 'Görevi sil' })).getByRole('button', { name: 'Evet, sil' }));
    await screen.findByText('Gösterilecek görev yok.');
    expect(tasks).toHaveLength(0);
    expect(screen.getByText('204 No Content — yanıt gövdesi yok.')).toBeTruthy();
  });
  it('returns to previous page after deleting the last row of last page', async () => {
    tasks = Array.from({ length: 6 }, (_, index) => ({ id: index + 1, title: `Görev ${index + 1}`, description: null, status: 'OPEN' }));
    const user = userEvent.setup(); renderPage();
    await screen.findByRole('button', { name: 'Görev 1 görev detayını aç' });
    await user.click(screen.getByRole('button', { name: 'Sonraki sayfa' }));
    await openDetail(user, 'Görev 6');
    await user.click(screen.getByRole('button', { name: 'Sil DELETE' }));
    await user.click(screen.getByRole('button', { name: 'Evet, sil' }));
    await screen.findByRole('button', { name: 'Görev 1 görev detayını aç' });
    await waitFor(() => expect(screen.getByText('1 / 1')).toBeTruthy());
    expect(tasks).toHaveLength(5);
  });
  it('creates isolated stores for separate provider instances', () => {
    const first = makeStore(); const second = makeStore();
    first.dispatch({ type: 'tasks/changeQuery', payload: { status: 'DONE' } });
    expect(first.getState().tasks.status).toBe('DONE');
    expect(second.getState().tasks.status).toBe('');
  });
  it('returns from a status filter to the empty all-status value', async () => {
    tasks.push({ id: 2, title: 'Tamamlanan görev', description: null, status: 'DONE' });
    const user = userEvent.setup(); const store = renderPage();
    await screen.findByRole('button', { name: 'Başlangıç görevi görev detayını aç' });
    await choose(user, 'Durum filtresi', 'Tamamlandı');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Başlangıç görevi görev detayını aç' })).toBeNull());
    await choose(user, 'Durum filtresi', 'Tüm durumlar');
    await screen.findByRole('button', { name: 'Başlangıç görevi görev detayını aç' });
    expect(store.getState().tasks.status).toBe('');
    expect(store.getState().tasks.data.totalElements).toBe(2);
  });
});
