import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import taskService from '../../services/taskService';
import { recordExchange } from './httpSlice';

async function perform(operation, thunkApi, select = true) {
  try {
    const result = await operation();
    if (!thunkApi.signal.aborted) thunkApi.dispatch(recordExchange({ exchange: result.exchange, select }));
    return result.data;
  } catch (error) {
    if (axios.isCancel(error)) throw error;
    if (error.exchange && !thunkApi.signal.aborted) thunkApi.dispatch(recordExchange({ exchange: error.exchange, select }));
    return thunkApi.rejectWithValue({ message: error.message || 'İşlem tamamlanamadı.', problem: error.problem || null });
  }
}

export const loadTasks = createAsyncThunk('tasks/list', (query, thunkApi) =>
  perform(() => taskService.getAll(query, thunkApi.signal), thunkApi, query.select));
export const loadTask = createAsyncThunk('tasks/detail', (id, thunkApi) =>
  perform(() => taskService.getById(id, thunkApi.signal), thunkApi));
export const createTask = createAsyncThunk('tasks/create', (body, thunkApi) =>
  perform(() => taskService.create(body), thunkApi));
export const updateTask = createAsyncThunk('tasks/update', ({ id, body }, thunkApi) =>
  perform(() => taskService.update(id, body), thunkApi));
export const updateStatus = createAsyncThunk('tasks/status', ({ id, status }, thunkApi) =>
  perform(() => taskService.updateStatus(id, status), thunkApi));
export const removeTask = createAsyncThunk('tasks/delete', (id, thunkApi) =>
  perform(() => taskService.delete(id), thunkApi));

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    data: null, selectedTask: null, status: '', page: 0, size: 5, reloadKey: 0,
    loading: true, detailLoading: false, mutating: false, error: null, notice: null,
    listRequestId: null, detailRequestId: null, selectList: true,
  },
  reducers: {
    changeQuery(state, { payload }) {
      if ('status' in payload) { state.status = payload.status; state.page = 0; }
      if ('size' in payload) { state.size = payload.size; state.page = 0; }
      if ('page' in payload) state.page = payload.page;
      state.selectedTask = null;
      state.error = null;
      state.notice = null;
      state.loading = true;
      state.selectList = true;
      state.reloadKey++;
    },
    refreshTasks(state) {
      state.loading = true;
      state.error = null;
      state.notice = null;
      state.selectList = true;
      state.reloadKey++;
    },
    clearDetail(state) { state.selectedTask = null; state.detailRequestId = null; state.detailLoading = false; },
    clearError(state) { state.error = null; },
  },
  extraReducers(builder) {
    builder
      .addCase(loadTasks.pending, (state, action) => { state.loading = true; state.listRequestId = action.meta.requestId; })
      .addCase(loadTasks.fulfilled, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        if (state.page > 0 && action.payload.items.length === 0) {
          state.page = Math.max(0, action.payload.totalPages - 1);
        } else { state.data = action.payload; state.loading = false; }
      })
      .addCase(loadTasks.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId || action.meta.aborted) return;
        state.loading = false;
        state.data = null;
        state.error = action.payload || { message: 'Görevler alınamadı.' };
      })
      .addCase(loadTask.pending, (state, action) => {
        state.detailLoading = true; state.error = null; state.detailRequestId = action.meta.requestId;
      })
      .addCase(loadTask.fulfilled, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detailLoading = false; state.selectedTask = action.payload;
      })
      .addCase(loadTask.rejected, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId || action.meta.aborted) return;
        state.detailLoading = false; state.error = action.payload || { message: 'Görev detayı alınamadı.' };
      });

    for (const [thunk, verb] of [[createTask, 'oluşturuldu'], [updateTask, 'güncellendi'], [updateStatus, 'durumu güncellendi'], [removeTask, 'silindi']]) {
      builder.addCase(thunk.pending, state => { state.mutating = true; state.error = null; state.notice = null; });
      builder.addCase(thunk.fulfilled, (state, action) => {
        const id = thunk === removeTask ? action.meta.arg : action.payload.id;
        state.mutating = false;
        state.selectedTask = thunk === removeTask ? null : action.payload;
        state.notice = { id: action.meta.requestId, text: `Görev #${id} ${verb}.` };
        state.loading = true;
        state.selectList = false;
        state.reloadKey++;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.mutating = false; state.error = action.payload || { message: 'İşlem tamamlanamadı.' };
      });
    }
  },
});

export const { changeQuery, refreshTasks, clearDetail, clearError } = taskSlice.actions;
export default taskSlice.reducer;
