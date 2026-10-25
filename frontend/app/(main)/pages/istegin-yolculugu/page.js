import RequestJourneyPage from './components/RequestJourneyPage';

export const metadata = {
  title: 'Bir isteğin yolculuğu | REST Atölyesi',
  description: 'Tarayıcıdan DispatcherServlet ve PostgreSQL’e, JSON yanıttan ekrana adım adım HTTP yaşam döngüsü.',
};

export default function Page() { return <RequestJourneyPage />; }
