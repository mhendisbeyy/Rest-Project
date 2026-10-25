import RequestJourneyPage from './components/RequestJourneyPage';

export const metadata = {
  title: 'Bir isteğin yolculuğu | REST Atölyesi',
  description: 'Tek frontend adımıyla HTTP isteğini gönder; Tomcat, DispatcherServlet ve backend katmanlarında isteğin yaşam döngüsünü takip et.',
};

export default function Page() { return <RequestJourneyPage />; }
