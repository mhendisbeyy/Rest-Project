import { configureStore } from '@reduxjs/toolkit';
import tasks from './slices/taskSlice';
import http from './slices/httpSlice';

// A new store per provider instance, never a singleton shared by Next.js requests.
export function makeStore() {
  return configureStore({ reducer: { tasks, http } });
}
