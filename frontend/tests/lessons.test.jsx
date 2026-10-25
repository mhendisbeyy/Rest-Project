import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimeReactProvider } from 'primereact/api';
import LessonCatalog from '../components/lessons/LessonCatalog';
import { bindingPage, methodsPage } from '../components/lessons/lessonContent';

function renderLesson(lesson) {
  render(<PrimeReactProvider value={{ cssTransition: false }}><LessonCatalog lesson={lesson} /></PrimeReactProvider>);
}
async function closeDialog(user) {
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Kapat', exact: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
}
function codeInDialog() {
  return within(screen.getByRole('dialog')).getByRole('region', { name: 'Spring MVC kod örneği' }).textContent;
}

describe('HTTP and Spring MVC reference lessons', () => {
  it('separates actual parameter binding from extra examples and opens the matching request and Java code', async () => {
    const user = userEvent.setup(); renderLesson(bindingPage);
    await user.click(screen.getByRole('button', { name: 'Projede kullanılanlar', exact: true }));
    expect(screen.queryByRole('button', { name: '@RequestHeader ayrıntılarını aç' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '@RequestParam ayrıntılarını aç' }));
    expect(codeInDialog()).toContain('@RequestParam(required = false) TaskStatus status');
    expect(within(screen.getByRole('dialog')).getByRole('region', { name: 'Örnek sonucu' }).textContent).toContain('TaskStatus.OPEN');
    await closeDialog(user);
    await user.click(screen.getByRole('button', { name: 'Ek örnekler', exact: true }));
    expect(screen.queryByRole('button', { name: '@RequestBody ayrıntılarını aç' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '@RequestHeader ayrıntılarını aç' }));
    expect(codeInDialog()).toContain('@RequestHeader(name = "Accept-Language"');
    expect(screen.getByRole('dialog').textContent).toContain('bu endpoint ve gösterilen ek sınıflar projede tanımlı değildir');
    await user.keyboard('[Escape]');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // The anatomy overview still opens the correct annotation when its card is filtered out.
    await user.click(screen.getByRole('button', { name: 'Body: @RequestBody örneğini aç' }));
    expect(codeInDialog()).toContain('@Valid @RequestBody CreateTaskRequest request');
  });

  it('keeps PUT replacement, PATCH status-only updates and DELETE body omission distinct', async () => {
    const user = userEvent.setup(); renderLesson(methodsPage);
    await user.click(screen.getByRole('button', { name: 'PUT ayrıntılarını aç' }));
    expect(codeInDialog()).toContain('UpdateTaskRequest request');
    expect(screen.getByRole('dialog').textContent).toContain('description gönderilmezse null');
    await closeDialog(user);
    await user.click(screen.getByRole('button', { name: 'PATCH ayrıntılarını aç' }));
    expect(codeInDialog()).toContain('UpdateTaskStatusRequest request');
    const patchResult = within(screen.getByRole('dialog')).getByRole('region', { name: 'Örnek sonucu' });
    expect(patchResult.textContent).toContain('title ve description korunur');
    expect(screen.getByRole('dialog').textContent).toContain('JSON Patch değildir');
    await closeDialog(user);
    await user.click(screen.getByRole('button', { name: 'DELETE ayrıntılarını aç' }));
    expect(codeInDialog()).toContain('ResponseEntity.noContent().build()');
    expect(within(screen.getByRole('dialog')).getByRole('region', { name: 'Örnek sonucu' }).textContent).toContain('204 No Content, body yok');
  });

  it('presents HEAD and OPTIONS as framework explanations instead of newly implemented endpoints', async () => {
    const user = userEvent.setup(); renderLesson(methodsPage);
    await user.click(screen.getByRole('button', { name: 'HEAD / OPTIONS', exact: true }));
    expect(screen.queryByRole('button', { name: 'POST ayrıntılarını aç' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'HEAD ayrıntılarını aç' }));
    expect(screen.getByRole('dialog').textContent).toContain('canlı HTTP provası değildir');
    expect(codeInDialog()).toContain('@GetMapping');
    expect(within(screen.getByRole('dialog')).getByRole('region', { name: 'Örnek sonucu' }).textContent).toContain('Yanıt body’si gönderilmez');
    await closeDialog(user);
    await user.click(screen.getByRole('button', { name: 'OPTIONS ayrıntılarını aç' }));
    expect(screen.getByRole('dialog').textContent).toContain('Allow, CORS izni anlamına gelmez');
    expect(codeInDialog()).toContain('ayrı bir OPTIONS metodu yoktur');
  });
});
