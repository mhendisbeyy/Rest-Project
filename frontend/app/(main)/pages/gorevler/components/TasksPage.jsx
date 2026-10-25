'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { changeQuery, clearDetail, clearError, createTask, loadTask, loadTasks, refreshTasks, removeTask, updateStatus, updateTask } from '../../../../../store/slices/taskSlice';
import RequestInspector from '../../../../../components/RequestInspector';
import LifecycleDiagram from '../../../../../components/LifecycleDiagram';
import LessonLinks from '../../../../../components/lessons/LessonLinks';
import TaskList from './TaskList';
import TaskDetail from './TaskDetail';
import TaskFormDialog from '../Dialogs/TaskFormDialog';

export default function TasksPage() {
  const dispatch = useDispatch();
  const state = useSelector(store => store.tasks);
  const { page, size, status, reloadKey, selectList, selectedTask, notice } = state;
  const [form, setForm] = useState(null);
  const detailRequest = useRef(null);
  const toast = useRef(null);

  useEffect(() => {
    const running = dispatch(loadTasks({ page, size, status, select: selectList }));
    return () => running.abort();
  }, [dispatch, page, size, status, reloadKey, selectList]);
  useEffect(() => () => detailRequest.current?.abort(), []);
  useEffect(() => {
    if (notice) toast.current?.show({ severity: 'success', summary: notice.text, life: 4000 });
  }, [notice]);

  function changeList(query) { detailRequest.current?.abort(); dispatch(changeQuery(query)); }
  function openDetail(id) { detailRequest.current?.abort(); detailRequest.current = dispatch(loadTask(id)); }
  function closeDetail() { detailRequest.current?.abort(); dispatch(clearDetail()); }
  function openForm(value) { dispatch(clearError()); setForm(value); }
  async function save(input) {
    if (form.mode === 'create') await dispatch(createTask(input)).unwrap();
    else await dispatch(updateTask({ id: form.task.id, body: input })).unwrap();
    setForm(null);
  }

  return <>
    <Toast ref={toast} position="top-right" />
    <div className="page-heading"><div><span className="eyebrow">REACT + SPRING BOOT · UYGULAMALI EĞİTİM</span><h1>Bir istekle başlar<span>.</span></h1><p>Görev oluştur, düzenle ve tamamla. Her hareketin HTTP karşılığını incele.</p></div><span className="lesson-badge"><i className="pi pi-code" />GET · POST · PUT · PATCH · DELETE</span></div>
    <div className="workspace-label"><span><i className="pi pi-database" /> PostgreSQL · gorevdb</span><code>Sayfa → Redux → Axios → Spring</code></div>
    {state.error && !form && <div className="error-banner" role="alert"><span>{state.error.message}</span><Button label="Listeyi yenile" text severity="danger" size="small" disabled={state.mutating} onClick={() => dispatch(refreshTasks())} /></div>}
    <div className="workspace"><div className="task-column"><TaskList data={state.data} loading={state.loading}
      busy={state.mutating || state.detailLoading || Boolean(form)} selectedTask={selectedTask} query={{ page, size, status }} onQuery={changeList}
      onRefresh={() => dispatch(refreshTasks())} onCreate={() => openForm({ mode: 'create' })} onSelect={openDetail} />
      {state.detailLoading && <p role="status" className="detail-loading">Görev detayı yükleniyor…</p>}
      {selectedTask && <TaskDetail key={`${selectedTask.id}-${selectedTask.status}`} task={selectedTask} busy={state.mutating || state.loading || state.detailLoading || Boolean(form)} onClose={closeDetail}
        onEdit={() => openForm({ mode: 'edit', task: selectedTask })}
        onStatusChange={value => { dispatch(updateStatus({ id: selectedTask.id, status: value })); }}
        onDelete={() => dispatch(removeTask(selectedTask.id)).unwrap()} />}
    </div><RequestInspector /></div>
    <LessonLinks />
    <LifecycleDiagram />
    {form && <TaskFormDialog key={form.mode === 'edit' ? `edit-${form.task.id}` : 'create'} task={form.mode === 'edit' ? form.task : null} busy={state.mutating || state.loading} onSave={save} onClose={() => setForm(null)} />}
  </>;
}
