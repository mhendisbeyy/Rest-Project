import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimeReactProvider } from 'primereact/api';
import RequestJourneyPage from '../app/(main)/pages/istegin-yolculugu/components/RequestJourneyPage';
import ApiRestPage from '../components/lessons/ApiRestPage';

function renderPage(Component) {
  render(<PrimeReactProvider value={{ cssTransition: false }}><Component /></PrimeReactProvider>);
}
async function closeDialog(user) {
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Kapat', exact: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}

describe('FilterChain and REST architecture teaching', () => {
  it('keeps the 15-step timeline and illustrates continuing, blocking and finally on an unresolved error', async () => {
    const user = userEvent.setup(); renderPage(RequestJourneyPage);
    const timeline = screen.getByRole('navigation', { name: 'İstek yaşam döngüsü adımları' });
    expect(within(timeline).getAllByRole('button')).toHaveLength(15);
    await user.click(within(timeline).getByRole('button', { name: /Servlet FilterChain$/ }));
    const dialog = screen.getByRole('dialog', { name: 'Servlet FilterChain', exact: true });
    const registered = within(dialog).getByRole('table', { name: 'Başlangıç kaydında gözlenen filtreler' });
    expect(registered.textContent).toContain('characterEncodingFilter');
    expect(registered.textContent).toContain('formContentFilter');
    expect(registered.textContent).toContain('requestContextFilter');
    const model = within(dialog).getByRole('region', { name: 'Filtre zinciri öğretici modeli' });
    const trace = () => within(model).getByRole('list', { name: 'Örneğin çalışma sırası' }).textContent;
    expect(trace()).toContain('MVC · isteği işle');
    expect(trace()).toContain('B · sonra');
    await user.click(within(model).getByRole('button', { name: 'Filtrede durdur', exact: true }));
    expect(trace()).toContain('B · 400 yaz ve return');
    expect(trace()).not.toContain('MVC');
    expect(trace()).not.toContain('B · sonra');
    expect(trace()).toContain('A · finally');
    await user.click(within(model).getByRole('button', { name: 'İşlenmemiş hata', exact: true }));
    expect(trace()).toContain('MVC · çözülmemiş exception');
    expect(trace()).not.toContain('B · sonra');
    expect(trace()).toContain('A · finally');
    const registration = within(dialog).getByText('Filtreler nasıl sağlanır, kaydedilir ve sıralanır?').closest('details');
    await user.click(within(registration).getByText('Filtreler nasıl sağlanır, kaydedilir ve sıralanır?'));
    expect(registration.open).toBe(true);
    expect(registration.textContent).toContain('registration.setOrder(10)');
    expect(registration.textContent).toContain('çift kayıt/çift çalışma');
    await closeDialog(user);
  });

  it('explains stateless resource state and marks missing hypermedia/cache instead of claiming complete REST compliance', async () => {
    const user = userEvent.setup(); renderPage(ApiRestPage);
    expect(screen.getByRole('heading', { name: /API ve REST Mimarisi/ })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Stateless kısıtını incele' }));
    expect(screen.getByRole('dialog').textContent).toContain('Kaynak durumu ile sunucuda tutulan istemci oturum bağlamı farklıdır');
    expect(screen.getByRole('dialog').textContent).toContain('Redux’ta UI state');
    await closeDialog(user);
    await user.click(screen.getByRole('button', { name: 'Uniform Interface kısıtını incele' }));
    const uniform = within(screen.getByRole('dialog')).getByRole('region', { name: 'Tek biçimli arayüzün dört alt kısıtı' });
    expect(within(uniform).getAllByRole('heading')).toHaveLength(4);
    const hypermedia = within(uniform).getByRole('heading', { name: 'Hypermedia / HATEOAS' }).closest('article');
    expect(hypermedia.textContent).toContain('Eksik');
    await user.keyboard('[Escape]');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await user.click(screen.getByRole('button', { name: 'Cache kısıtını incele' }));
    expect(screen.getByRole('dialog').textContent).toContain('Geliştirilecek');
    expect(screen.getByRole('dialog').textContent).toContain('görev API’sinde uygulanmadı');
    await closeDialog(user);
  });

  it('switches API contract examples without sending requests and preserves 201/Location and empty 204', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup(); renderPage(ApiRestPage);
    const responseCode = () => within(screen.getByRole('region', { name: 'API örnek yanıtı' })).getByRole('heading').nextElementSibling.textContent;
    await user.click(screen.getByRole('button', { name: 'Oluştur · POST', exact: true }));
    expect(responseCode()).toContain('201 Created\nLocation: /api/tasks/42');
    expect(JSON.parse(responseCode().split('\n\n')[1]).status).toBe('OPEN');
    await user.click(screen.getByRole('button', { name: 'Sil · DELETE', exact: true }));
    expect(responseCode()).toBe('HTTP/1.1 204 No Content');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
