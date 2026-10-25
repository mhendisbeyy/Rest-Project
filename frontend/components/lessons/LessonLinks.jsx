import Link from 'next/link';

export default function LessonLinks() {
  return <section className="lesson-shortcuts" aria-labelledby="lesson-shortcuts-heading">
    <div><span className="eyebrow">BU İŞLEMİN HTTP KARŞILIĞI</span><h2 id="lesson-shortcuts-heading">Kodu kavramlarla birlikte anlat</h2><p>REST yaklaşımını, görev API’sindeki metotları ve parametrelerin nereden bağlandığını incele.</p></div>
    <div><Link href="/pages/api-ve-rest"><i className="pi pi-globe" aria-hidden="true" /><span><strong>API ve REST Mimarisi</strong><small>API sözleşmesi · REST kısıtları · uygulamamızdaki karşılıkları</small></span><i className="pi pi-arrow-right" aria-hidden="true" /></Link><Link href="/pages/parametre-baglama"><i className="pi pi-code" aria-hidden="true" /><span><strong>Spring MVC Parametre Bağlama</strong><small>Path · query · header · body ve diğer anotasyonlar</small></span><i className="pi pi-arrow-right" aria-hidden="true" /></Link><Link href="/pages/http-metotlari"><i className="pi pi-send" aria-hidden="true" /><span><strong>HTTP Metotları</strong><small>GET · POST · PUT · PATCH · DELETE · HEAD · OPTIONS</small></span><i className="pi pi-arrow-right" aria-hidden="true" /></Link></div>
  </section>;
}
