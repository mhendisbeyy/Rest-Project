'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

function scopeLabel(scope) {
  return scope === 'project' ? 'Projede kullanılıyor' : scope === 'framework' ? 'Framework desteği' : 'Ek öğretici örnek';
}

export default function LessonCatalog({ lesson }) {
  const [scope, setScope] = useState('all');
  const [selected, setSelected] = useState(null);
  const binding = lesson.kind === 'binding';
  const items = lesson.items.filter(item => scope === 'all' || (scope === 'project' ? item.scope === 'project' : item.scope !== 'project'));

  function openAnnotation(id) { setSelected(lesson.items.find(item => item.id === id)); }

  return <div className="reference-page">
    <header className="page-heading"><div><span className="eyebrow">REST ATÖLYESİ · KODLA ANLAT</span><h1>{lesson.title}<span>.</span></h1><p>{lesson.intro}</p></div><i className={`reference-heading-icon pi ${lesson.icon}`} aria-hidden="true" /></header>

    {binding ? <section className="reference-overview" aria-labelledby="binding-overview-title">
      <div><span className="eyebrow">İSTEĞİN PARÇALARI</span><h2 id="binding-overview-title">Hangi veri nereden geliyor?</h2><p>Bir kaynağı seçmek, listeyi filtrelemek ve JSON göndermek farklı bağlama yollarıdır.</p></div>
      <div className="binding-parts">{[
        ['path-variable', 'URL yolu', '/api/tasks/42', '@PathVariable'],
        ['request-param', 'Query', '?status=OPEN&page=0', '@RequestParam'],
        ['request-header', 'Header', 'Accept-Language: tr', '@RequestHeader'],
        ['request-body', 'Body', '{"title":"Sunumu hazırla"}', '@RequestBody'],
      ].map(([id, title, example, annotation]) => <button key={id} type="button" onClick={() => openAnnotation(id)} aria-label={`${title}: ${annotation} örneğini aç`}><span>{title}</span><code>{example}</code><strong>{annotation}<i className="pi pi-arrow-up-right" aria-hidden="true" /></strong></button>)}</div>
      <p className="reference-footnote">@GetMapping/@PostMapping isteği metoda eşler. @RequestParam/@RequestBody gibi anotasyonlar veriyi argümana bağlar. @Valid ise doğrulamayı tetikler.</p>
    </section> : <section className="reference-overview" aria-labelledby="put-patch-title">
      <div><span className="eyebrow">AYNI GÖREV · İKİ FARKLI İŞLEM</span><h2 id="put-patch-title">PUT ile PATCH arasındaki fark</h2><p>Örnek: mevcut ve OPEN bir görev. Aşağıdaki ID temsili; gerçek demoda kendi görevinin ID’sini kullan.</p></div>
      <div className="method-comparison"><div><strong>PUT /api/tasks/42</strong><pre>{'{"title":"Sunumu bitir","description":null,"status":"IN_PROGRESS"}'}</pre><p>Düzenlenebilir alanların tamamı gönderilir. description eksikse null olur; title/status zorunludur.</p></div><div><strong>PATCH /api/tasks/42</strong><pre>{'{"status":"DONE"}'}</pre><p>Yalnızca durum değişir; title ve description korunur. Bu API’nin özel JSON sözleşmesidir.</p></div></div>
      <div className="reference-definitions"><p><strong>Safe:</strong> İstemci uygulama durumunu değiştirmeyi istemez; log gibi yan etkiler olabilir.</p><p><strong>Idempotent:</strong> Tekrarın hedeflenen etkisi bir kez göndermekle aynıdır; yanıtların aynı olması gerekmez.</p></div>
      <a className="reference-source" href="https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2" target="_blank" rel="noreferrer">HTTP metot özellikleri · RFC 9110 <i className="pi pi-external-link" aria-hidden="true" /></a>
    </section>}

    <section className="reference-catalog" aria-labelledby="reference-catalog-title">
      <div className="reference-catalog-heading"><div><h2 id="reference-catalog-title">{binding ? 'Anotasyonları keşfet' : 'Metotları keşfet'}</h2><p>Kısa açıklamayı oku; HTTP, Java ve sonuç örnekleri için kartı aç.</p></div><div className="reference-filters" role="group" aria-label="Örnek kapsamı">{[['all', 'Tümü'], ['project', 'Projede kullanılanlar'], ['extra', binding ? 'Ek örnekler' : 'HEAD / OPTIONS']].map(([value, label]) => <Button key={value} label={label} text={scope !== value} outlined={scope === value} size="small" aria-pressed={scope === value} onClick={() => setScope(value)} />)}</div></div>
      <div className="reference-card-grid">{items.map(item => <button key={item.id} type="button" className={`reference-card ${item.scope === 'project' ? 'is-project' : ''}`} aria-label={`${item.name} ayrıntılarını aç`} aria-haspopup="dialog" onClick={() => setSelected(item)}>
        <div className="reference-card-top"><span className={`reference-card-icon pi ${item.icon}`} aria-hidden="true" /><Tag value={scopeLabel(item.scope)} severity={item.scope === 'project' ? 'success' : 'secondary'} /></div>
        <h3>{item.name}</h3><span className="reference-card-location">{item.location}</span><p>{item.summary}</p>
        {!binding && <div className="reference-traits"><span>Safe: {item.safe}</span><span>Idempotent: {item.idempotent}</span></div>}
        <span className="reference-card-action">İstek ve Java örneği<i className="pi pi-arrow-right" aria-hidden="true" /></span>
      </button>)}</div>
    </section>

    <aside className="reference-context"><i className="pi pi-info-circle" aria-hidden="true" /><p>{binding ? 'Projede kullanılan üç anotasyon TaskController’dan alınmıştır. Ek örnekler /ornekler altında varsayımsal metotlar gösterir; uygulamaya yeni endpoint eklemez.' : 'İlk beş metot TaskController’daki görev sözleşmesidir. HEAD/OPTIONS framework davranışını açıklar. TRACE (tanılama) ve CONNECT (tünel kurma) görev uygulamasının kapsamı dışındadır.'} Bu sayfa HTTP isteği göndermez; örnek sonuçlar canlı veritabanı yanıtı değildir.</p></aside>
    <nav className="reference-related" aria-label="İlgili dersler"><Link href="/pages/api-ve-rest">API ve REST mimarisi<i className="pi pi-globe" aria-hidden="true" /></Link><Link href={binding ? '/pages/http-metotlari' : '/pages/parametre-baglama'}>{binding ? 'HTTP metotlarını incele' : 'Parametre bağlamayı incele'}<i className="pi pi-arrow-right" aria-hidden="true" /></Link><Link href="/pages/istegin-yolculugu">İsteğin yolculuğu<i className="pi pi-sitemap" aria-hidden="true" /></Link><Link href="/pages/gorevler">Görev Yönetimi’ne dön<i className="pi pi-check-square" aria-hidden="true" /></Link></nav>

    <Dialog header={selected?.name} visible={Boolean(selected)} onHide={() => setSelected(null)} modal blockScroll closeOnEscape draggable={false} resizable={false}
      className="reference-dialog" style={{ width: '64rem', maxWidth: '95vw' }} breakpoints={{ '700px': '96vw' }} aria-describedby="reference-dialog-description"
      footer={<Button label="Kapat" outlined onClick={() => setSelected(null)} />}>
      {selected && <div className="reference-dialog-body">
        <div className="reference-dialog-meta"><Tag value={scopeLabel(selected.scope)} severity={selected.scope === 'project' ? 'success' : 'secondary'} /><span>{selected.location}</span></div>
        <p id="reference-dialog-description" className="reference-dialog-intro">{selected.summary}</p>
        {selected.scope !== 'project' && <p className="reference-example-note">{selected.scope === 'framework' ? 'Framework davranışını açıklayan örnek; canlı HTTP provası değildir.' : 'Öğretici örnek: bu endpoint ve gösterilen ek sınıflar projede tanımlı değildir.'}</p>}
        <p>{selected.explanation}</p>
        {selected.condition && <p className="reference-example-note"><strong>Önkoşul: </strong>{selected.condition}</p>}
        {selected.scope === 'project' && <p className="reference-mapping-note">TaskController ortak yolu: <code>@RequestMapping("/api/tasks")</code>{!binding && <span> · Metot eşlemesi: <code>{selected.location}</code></span>}</p>}
        <div className="reference-example-grid"><section aria-label="HTTP istek örneği"><h3>HTTP isteği</h3><pre><code>{selected.request}</code></pre></section><section aria-label="Spring MVC kod örneği"><h3>{selected.scope === 'project' ? 'Projedeki Java kodu' : 'Spring MVC karşılığı'}</h3><pre><code>{selected.code}</code></pre></section></div>
        <section className="reference-result" aria-label="Örnek sonucu"><h3>{binding ? 'Bağlanan Java değerleri' : 'Bu API’de beklenen sonuç'}</h3><pre>{selected.result}</pre></section>
        {!binding && <div className="reference-traits"><span>Safe: {selected.safe}</span><span>Idempotent: {selected.idempotent}</span></div>}
        <div className="reference-pitfall"><h3>Anlatırken vurgula</h3><p>{selected.pitfall}</p></div>
        {selected.file && <div className="reference-file"><span>Kaynak dosya</span><code>{selected.file}</code></div>}
        <a className="reference-source" href={selected.source} target="_blank" rel="noreferrer">Resmî belgeyi aç<i className="pi pi-external-link" aria-hidden="true" /></a>
      </div>}
    </Dialog>
  </div>;
}
