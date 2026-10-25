import Link from 'next/link';

const steps = [
  ['Next.js sayfası', 'Kullanıcı hareketi'], ['Redux', 'Durum ve async thunk'], ['Axios servis', 'HTTP isteği'],
  ['Controller', 'Girdi ve doğrulama'], ['Service', 'İş kuralı'], ['Repository', 'PostgreSQL sorgusu'], ['MapStruct', 'Yanıt DTO’su'],
];

export default function LifecycleDiagram() {
  return <section className="surface-card lifecycle" id="yasam-dongusu"><div className="section-heading"><div><span className="eyebrow">PERDE ARKASINDA</span><h2>Bir isteğin yolculuğu</h2></div><i className="pi pi-sitemap" /></div>
    <ol>{steps.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{title}</strong><small>{description}</small></li>)}</ol>
    <p>Sadeleştirilmiş akış: Spring MVC dönüş DTO’sunu JSON’a çevirir; Axios yanıtı Redux ve ekrana taşır. Şema gerçek aşama sürelerini göstermez.</p>
    <p><Link href="/pages/istegin-yolculugu" className="journey-source">DispatcherServlet ve tüm adımları interaktif timeline’da incele <i className="pi pi-arrow-right" aria-hidden="true" /></Link></p>
  </section>;
}
