'use client';

import { createContext, useState } from 'react';

export const LayoutContext = createContext(null);
export function LayoutProvider({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <LayoutContext.Provider value={{ menuOpen, toggleMenu: () => setMenuOpen(value => !value), closeMenu: () => setMenuOpen(false) }}>{children}</LayoutContext.Provider>;
}
