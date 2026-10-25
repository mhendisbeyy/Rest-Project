'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { statusOptions, statusOption } from './taskOptions';

export default function TaskDetail({ task, busy, onClose, onEdit, onStatusChange, onDelete }) {
  const [status, setStatus] = useState(task.status);
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function remove() {
    try { await onDelete(); } catch { setConfirmDelete(false); }
  }
  return <section className="surface-card task-detail" aria-label="Seçili görev detayı">
    <div className="section-heading"><span className="eyebrow">GÖREV DETAYI · #{task.id}</span><Button icon="pi pi-times" text rounded aria-label="Görev detayını kapat" onClick={onClose} disabled={busy} /></div>
    <h2>{task.title}</h2><p className="task-description">{task.description || 'Bu görev için açıklama eklenmemiş.'}</p>
    <div className="flex align-items-center justify-content-between gap-2 mt-3"><Tag value={statusOption(task.status).label} severity={statusOption(task.status).severity} /><code>/api/tasks/{task.id}</code></div>
    <div className="flex gap-2 mt-4"><Button label="Düzenle PUT" icon="pi pi-pencil" outlined size="small" onClick={onEdit} disabled={busy} />
      <Button label="Sil DELETE" icon="pi pi-trash" outlined severity="danger" size="small" onClick={() => setConfirmDelete(true)} disabled={busy} /></div>
    <form className="status-form" onSubmit={event => { event.preventDefault(); onStatusChange(status); }}>
      <label htmlFor="patch-status">Yeni durum</label><div className="flex gap-2"><Dropdown inputId="patch-status" optionLabel="label" optionValue="value" aria-label="Yeni durum" value={status} options={statusOptions} onChange={event => setStatus(event.value)} disabled={busy} />
        <Button type="submit" label="Durumu değiştir PATCH" outlined size="small" disabled={busy} /></div>
      <small>Yalnızca status gönderilir. DONE görev yeniden açılamaz.</small>
    </form>
    <Dialog visible={confirmDelete} onHide={() => { if (!busy) setConfirmDelete(false); }} header="Görevi sil" modal closable={!busy} closeOnEscape={!busy}
      style={{ width: '29rem' }} breakpoints={{ '600px': '94vw' }} footer={<div className="flex justify-content-end gap-2"><Button label="Vazgeç" outlined disabled={busy} onClick={() => setConfirmDelete(false)} /><Button label="Evet, sil" severity="danger" loading={busy} onClick={remove} /></div>}>
      <p>“{task.title}” silinecek. Devam edilsin mi?</p>
    </Dialog>
  </section>;
}
