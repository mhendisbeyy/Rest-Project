'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PrimeReactProvider } from 'primereact/api';
import { makeStore } from '../store/store';
import { LayoutProvider } from '../layout/context/layoutcontext';

export default function Providers({ children }) {
  const store = useRef(null);
  if (!store.current) store.current = makeStore();
  return <Provider store={store.current}><PrimeReactProvider><LayoutProvider>{children}</LayoutProvider></PrimeReactProvider></Provider>;
}
