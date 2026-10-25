import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimeReactProvider } from 'primereact/api';
import RequestJourneyPage from '../app/(main)/pages/istegin-yolculugu/components/RequestJourneyPage';

function renderJourney() {
  render(<PrimeReactProvider value={{ cssTransition: false }}><RequestJourneyPage /></PrimeReactProvider>);
}

function timeline() { return screen.getByRole('navigation', { name: 'İstek yaşam döngüsü adımları' }); }
function detail(name) { return screen.getByRole('dialog', { name, exact: true }); }
function expectAdjacentLayers() {
  const labels = within(timeline()).getAllByRole('button').map(button => button.getAttribute('aria-label').replace(/^\d+\.\s*/, '').split(' — ')[0]);
  const controller = labels.indexOf('TaskController');
  expect(controller).toBeGreaterThan(-1);
  expect(labels.slice(controller, controller + 3)).toEqual(['TaskController', 'TaskService', 'Repository → JPA → PostgreSQL']);
}
async function closeDetail(user) {
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Kapat', exact: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}
function primaryCode(dialog) {
  return within(dialog).getByRole('region', { name: 'Seçili senaryonun kod örneği' }).querySelector('code').textContent;
}

describe('Request journey teaching screen', () => {
  it.each([
    ['POST · 400', 400, 'VALIDATION_ERROR'],
    ['PATCH · 409', 409, 'TASK_STATE_CONFLICT'],
  ])('shows the matching Advice and error JSON for %s', async (label, status, code) => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: label }));
    await user.click(within(timeline()).getByRole('button', { name: /Dönüş değeri ve ResponseEntity$/ }));
    const responseDialog = detail('Dönüş değeri ve ResponseEntity');
    expect(primaryCode(responseDialog)).toContain(code);
    expect(primaryCode(responseDialog)).not.toContain('ResponseEntity.created');
    expect(responseDialog.textContent).toContain('controllers/advice/GlobalExceptionHandler.java');
    await closeDetail(user);
    await user.click(within(timeline()).getByRole('button', { name: /HttpMessageConverter ve Jackson$/ }));
    const json = JSON.parse(primaryCode(detail('HttpMessageConverter ve Jackson')));
    expect(json).toMatchObject({ status, code });
    expect(json.id).toBeUndefined();
    if (status === 400) expect(json.fieldErrors[0].field).toBe('title');
    await closeDetail(user);
  });

  it('explains Servlet request data and distinguishes comparison examples from skipped work', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'POST · Oluştur' }));
    await user.click(within(timeline()).getByRole('button', { name: /Tomcat ve Servlet nesneleri$/ }));
    const tomcat = detail('Tomcat ve Servlet nesneleri');
    expect(primaryCode(tomcat)).toContain('request.getRequestURI()');
    expect(primaryCode(tomcat)).not.toContain('void doFilter');
    expect(primaryCode(tomcat)).toMatch(/getQueryString\(\);.*null/);
    expect(primaryCode(tomcat)).toMatch(/getParameter\("status"\);.*null/);
    const examples = within(tomcat).getByRole('region', { name: 'Tomcat ve Servlet nesneleri açıklayıcı örnekleri' });
    expect(examples.textContent).toContain('getQueryString()');
    expect(examples.textContent).toContain('JSON’u CreateTaskRequest’e dönüştürmez');
    await closeDetail(user);
    await user.click(screen.getByRole('button', { name: 'POST · 400' }));
    await user.click(within(timeline()).getByRole('button', { name: /TaskService — bu senaryoda atlanır/ }));
    expect(within(detail('TaskService')).getByRole('region', { name: 'TaskService açıklayıcı örnekleri' }).textContent).toContain('Bu adım seçili senaryoda çalışmaz');
    await closeDetail(user);
  });

  it('uses the real task request and opens the matching application code', async () => {
    const user = userEvent.setup(); renderJourney();
    const buttons = within(timeline()).getAllByRole('button');
    expect(buttons).toHaveLength(15);
    expectAdjacentLayers();
    expect(buttons.filter(button => button.textContent.includes('Frontend'))).toHaveLength(1);
    expect(within(timeline()).queryByRole('button', { name: /Redux|Axios|Next.js rewrite/ })).toBeNull();
    expect(within(timeline()).queryByRole('button', { name: /Transaction|İş kuralı ve model|MapStruct/ })).toBeNull();
    expect(screen.getByLabelText('Ham HTTP isteği').textContent).toBe('GET /api/tasks?page=0&size=5&status=OPEN HTTP/1.1\nHost: localhost:8080\nAccept: application/json, application/problem+json');
    expect(screen.getByText('status = OPEN')).toBeTruthy();
    expect(screen.getByText('page = 0 · size = 5')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'GET · Ürün 42' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Gerçek GET yanıtını aç' }).getAttribute('href')).toBe('/api/tasks?page=0&size=5&status=OPEN');
    await user.click(within(timeline()).getByRole('button', { name: /Frontend → HTTP isteği$/ }));
    expect(detail('Frontend → HTTP isteği').textContent).toContain('frontend/services/taskService.js');
    expect(detail('Frontend → HTTP isteği').textContent).toContain("return request('/api/tasks'");
    await closeDetail(user);
    await user.click(within(timeline()).getByRole('button', { name: /Tomcat ve Servlet nesneleri$/ }));
    expect(detail('Tomcat ve Servlet nesneleri').textContent).toContain('request.getQueryString()');
    expect(detail('Tomcat ve Servlet nesneleri').textContent).toContain('request.getParameter("status")');
    await closeDetail(user);
    await user.click(within(timeline()).getByRole('button', { name: /Parametre ve JSON bağlama$/ }));
    expect(detail('Parametre ve JSON bağlama').textContent).toContain('status=TaskStatus.OPEN, page=0, size=5');
    expect(detail('Parametre ve JSON bağlama').textContent).toContain('@RequestParam(required = false) TaskStatus status');
    await closeDetail(user);
    const sourceFlow = screen.getByRole('group', { name: 'Bu isteğin projedeki kod yolu' });
    await user.click(within(sourceFlow).getByRole('button', { name: 'TaskController.findAll' }));
    expect(detail('TaskController').textContent).toContain('return taskService.findAll(status, page, size);');
    expect(detail('TaskController').textContent).toContain('controllers/TaskController.java');
    await closeDetail(user);
    await user.click(within(sourceFlow).getByRole('button', { name: 'TaskService.findAll' }));
    expect(detail('TaskService').textContent).toContain('taskRepository.findByStatus(status, pageable)');
    expect(detail('TaskService').textContent).toContain('taskMapper.toDto(tasks.getContent())');
    await closeDetail(user);
    await user.click(within(sourceFlow).getByRole('button', { name: 'TaskMapper.toDto' }));
    expect(detail('Dönüş değeri ve ResponseEntity').textContent).toContain('List<TaskResponse> toDto(List<Task> tasks);');
    expect(within(detail('Dönüş değeri ve ResponseEntity')).getByText('MapStruct → yanıt DTO’su').closest('details').open).toBe(true);
    await closeDetail(user);
    expect(within(timeline()).getAllByRole('button').filter(button => button.textContent.includes('Frontend'))).toHaveLength(1);
  });

  it('shows short step explanations and opens details in a dismissible dialog with keyboard navigation', async () => {
    const user = userEvent.setup(); renderJourney();
    expect(within(timeline()).getAllByRole('button')).toHaveLength(15);
    expect(screen.queryByRole('dialog')).toBeNull();
    const dispatcher = within(timeline()).getByRole('button', { name: /DispatcherServlet$/ });
    expect(dispatcher.textContent).toContain('Spring MVC akışını koordine eder.');
    await user.click(dispatcher);
    expect(within(detail('DispatcherServlet')).getByText(/merkezî yönlendiricisi/)).toBeTruthy();
    expect(within(detail('DispatcherServlet')).getByRole('link', { name: /DispatcherServlet işleme akışı/ }).href).toContain('docs.spring.io');
    await user.click(screen.getByRole('button', { name: 'Sonraki adım' }));
    expect(detail('HandlerMapping')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sonraki adım' }));
    expect(detail('HandlerAdapter')).toBeTruthy();
    await closeDetail(user);
    const adapter = within(timeline()).getByRole('button', { name: /HandlerAdapter$/ });
    adapter.focus();
    await user.keyboard('[End]');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(within(timeline()).getByRole('button', { name: /HTTP yanıtının gönderilmesi$/ }).getAttribute('aria-current')).toBe('step');
    await user.keyboard('[Enter]');
    expect(detail('HTTP yanıtının gönderilmesi')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sonraki adım' }).disabled).toBe(true);
    await user.keyboard('[Escape]');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const last = within(timeline()).getByRole('button', { name: /HTTP yanıtının gönderilmesi$/ });
    expect(document.activeElement).toBe(last);
    await user.keyboard('[Home]');
    expect(within(timeline()).getByRole('button', { name: /Frontend → HTTP isteği$/ }).getAttribute('aria-current')).toBe('step');
    await user.keyboard('[ArrowRight]');
    expect(within(timeline()).getByRole('button', { name: /Tomcat ve Servlet nesneleri$/ }).getAttribute('aria-current')).toBe('step');
    await user.keyboard('[ArrowLeft][Enter]');
    expect(detail('Frontend → HTTP isteği')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Önceki adım' }).disabled).toBe(true);
    await closeDetail(user);
  });

  it('follows the curved rows with the keyboard when the available width changes', async () => {
    let resize;
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback) { this.callback = callback; }
      observe(element) { if (element.tagName === 'NAV') resize = this.callback; }
      disconnect() {}
      unobserve() {}
    });
    try {
      const user = userEvent.setup(); renderJourney();
      act(() => resize([{ contentRect: { width: 700 } }]));
      expect(within(timeline()).getAllByRole('button')).toHaveLength(15);
      within(timeline()).getByRole('button', { name: /DispatcherServlet$/ }).focus();
      // Four columns: the next row starts on the right, then continues left.
      await user.keyboard('[ArrowDown][ArrowLeft][Enter]');
      expect(detail('HandlerAdapter')).toBeTruthy();
      await closeDetail(user);
      act(() => resize([{ contentRect: { width: 400 } }]));
      within(timeline()).getByRole('button', { name: /Frontend → HTTP isteği$/ }).focus();
      // Two columns: the node below the first step is now step four.
      await user.keyboard('[ArrowDown][Enter]');
      expect(detail('DispatcherServlet')).toBeTruthy();
      await closeDetail(user);
      expect(within(timeline()).getAllByRole('button')).toHaveLength(15);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('shows validation as the 400 stop and explains why Service is skipped', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'POST · 400' }));
    expectAdjacentLayers();
    expect(screen.queryByRole('dialog')).toBeNull();
    const validation = within(timeline()).getByRole('button', { name: /Bean Validation — hata burada oluşur/ });
    expect(validation.getAttribute('aria-current')).toBe('step');
    await user.click(validation);
    expect(detail('Bean Validation').textContent).toContain('controller metodunun gövdesine girilmez');
    await closeDetail(user);
    expect(screen.getByRole('button', { name: 'POST · 400' }).getAttribute('aria-pressed')).toBe('true');
    await user.click(within(timeline()).getByRole('button', { name: /TaskService — bu senaryoda atlanır/ }));
    expect(detail('TaskService').textContent).toContain('Validation hatası MVC hazırlığında oluştu; Service’e gelinmedi.');
    const skippedTransaction = within(detail('TaskService')).getByText('Transaction’dan çıkış').closest('details');
    expect(skippedTransaction.open).toBe(false);
    await user.click(within(skippedTransaction).getByText('Transaction’dan çıkış'));
    expect(skippedTransaction.open).toBe(true);
    expect(skippedTransaction.textContent).toContain('commit/rollback yapılmaz');
    await closeDetail(user);
    await user.click(screen.getByText('Beklenen HTTP yanıtı'));
    expect(screen.getByText(/HTTP 400 Bad Request/).textContent).toContain('VALIDATION_ERROR');
  });

  it('keeps layers adjacent while retaining the 409 rule and rollback inside Service', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'PATCH · 409' }));
    expectAdjacentLayers();
    const service = within(timeline()).getByRole('button', { name: /TaskService — hata burada oluşur/ });
    expect(service.getAttribute('aria-current')).toBe('step');
    await user.click(within(timeline()).getByRole('button', { name: /Bean Validation$/ }));
    expect(primaryCode(detail('Bean Validation'))).toContain('@NotNull');
    expect(primaryCode(detail('Bean Validation'))).not.toContain('title');
    expect(detail('Bean Validation').textContent).toContain('UpdateTaskStatusRequest.java');
    await closeDetail(user);
    await user.click(service);
    expect(detail('TaskService').textContent).toContain('task.changeStatus satırı çalışmaz');
    expect(detail('TaskService').textContent).toContain('önce Repository’den kayıt okunur');
    const transactionExit = within(detail('TaskService')).getByText('Transaction’dan çıkış').closest('details');
    await user.click(within(transactionExit).getByText('Transaction’dan çıkış'));
    expect(transactionExit.open).toBe(true);
    expect(transactionExit.textContent).toContain('transaction rollback olur');
    await closeDetail(user);
    await user.click(screen.getByRole('button', { name: 'POST · Oluştur' }));
    expectAdjacentLayers();
    await user.click(within(timeline()).getByRole('button', { name: /TaskService$/ }));
    const creationRule = within(detail('TaskService')).getByText('İş kuralı ve model değişikliği').closest('details');
    await user.click(within(creationRule).getByText('İş kuralı ve model değişikliği'));
    expect(creationRule.textContent).toContain('Başlangıç durumunu istemci değil, Service OPEN olarak belirler.');
    await closeDetail(user);
  });

  it('explains the 204 body omission without pretending to serialize JSON', async () => {
    const user = userEvent.setup(); renderJourney();
    await user.click(screen.getByRole('button', { name: 'DELETE · 204' }));
    expectAdjacentLayers();
    await user.click(within(timeline()).getByRole('button', { name: /Dönüş değeri ve ResponseEntity$/ }));
    expect(detail('Dönüş değeri ve ResponseEntity').textContent).toContain('hiç body yoktur');
    const skippedMapper = within(detail('Dönüş değeri ve ResponseEntity')).getByText('MapStruct → yanıt DTO’su').closest('details');
    expect(skippedMapper.open).toBe(true);
    expect(skippedMapper.textContent).toContain('mapper çağrılmaz');
    await closeDetail(user);
    await user.click(within(timeline()).getByRole('button', { name: /HttpMessageConverter ve Jackson — bu senaryoda atlanır/ }));
    expect(detail('HttpMessageConverter ve Jackson').textContent).toContain('204 No Content için yazılacak JSON body yoktur');
    expect(primaryCode(detail('HttpMessageConverter ve Jackson'))).toBe('HTTP/1.1 204 No Content');
    await closeDetail(user);
    expect(screen.getByRole('link', { name: /Görev ekranında gerçek istekleri incele/ }).getAttribute('href')).toBe('/pages/gorevler');
  });
});
