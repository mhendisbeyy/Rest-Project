'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { statusOptions, statusOption } from './taskOptions';

export default function TaskList({ data, loading, busy, selectedTask, query, onQuery, onRefresh, onCreate, onSelect }) {
  return <section className="surface-card task-list" aria-label="Görevler">
    <div className="section-heading"><div><h2>Görevler</h2><span className="record-count">{data?.totalElements ?? '—'} kayıt</span></div><div className="flex gap-2">
      <Button label="Yenile" icon="pi pi-refresh" outlined size="small" disabled={loading || busy} onClick={onRefresh} />
      <Button label="Yeni görev" icon="pi pi-plus" size="small" disabled={loading || busy} onClick={onCreate} />
    </div></div>
    <div className="list-toolbar">
      <div className="field"><label htmlFor="filter-status">Durum filtresi</label><Dropdown inputId="filter-status" optionLabel="label" optionValue="value" aria-label="Durum filtresi" placeholder="Tüm durumlar" value={query.status}
        options={[{ label: 'Tüm durumlar', value: '' }, ...statusOptions]} onChange={event => onQuery({ status: event.value })} disabled={busy} /></div>
      <div className="field"><label htmlFor="page-size">Sayfa boyutu</label><Dropdown inputId="page-size" optionLabel="label" optionValue="value" aria-label="Sayfa boyutu" value={query.size}
        options={[{ label: '5 görev', value: 5 }, { label: '10 görev', value: 10 }]} onChange={event => onQuery({ size: event.value })} disabled={busy} /></div>
      <code className="parameter-hint">@RequestParam</code>
    </div>
    <DataTable value={data?.items || []} dataKey="id" loading={loading} emptyMessage="Gösterilecek görev yok." rowClassName={row => ({ 'selected-task': row.id === selectedTask?.id })}
      tableStyle={{ minWidth: '30rem' }} aria-label="Görev listesi">
      <Column header="Görev" body={row => <div className="task-name"><small>#{row.id}</small><strong>{row.title}</strong><p>{row.description || 'Açıklama eklenmemiş.'}</p></div>} />
      <Column header="Durum" body={row => <Tag value={statusOption(row.status).label} severity={statusOption(row.status).severity} />} />
      <Column header="İşlem" body={row => <Button label="Detay" icon="pi pi-arrow-up-right" text size="small" disabled={busy || loading} onClick={() => onSelect(row.id)} aria-label={`${row.title} görev detayını aç`} />} />
    </DataTable>
    <div className="table-footer"><span>{data ? `${data.totalElements} kayıttan ${data.items.length} tanesi gösteriliyor` : 'Veriler bekleniyor'}</span><div className="flex align-items-center gap-2">
      <Button icon="pi pi-arrow-left" text rounded aria-label="Önceki sayfa" disabled={busy || loading || !data || query.page === 0} onClick={() => onQuery({ page: query.page - 1 })} />
      <span>{data?.totalPages ? `${data.page + 1} / ${data.totalPages}` : '—'}</span>
      <Button icon="pi pi-arrow-right" text rounded aria-label="Sonraki sayfa" disabled={busy || loading || !data || query.page + 1 >= data.totalPages} onClick={() => onQuery({ page: query.page + 1 })} />
    </div></div>
  </section>;
}
