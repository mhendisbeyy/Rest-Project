import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimeReactProvider } from 'primereact/api';
import RequestJourneyPage from '../app/(main)/pages/istegin-yolculugu/components/RequestJourneyPage';

function renderJourney() {
  render(<PrimeReactProvider value={{ cssTransition: false }}><RequestJourneyPage /></PrimeReactProvider>);
}

function timeline() { return screen.getByRole('navigation', { name: 'İstek yaşam döngüsü adımları' }); }
function detail(name) { return screen.getByRole('region', { name, exact: true }); }

describe('Request journey teaching screen', () => {
  it('opens framework details and supports keyboard and previous/next navigation', async () => {
    const user = userEvent.setup(); renderJourney();
    expect(within(timeline()).getAllByRole('button')).toHaveLength(23);
    expect(screen.getByRole('button', { name: 'Önceki adım' }).disabled).toBe(true);
    await user.click(within(timeline()).getByRole('button', { name: /DispatcherServlet$/ }));
    expect(within(detail('DispatcherServlet')).getByText(/merkezî yönlendiricisi/)).toBeTruthy();
    expect(within(detail('DispatcherServlet')).getByRole('link', { name: /DispatcherServlet işleme akışı/ }).href).toContain('docs.spring.io');
    await user.click(screen.getByRole('button', { name: 'Sonraki adım' }));
    expect(detail('HandlerMapping')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sonraki adım' }));
    expect(detail('HandlerAdapter')).toBeTruthy();
    const adapter = within(timeline()).getByRole('button', { name: /HandlerAdapter$/ });
    adapter.focus();
    await user.keyboard('[End]');
    expect(detail('Axios → Redux → ekran')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sonraki adım' }).disabled).toBe(true);
    await user.keyboard('[Home]');
    expect(detail('Kullanıcı hareketi')).toBeTruthy();
    expect(within(timeline()).getByRole('button', { name: /Kullanıcı hareketi$/ }).getAttribute('aria-current')).toBe('step');
  });

  it('shows validation as the 400 stop and explains why Service is skipped', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'POST · 400' }));
    expect(detail('Bean Validation').textContent).toContain('controller metodunun gövdesine girilmez');
    expect(screen.getByRole('button', { name: 'POST · 400' }).getAttribute('aria-pressed')).toBe('true');
    await user.click(within(timeline()).getByRole('button', { name: /TaskService — bu senaryoda atlanır/ }));
    expect(detail('TaskService').textContent).toContain('Validation hatası MVC hazırlığında oluştu; Service’e gelinmedi.');
    await user.click(within(timeline()).getByRole('button', { name: /Transaction’dan çıkış — bu senaryoda atlanır/ }));
    expect(detail('Transaction’dan çıkış').textContent).toContain('commit/rollback yapılmaz');
    await user.click(screen.getByText('Örnek HTTP isteği ve beklenen yanıt'));
    expect(screen.getByText(/HTTP 400 Bad Request/).textContent).toContain('VALIDATION_ERROR');
  });

  it('places the repository read before the 409 rule and explains rollback', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'PATCH · 409' }));
    expect(detail('İş kuralı ve model değişikliği').textContent).toContain('task.changeStatus satırı çalışmaz');
    const buttons = within(timeline()).getAllByRole('button');
    const repository = buttons.findIndex(button => button.textContent.includes('Repository → JPA'));
    const rules = buttons.findIndex(button => button.textContent.includes('İş kuralı ve model'));
    expect(repository).toBeLessThan(rules);
    await user.click(within(timeline()).getByRole('button', { name: /Transaction’dan çıkış$/ }));
    expect(detail('Transaction’dan çıkış').textContent).toContain('transaction rollback olur');
    await user.click(screen.getByRole('button', { name: 'POST · Oluştur' }));
    const postButtons = within(timeline()).getAllByRole('button');
    expect(postButtons.findIndex(button => button.textContent.includes('İş kuralı ve model'))).toBeLessThan(postButtons.findIndex(button => button.textContent.includes('Repository → JPA')));
  });

  it('explains the 204 body omission without pretending to serialize JSON', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'DELETE · 204' }));
    expect(detail('Dönüş değeri ve ResponseEntity').textContent).toContain('hiç body yoktur');
    await user.click(within(timeline()).getByRole('button', { name: /HttpMessageConverter ve Jackson — bu senaryoda atlanır/ }));
    expect(detail('HttpMessageConverter ve Jackson').textContent).toContain('204 No Content için yazılacak JSON body yoktur');
    await user.click(within(timeline()).getByRole('button', { name: /MapStruct → yanıt DTO’su — bu senaryoda atlanır/ }));
    expect(detail('MapStruct → yanıt DTO’su').textContent).toContain('mapper çağrılmaz');
    expect(screen.getByRole('link', { name: /Görev ekranında gerçek istekleri incele/ }).getAttribute('href')).toBe('/pages/gorevler');
  });
});
