'use client';

import { useState } from 'react';
import { Button } from 'primereact/button';
import { observedFilters, optionalFilters, filterSimulation, filterModelCode, filterRegistrationCode, onceFilterCode, filterSources } from './filterChainContent';

function CodeBlock({ title, code }) {
  return <div className="journey-code"><div><h3>{title}</h3><span>Java · öğretici örnek</span></div><pre><code>{code}</code></pre></div>;
}

export default function FilterChainDetails() {
  const [mode, setMode] = useState('pass');
  const selected = filterSimulation.find(item => item.id === mode);

  return <section className="filter-chain-details" aria-labelledby="filter-details-title">
    <h3 id="filter-details-title">FilterChain’i yakından incele</h3>
    <p>Tomcat, kayıtlı filtrelerden URL/servlet eşlemesi ve dispatch türü uyanları zincire alır. Her filtre sıradakini çağırır; zincirin sonunda DispatcherServlet vardır. Bu zinciri Controller oluşturmaz.</p>
    <section className="filter-simulator" aria-label="Filtre zinciri öğretici modeli">
      <h4>İki filtreyle gidiş ve dönüş</h4><p>Bağımsız, senkron A/B modeli. A finally kullanır; B yalnızca normal dönüşte “sonra” kodunu çalıştırır. Bu model API isteği göndermez.</p>
      <div className="filter-model-options" role="group" aria-label="Filtre modeli senaryosu">{filterSimulation.map(item => <Button key={item.id} label={item.label} size="small" text={mode !== item.id} outlined={mode === item.id} aria-pressed={mode === item.id} onClick={() => setMode(item.id)} />)}</div>
      <ol className="filter-model-route" aria-label="Modeldeki bileşenler"><li><strong>A · dış filtre</strong><small>önce / finally</small></li><li><strong>B · iç filtre</strong><small>{mode === 'block' ? 'İstek burada sonlanır' : 'koşul / chain.doFilter'}</small></li><li className={mode === 'block' ? 'is-skipped' : ''}><strong>DispatcherServlet / MVC</strong><small>{mode === 'block' ? 'Bu modelde atlanır' : 'Controller hazırlığı ve çağrısı'}</small></li></ol>
      <p className="filter-model-summary" role="status">{selected.summary}</p>
      <ol className="filter-execution-trace" aria-label="Örneğin çalışma sırası">{selected.trace.map(line => <li key={line}>{line}</li>)}</ol>
      <p className="filter-model-note">{selected.note}</p>
      <details><summary>Bu modelin kodunu gör</summary><CodeBlock title="A ve B filtresinin sadeleştirilmiş gövdeleri" code={filterModelCode} /></details>
    </section>

    <details className="filter-topic" open><summary>Bizim zincirimizde neler var?</summary>
      <p>25 Ekim 2026 tarihli WAR başlatmasında Boot’un debug kaydı aşağıdaki filtreleri ve sırayı gösterdi. Küçük order değeri gidişte önce çalışır. DispatcherServlet eşlemesi <code>/</code>, bu filtrelerin URL eşlemesi <code>/*</code>.</p>
      <div className="lesson-table-scroll"><table aria-label="Başlangıç kaydında gözlenen filtreler"><thead><tr><th>Boot filtre kaydı</th><th>Order</th><th>Görevi</th></tr></thead><tbody>{observedFilters.map(filter => <tr key={filter.name}><th scope="row"><code>{filter.name}</code></th><td><code>{filter.order}</code></td><td>{filter.role}</td></tr>)}</tbody></table></div>
      <p>Bu liste Boot’un o sürüm/ayarlarla kaydettiği filtrelerin gözlemidir; her uygulamanın sabit listesi değildir. Başlangıçta <code>logging.level.web=debug</code> açıp <code>Mapping filters</code> satırından kayıtları, order ve URL’leri kontrol edebilirsin. Container’a özel ek filtreler ayrıca bulunabilir.</p>
      <h4>Eklenebilecek diğer filtreler</h4><ul>{optionalFilters.map(([name, description]) => <li key={name}><strong>{name}: </strong>{description}</li>)}</ul>
      <p>Bir özelliğin sınıfı framework’te var diye filtresi zincirde aktif sayılmaz. Örneğin JSON PATCH, FormContentFilter’ın form alanı okumasını kullanmaz; JSON’u MVC/Jackson okur.</p>
    </details>

    <details className="filter-topic"><summary>Filtreler nasıl sağlanır, kaydedilir ve sıralanır?</summary>
      <p>Gömülü Boot uygulamasında bir Filter bean’i otomatik kaydedilebilir. Sıra için filtre sınıfında <code>@Order</code>/Ordered veya kayıt nesnesinde <code>setOrder</code> kullanılır. Aşağıdaki yol URL ve dispatch kapsamını açıkça seçer.</p>
      <CodeBlock title="FilterRegistrationBean ile tek kayıt" code={filterRegistrationCode} />
      <p><code>FilterRegistrationBean</code> paketi <code>org.springframework.boot.web.servlet</code>. Bu örnekte yalnızca <code>/api/*</code> ve REQUEST eşleşir. Aynı filtreyi ayrıca @Component ile tekrar kaydetme; çift kayıt/çift çalışma riski oluşur. @Order’ı @Bean metoduna koymak filtre sırasını ayarlamak için yeterli değildir.</p>
      <p>Diğer yollar: gömülü Boot’ta <code>@WebFilter</code> + <code>@ServletComponentScan</code>; geleneksel container dağıtımında <code>web.xml</code> veya Servlet kayıt API’leri. Bir yolu seçip eşlemeyi doğrula.</p>
      <CodeBlock title="OncePerRequestFilter örneği" code={onceFilterCode} />
      <p>Bu sınıf ve kayıt yalnızca ders örneğidir; backend’e eklenmedi. Ölçüm senkron çağrı zincirine aittir; async isteğin tamamlanma süresini ölçmez. Body’yi filtreden tüketmek MVC okumasını etkileyebilir; uygun wrapper gerekir.</p>
    </details>

    <details className="filter-topic"><summary>init, doFilter, destroy ve dispatch türleri</summary>
      <ul><li><code>init</code>: filtre hizmete alınırken hazırlık.</li><li><code>doFilter</code>: eşleşen istek dispatch’i işlenirken çağrı; bir filtre örneği birden fazla isteğe aynı anda hizmet verebilir.</li><li><code>destroy</code>: hizmetten çıkarılırken kaynak temizliği.</li></ul>
      <p>REQUEST ilk giriş; FORWARD başka kaynağa yönlendirme; INCLUDE kaynağı dahil etme; ASYNC async işlem dispatch’i; ERROR hata işleme dispatch’idir. Filtre eşlemesi hangi türlerde çalışacağını belirler.</p>
      <p>OncePerRequestFilter bir already-filtered attribute’u ile tekrar çağrıyı sınırlar. ASYNC/ERROR katılımı kayıt ve sınıfın ilgili kancalarıyla ayrıca belirlenir; “her koşulda bütün HTTP yaşamı boyunca tam bir kez” diye ezberlenmez. İstek verisini filtre instance alanında tutma; yerel değişken kullan.</p>
    </details>

    <details className="filter-topic"><summary>Filter, MVC interceptor ve transaction interceptor farkı</summary>
      <div className="lesson-table-scroll"><table><thead><tr><th>Mekanizma</th><th>Çevrelediği sınır</th><th>Projede</th></tr></thead><tbody><tr><th scope="row">Servlet Filter</th><td>Container → sonraki filtre/Servlet</td><td>Yukarıdaki Boot filtreleri; özel logging henüz yok.</td></tr><tr><th scope="row">HandlerInterceptor</th><td>Seçilmiş MVC handler çevresi</td><td>Özel uygulaması kayıtlı değil.</td></tr><tr><th scope="row">TransactionInterceptor</th><td>Spring proxy’sinden geçen Service çağrısı</td><td>@Transactional TaskService.</td></tr></tbody></table></div>
      <p>MVC Advice filtre hatalarını kendiliğinden yakalamaz. response commit edildikten sonra yeni header/body yazmak geç kalabilir. chain.doFilter sonrası kod, HTTP baytlarının mutlaka henüz gönderilmediğini göstermez.</p>
    </details>

    <details className="filter-topic"><summary>Spring Security bu zincire nasıl katılacak?</summary>
      <pre className="filter-security-route">Container FilterChain → DelegatingFilterProxy → FilterChainProxy{`\n`}→ eşleşen ilk SecurityFilterChain → güvenlik filtreleri → kalan container zinciri → MVC</pre>
      <p>SecurityFilterChain ayrı bir HTTP isteği değildir; güvenlik filtresi zinciridir. Birden fazla güvenlik zinciri tanımlanırsa ilk eşleşen seçilir. Kimlik/erişim reddi MVC’ye geçişi engelleyebilir; Security kendi hata işleyicilerini kullanır. Mevcut pom.xml’de Security bağımlılığı yok; JWT ve bu köprü P5’te eklenecek.</p>
    </details>

    <div className="filter-source-links"><a href={filterSources.servlet} target="_blank" rel="noreferrer">Servlet 6.1 sözleşmesi</a><a href={filterSources.boot} target="_blank" rel="noreferrer">Boot filtre kaydı</a><a href={filterSources.once} target="_blank" rel="noreferrer">OncePerRequestFilter</a><a href={filterSources.security} target="_blank" rel="noreferrer">Security mimarisi</a></div>
  </section>;
}
