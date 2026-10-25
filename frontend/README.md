# REST Atölyesi — frontend

YKH `ykhclient` düzenini izleyen Next.js App Router ve JavaScript uygulaması. Ana sayfa `/pages/gorevler`; kök adres buraya yönlenir.

`/pages/api-ve-rest`, API/HTTP/REST kavramlarını, REST’in altı kısıtını ve görev API’sindeki karşılıklarını açıklar. Hypermedia/cache geliştirme alanları ayrıca belirtilir. Timeline’daki FilterChain dialogunda gerçek Boot kayıtları, kayıt/dispatch/lifecycle ayrıntıları ve etkileşimli A/B modeli bulunur. [API/REST notu](../docs/21-api-ve-rest-mimarisi.md), [FilterChain notu](../docs/20-servlet-filter-chain.md).

Yan menüdeki `/pages/parametre-baglama` ve `/pages/http-metotlari`, 10 Spring MVC anotasyonu ile 7 HTTP metodunu açıklar. Kartlar HTTP/Java örneklerini dialogda açar; kullanılan kod ile ek öğretici örnekler ayrılır. Görev Yönetimi ekranında da bu derslerin bağlantıları bulunur. [Anlatım notları](../docs/19-http-ve-parametre-rehberleri.md).

`/pages/istegin-yolculugu`, satır sonunda kıvrılarak devam eden 15 duraklı eğitim ekranıdır: tek frontend adımı ve 14 backend durağı. Controller → Service → Repository peş peşedir; transaction ve iş kuralı Service ayrıntısında, MapStruct yanıt ayrıntısında açılır. Varsayılan gerçek GET /api/tasks?page=0&size=5&status=OPEN isteği ve kaynak kod düğmeleri korunur. “Gerçek GET yanıtını aç” bağlantısı güncel API JSON'unu gösterir. [Kullanım notları](../docs/17-interaktif-istek-yolculugu.md).

## Komutlar

Node.js 22+ ile bu klasörde:

```powershell
npm.cmd ci
npm.cmd run dev
```

Geliştirme ve üretim sunucusu `127.0.0.1:5173` portunu kullanır. Üretim için:

Geliştirme çıktısı `.next-dev/`, üretim çıktısı `.next/` altında tutulur. Böylece açık geliştirme sunucusunun JS/CSS çıktıları `build` komutuyla ezilmez. Aynı portta tek sunucu açılmalıdır.

```powershell
npm.cmd run build
npm.cmd run start
```

Backend 8080 portunda açık olmalıdır. [next.config.mjs](next.config.mjs), tarayıcıdan gelen göreli `/api/*` çağrılarını backend'e iletir. Farklı backend gerekirse sunucuyu başlatmadan önce `API_PROXY_TARGET` ortam değişkeni ayarlanır. Veri istekleri istemci bileşenindeki Redux thunk'larından Axios'a gider.

## Dosyalar

```text
app/
  layout.js                   # Tema ve sağlayıcılar
  providers.js                # Her örnek için ayrı Redux store
  page.js                     # /pages/gorevler yönlendirmesi
  (main)/
    layout.js                 # Üst/yan menü ve içerik
    pages/gorevler/
      page.js
      components/             # TasksPage, TaskList, TaskDetail
      Dialogs/                # TaskFormDialog
    pages/istegin-yolculugu/
      page.js
      components/             # RequestJourneyPage, JourneyStepDialog, HttpRequestExample, içerikler
components/                   # HTTP paneli ve yaşam döngüsü şeması
layout/context/               # Menü durumu
services/                     # Axios istemcisi ve TaskService
store/slices/                 # taskSlice, httpSlice
styles/                       # Sass
public/
tests/                        # Axios ve PrimeReact davranışları
```

Lara Light Indigo, PrimeReact 10.9.9, PrimeFlex 4 ve PrimeIcons 7 kullanılır. Form taslakları bileşende; liste, filtre, sayfa, detay seçimi Redux'tadır. HTTP geçmişi son 10 çağrıyı tutar.

`store/store.js` yalnızca `makeStore()` fabrikasını dışa aktarır. `app/providers.js`, store'u `useRef` ile kendi örneğinde oluşturur. Sunucu istekleri arasında paylaşılan singleton store yoktur.

## Kontroller

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

29 test; 204, ProblemDetail, ağ hatası, iptal, form hataları, PUT/PATCH, silme onayı, son sayfa, geçmiş seçimi, filtre, store yalıtımı, timeline ve ders ekranlarının etkileşimlerini kapsar. Timeline'ın 9 temel testi, hata senaryosuna uygun kod/JSON ve Servlet örneklerini de kontrol eder. Timeline dialoglarında 27 karşılaştırma örneği bulunur; [içerik denetimi](../docs/18-timeline-icerik-denetimi.md). Parametre/HTTP rehberlerinin 3 ve FilterChain/API-REST eklemelerinin 3 etkileşim testi vardır. JSDOM gerçek tarayıcı görsel provası değildir. DOM test dosyaları sırayla çalıştırılır; test başına süre sınırı 10 saniyedir.

Vite uygulama sunucusu kaldırıldı. `@vitejs/plugin-react` ve dolaylı Vite bağımlılığı yalnızca Vitest'in JSX test dönüşümünde kullanılır. Ürün `next dev/build/start` ile çalışır. Next.js 15.5.28 korunurken denetimde saptanan eski PostCSS alt bağımlılığı `overrides.postcss` ile güncel 8.x yamasına alınmıştır; çözülen kesin sürüm lock dosyasındadır.

[Ders notları](../docs/09-react-ekrani.md) · [YKH dönüşümü](../docs/16-ykh-yapisina-gecis.md)
