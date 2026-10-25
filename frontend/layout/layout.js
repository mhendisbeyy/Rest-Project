'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from 'primereact/button';
import { LayoutContext } from './context/layoutcontext';

export default function Layout({ children }) {
  const { menuOpen, toggleMenu, closeMenu } = useContext(LayoutContext);
  const pathname = usePathname();
  return <div className={`layout-wrapper ${menuOpen ? 'menu-open' : ''}`}>
    <header className="layout-topbar">
      <Button text icon="pi pi-bars" aria-label="Menüyü aç veya kapat" onClick={toggleMenu} />
      <Link href="/pages/gorevler" className="brand"><span className="brand-icon pi pi-code" />REST <span>Atölyesi</span></Link>
      <span className="topbar-note">Uygulamalı Spring REST eğitimi</span>
      <span className="topbar-avatar" aria-hidden="true">RA</span>
    </header>
    <aside className="layout-sidebar" aria-label="Eğitim menüsü">
      <div className="menu-caption">ÇALIŞMA ALANI</div>
      <Link href="/pages/gorevler" className={`menu-item ${pathname === '/pages/gorevler' ? 'active' : ''}`} aria-current={pathname === '/pages/gorevler' ? 'page' : undefined} onClick={closeMenu}><i className="pi pi-check-square" />Görev yönetimi</Link>
      <Link href="/pages/api-ve-rest" className={`menu-item ${pathname === '/pages/api-ve-rest' ? 'active' : ''}`} aria-current={pathname === '/pages/api-ve-rest' ? 'page' : undefined} onClick={closeMenu}><i className="pi pi-globe" />API ve REST mimarisi</Link>
      <Link href="/pages/parametre-baglama" className={`menu-item ${pathname === '/pages/parametre-baglama' ? 'active' : ''}`} aria-current={pathname === '/pages/parametre-baglama' ? 'page' : undefined} onClick={closeMenu}><i className="pi pi-code" />Parametre bağlama</Link>
      <Link href="/pages/http-metotlari" className={`menu-item ${pathname === '/pages/http-metotlari' ? 'active' : ''}`} aria-current={pathname === '/pages/http-metotlari' ? 'page' : undefined} onClick={closeMenu}><i className="pi pi-send" />HTTP metotları</Link>
      <Link href="/pages/istegin-yolculugu" className={`menu-item ${pathname === '/pages/istegin-yolculugu' ? 'active' : ''}`} aria-current={pathname === '/pages/istegin-yolculugu' ? 'page' : undefined} onClick={closeMenu}><i className="pi pi-sitemap" />İsteğin yolculuğu</Link>
      <a href="http://localhost:8080/swagger-ui/index.html" className="menu-item" target="_blank" rel="noreferrer"><i className="pi pi-book" />Swagger UI<i className="pi pi-external-link external-icon" /></a>
      <div className="sidebar-lesson"><span className="pi pi-lightbulb" /><strong>Bir istek, uçtan uca.</strong><p>Sayfa → Redux → Axios → Spring → PostgreSQL</p></div>
      
    </aside>
    {menuOpen && <button className="menu-overlay" aria-label="Menüyü kapat" onClick={closeMenu} />}
    <div className="layout-main-container"><main className="layout-main">{children}</main><footer className="layout-footer"><span>REST Atölyesi · Bir isteğin hikâyesi</span><span>Next.js · Spring Boot · PostgreSQL</span></footer></div>
  </div>;
}
