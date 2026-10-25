import Providers from './providers';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/pages/gorevler.scss';
import '../styles/pages/istegin-yolculugu.scss';

export const metadata = {
  title: 'REST Atölyesi',
  description: 'YKH yapısında Next.js ve Spring Boot ile bir HTTP isteğinin yolculuğu.',
  icons: { icon: '/workshop.svg' },
};

export default function RootLayout({ children }) {
  return <html lang="tr"><body><Providers>{children}</Providers></body></html>;
}
