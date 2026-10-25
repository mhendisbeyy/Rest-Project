'use client';

import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { statusOptions } from '../components/taskOptions';

export default function TaskFormDialog({ task, busy, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'OPEN');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError(null); setFieldErrors({});
    const input = { title, description: description === '' ? null : description };
    try { await onSave(task ? { ...input, status } : input); }
    catch (reason) {
      setError(reason.message || 'Görev kaydedilemedi.');
      setFieldErrors(Object.fromEntries((reason.problem?.fieldErrors || []).map(item => [item.field, item.message])));
    }
  }

  const footer = <div className="flex justify-content-end gap-2"><Button label="Vazgeç" outlined disabled={busy} onClick={onClose} />
    <Button type="submit" form="task-form" label={task ? 'Değişiklikleri kaydet' : 'Görevi oluştur'} loading={busy} /></div>;

  return <Dialog visible modal header={task ? 'Görevi düzenle' : 'Yeni görev'} footer={footer} onHide={() => { if (!busy) onClose(); }} closable={!busy} closeOnEscape={!busy}
    style={{ width: '34rem' }} breakpoints={{ '650px': '95vw' }}>
    <form id="task-form" noValidate onSubmit={submit} className="task-form">
      <p className="form-hint"><code>{task ? 'PUT' : 'POST'}</code> {task ? 'Başlık, açıklama ve durum birlikte gönderilir.' : 'Başlangıç durumu sunucuda OPEN olarak belirlenir.'}</p>
      <div className="field"><label htmlFor="task-title">Başlık *</label><InputText id="task-title" value={title} onChange={event => setTitle(event.target.value)} disabled={busy} required
        aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? 'title-error' : undefined} className={fieldErrors.title ? 'p-invalid' : ''} />
        {fieldErrors.title && <small className="field-error" id="title-error">{fieldErrors.title}</small>}</div>
      <div className="field"><label htmlFor="task-description">Açıklama</label><InputTextarea id="task-description" rows={4} autoResize value={description} onChange={event => setDescription(event.target.value)} disabled={busy}
        aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? 'description-error' : undefined} className={fieldErrors.description ? 'p-invalid' : ''} />
        {fieldErrors.description && <small className="field-error" id="description-error">{fieldErrors.description}</small>}</div>
      {task && <div className="field"><label htmlFor="task-status">Durum</label><Dropdown inputId="task-status" optionLabel="label" optionValue="value" aria-label="Durum" value={status} options={statusOptions}
        onChange={event => setStatus(event.value)} disabled={busy} invalid={Boolean(fieldErrors.status)} />
        {fieldErrors.status && <small className="field-error">{fieldErrors.status}</small>}</div>}
      {error && <div role="alert" className="form-error">{error}</div>}
    </form>
  </Dialog>;
}
