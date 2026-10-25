'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { restConstraints, uniformDetails, restExamples, resourceRoutes } from './restContent';

export default function ApiRestPage() {
  const [selected, setSelected] = useState(null);
  const [exampleId, setExampleId] = useState('list');
  const example = restExamples.find(item => item.id === exampleId);

  return <div className="reference-page api-rest-page">
    <header className="page-heading"><div><span className="eyebrow">REST ATÖLYESİ · MİMARİYİ KODLA İLİŞKİLENDİR</span><h1>API ve REST Mimarisi<span>.</span></h1><p>API sözleşmesini, REST’in kısıtlarını ve görev uygulamamızın bu yaklaşımı nerede kullandığını birlikte incele.</p></div><i className="reference-heading-icon pi pi-globe" aria-hidden="true" /></header>

    <section className="api-concept-grid" aria-label="API, HTTP ve REST kavramları">
      <article><span className="eyebrow">SÖZLEŞME</span><h2>API nedir?</h2><p><strong>Application Programming Interface</strong>, yazılım bileşenlerinin sunduğu işlemleri ve veri alışverişini tanımlar. Bizim dış API’miz görevlerin HTTP sözleşmesidir: yollar, metotlar, girdiler, yanıtlar ve hatalar.</p><small>Bir Java kütüphanesi de API sunabilir; bu derste HTTP API incelenir.</small></article>
      <article><span className="eyebrow">İLETİŞİM</span><h2>HTTP nerede?</h2><p>İstemci ve sunucu istek/yanıt mesajlarıyla konuşur. Method, URL, header, body ve status bu iletişimin parçalarıdır.</p><code>GET /api/tasks → 200 + JSON</code></article>
      <article><span className="eyebrow">MİMARİ YAKLAŞIM</span><h2>REST nedir?</h2><p><strong>Representational State Transfer</strong>, kaynak temsilleri ve ortak arayüz etrafında tanımlanan mimari stildir. REST’in kısıtları birlikte değerlendirilir.</p><small>JSON uygulamamızın temsil tercihidir; tek başına REST uyumu göstermez.</small></article>
    </section>

    <section className="reference-overview api-contract" aria-labelledby="api-contract-title">
      <span className="eyebrow">BİZİM SÖZLEŞMEMİZ</span><h2 id="api-contract-title">Aynı görev kaynağıyla farklı işlemler</h2>
      <p>Bu örnekler istek göndermez. Başarı yanıtları çalışan DB ve açıklanan önkoşullar için temsili gösterimdir; canlı kayıtları veya sunucu durumunu yansıtmaz.</p>
      <ol className="api-boundary-flow" aria-label="Uygulamanın HTTP sınırları"><li><strong>React / Axios</strong><small>5173’e /api/tasks</small></li><li><strong>Next.js rewrite</strong><small>HTTP isteğini iletir</small></li><li><strong>Spring görev API’si</strong><small>8080 · Controller → Service → Repository</small></li></ol>
      <div className="reference-filters" role="group" aria-label="API sözleşmesi örnekleri">{restExamples.map(item => <Button key={item.id} label={item.label} size="small" text={exampleId !== item.id} outlined={exampleId === item.id} aria-pressed={exampleId === item.id} onClick={() => setExampleId(item.id)} />)}</div>
      <p className="api-example-resource" role="status">{example.resource}</p>
      <div className="reference-example-grid"><section aria-label="API örnek isteği"><h3>HTTP isteği</h3><pre><code>{example.request}</code></pre></section><section aria-label="API örnek yanıtı"><h3>Örnek HTTP yanıtı</h3><pre><code>{example.response}</code></pre></section></div>
      <p>{example.note}</p>
    </section>

    <section className="reference-catalog" aria-labelledby="rest-constraints-title"><div className="reference-catalog-heading"><div><h2 id="rest-constraints-title">REST’in 6 kısıtı</h2><p>Beşi temel kısıt, Code on Demand isteğe bağlıdır. Kartı açıp kuralı kodumuzdaki karşılığıyla incele.</p></div><a className="reference-source" href="https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm" target="_blank" rel="noreferrer">Fielding · REST mimarisi<i className="pi pi-external-link" aria-hidden="true" /></a></div>
      <div className="reference-card-grid">{restConstraints.map(item => <button type="button" className="reference-card" key={item.id} aria-label={`${item.title} kısıtını incele`} aria-haspopup="dialog" onClick={() => setSelected(item)}><div className="reference-card-top"><i className={`reference-card-icon pi ${item.icon}`} aria-hidden="true" /><Tag value={item.status} severity={item.severity} /></div><h3>{item.title}</h3><span className="reference-card-location">{item.subtitle}</span><p>{item.rule}</p><span className="reference-card-action">Uygulamamızdaki karşılığı<i className="pi pi-arrow-right" aria-hidden="true" /></span></button>)}</div>
    </section>

    <section className="reference-overview api-project-review" aria-labelledby="rest-project-review-title"><span className="eyebrow">KAYNAK KODUNA GÖRE DEĞERLENDİRME</span><h2 id="rest-project-review-title">Biz REST yaklaşımını nasıl kullanıyoruz?</h2><p>Görevleri kaynak olarak adresliyor, istek/yanıt DTO’larıyla temsiller taşıyor ve HTTP semantiğini kullanıyoruz. Uygulamamız kaynak odaklı bir HTTP/JSON API örneğidir. Hypermedia/HATEOAS ve uygulamaya özel cache politikası geliştirme alanlarıdır.</p>
      <div className="lesson-table-scroll"><table aria-label="Görev API kaynak sözleşmesi"><thead><tr><th>Metot</th><th>Kaynak yolu</th><th>İşlem</th><th>Uygulama sonucu</th></tr></thead><tbody>{resourceRoutes.map(([method, url, operation, result]) => <tr key={method + url}><th scope="row"><code>{method}</code></th><td><code>{url}</code></td><td>{operation}</td><td>{result}</td></tr>)}</tbody></table></div>
      <p>DTO bağlama/doğrulama hataları 400; bulunamayan görev 404; DONE durumundan çıkış 409 ProblemDetail üretir. Bunlar çalışan veritabanı ve ilgili hata koşulları için API sözleşmesidir. Beklenmeyen sunucu/veri erişim hataları ayrıca 500 olabilir.</p>
      <div className="api-review-notes"><p><strong>Stateless:</strong> PostgreSQL kaynak durumunu saklar; Redux UI state’i tutar. Liste çağrısı önceki session filtresine bağımlı değildir.</p><p><strong>Hypermedia:</strong> TaskResponse’ta ilişki/action alanları yok. Frontend URL’leri taskService.js içinde kurar; tam hypermedia akışı henüz tasarlanmadı.</p><p><strong>Katman:</strong> REST’in HTTP aracı katmanları ile Controller/Service/Repository’nin kod sorumluluklarını ayrı anlat.</p><p><strong>Güvenlik:</strong> JWT P5 planıdır. Kimlik doğrulama ve REST mimari uyumu ayrı değerlendirilir.</p></div>
    </section>

    <nav className="reference-related" aria-label="İlgili dersler"><Link href="/pages/http-metotlari">HTTP metotları<i className="pi pi-send" aria-hidden="true" /></Link><Link href="/pages/parametre-baglama">Parametre bağlama<i className="pi pi-code" aria-hidden="true" /></Link><Link href="/pages/istegin-yolculugu">FilterChain ve isteğin yolculuğu<i className="pi pi-sitemap" aria-hidden="true" /></Link><Link href="/pages/gorevler">Görev Yönetimi<i className="pi pi-check-square" aria-hidden="true" /></Link></nav>

    <Dialog header={selected?.title} visible={Boolean(selected)} onHide={() => setSelected(null)} modal blockScroll closeOnEscape draggable={false} resizable={false} className="reference-dialog" style={{ width: '62rem', maxWidth: '95vw' }} breakpoints={{ '700px': '96vw' }} aria-describedby="rest-rule-description" footer={<Button label="Kapat" outlined onClick={() => setSelected(null)} />}>
      {selected && <div className="reference-dialog-body"><div className="reference-dialog-meta"><Tag value={selected.status} severity={selected.severity} /><span>{selected.subtitle}</span></div><p className="reference-dialog-intro" id="rest-rule-description">{selected.rule}</p><h3>Kaynak koduna göre uygulamamızda</h3><p>{selected.application}</p>
        {selected.id === 'uniform' && <section className="uniform-details" aria-label="Tek biçimli arayüzün dört alt kısıtı">{uniformDetails.map(part => <article key={part.title}><div><h4>{part.title}</h4><Tag value={part.status} severity={part.status === 'Eksik' ? 'warning' : 'success'} /></div><p>{part.rule}</p><p>{part.example}</p></article>)}</section>}
        <section className="api-evidence" aria-label="Kuralın uygulamadaki örneği"><h3>{selected.codeLabel}</h3><pre><code>{selected.code}</code></pre></section><div className="reference-pitfall"><h3>Anlatırken vurgula</h3><p>{selected.takeaway}</p></div><div className="reference-file"><span>İlgili kaynak</span><code>{selected.file}</code></div><a className="reference-source" href={selected.source} target="_blank" rel="noreferrer">Resmî / birincil kaynağı aç<i className="pi pi-external-link" aria-hidden="true" /></a>
      </div>}
    </Dialog>
  </div>;
}
