# Geliştirme planı

## Amaç ve kararlar

İş arkadaşlarına HTTP, REST, katmanlı Spring MVC ve Security anlatmak için tek Task modeliyle çalışan uygulama. Kod ve Markdown anlatımı birlikte ilerler.

- Java 21, Spring Boot 4.1.2, Maven, çalıştırılabilir WAR.
- Next.js 15.5.28 App Router ve JavaScript; React 19, PrimeReact 10.9.9, PrimeFlex 4, PrimeIcons 7, Sass.
- Redux Toolkit / React Redux; tarayıcıda Axios; frontend 5173 → rewrite → backend 8080.
- PostgreSQL `localhost:5432/gorevdb`, kullanıcı/parola `gorev` / `gorev`. H2 yalnızca otomatik testlerde.
- Ana Java paketi `com.example.restworkshop`; YKH'nin controllers/dto/models/enums/repositories/services/config/exception düzeni.
- Getter/setter DTO'ları, MapStruct 1.6.3 ile model → yanıt DTO dönüşümü. Yazma kararları Service'te.
- Security için **P5'te yerel JWT örneği**, USER ve ADMIN rolleri. Bu dönüşümde giriş/token yok.
- SSO, e-imza, MinIO, raporlama, kurum entegrasyonları ve kullanıcı kayıt sistemi kapsam dışında.
- API davranışının referansı [API sözleşmesi](docs/12-api-sozlesmesi.md).

## P0 — Plan ve anlatım iskeleti (tamamlandı)

- [x] Kapsam, model, HTTP sözleşmesi ve rol hedeflerini belirle.
- [x] Markdown dersleri, yaşam döngüsü ve sunum akışını oluştur.
- [x] Yerel araçları ve PostgreSQL bağlantısını doğrula.

## P1 — Proje kurulumu (tamamlandı; YKH dönüşümüyle güncellendi)

- [x] Java 21 / Spring Boot backend ve Maven Wrapper.
- [x] Web MVC, Data JPA, Validation ve PostgreSQL; H2 test profili.
- [x] Next.js App Router / JavaScript frontend.
- [x] 5173 ve 8080 portları, göreli /api ve Next.js rewrite.
- [x] Bağımlılık/lock dosyaları, .gitignore ve [kurulum notları](docs/02-kurulum.md).

## P2 — İlk dikey özellik: liste ve detay (tamamlandı)

- [x] Task, TaskStatus, Repository, Service, Controller ve yanıt DTO'ları.
- [x] Yalnızca boş tabloya altı örnek görev ekle; mevcut kayıtları koru.
- [x] GET liste/detay, durum filtresi ve sayfalama.
- [x] Yükleniyor, boş liste ve hata durumlarını göster.
- [x] Entity yerine yanıt DTO'su dön; MapStruct ile dönüştür.
- [x] [İlk çalışan isteği](docs/14-ilk-calisan-istek.md) kodla eşleştir.

## P3 — HTTP metodları ve request parçaları (tamamlandı)

- [x] POST, PUT, PATCH, DELETE ve transaction sınırları.
- [x] POST 201 + Location; DELETE gövdesiz 204.
- [x] DONE'dan çıkışı hem PUT hem PATCH için reddet.
- [x] Form, durum değişimi, filtre/sayfalama ve silme onayı.
- [x] Yazma yanıtını HTTP geçmişinde seçili tut; son sayfa silinince sayfayı düzelt.
- [x] MockMvc, frontend testleri ve canlı PostgreSQL/rewrite üzerinden doğrula.
- [ ] Gerçek tarayıcıda Network ve görsel etkileşim provası yap.

## P4 — Validation ve ortak hata sözleşmesi (tamamlandı)

- [x] DTO Bean Validation, bozuk JSON/enum ve path/query kontrolleri.
- [x] 400, 404, 409; ProblemDetail + code + gerektiğinde fieldErrors.
- [x] MVC advice; framework'ün 405/415 status ve header'larını koru.
- [x] Formda alan/genel hataları göster, taslağı koru.
- [x] İç stack trace göndermeyen genel 500 davranışı.
- [x] [CRUD ve doğrulama dersini](docs/15-crud-ve-dogrulama.md) güncelle.

## YKH yapısına dönüşüm (tamamlandı — 25 Ekim 2026)

- [x] Vite/TypeScript uygulamasını Next.js/JavaScript yapısına taşı.
- [x] YKH app/layout/components/Dialogs/services/store/styles düzeni.
- [x] Lara Light Indigo, PrimeReact liste/form/diyalog/bildirim bileşenleri.
- [x] Axios'a 204, ProblemDetail, ağ hatası ve iptal davranışlarını taşı.
- [x] taskSlice/httpSlice; her provider örneği için ayrı Redux store.
- [x] Java paketlerini taşı, DTO'ları bean sınıflarına dönüştür.
- [x] MapStruct mapper ve annotation processor ekle.
- [x] Çalıştırılabilir WAR; Maven ile yerel başlatma.
- [x] springdoc-openapi 3.2.0, Swagger UI ve şema testi.
- [x] Önceki 18 backend + 12 frontend testinin davranışlarını taşı.
- [x] OpenAPI ve store/filtre regresyon testleriyle toplamı 19 + 14'e çıkar.
- [x] Test/lint/Next.js build/WAR paketleme; MapStruct çıktısını kontrol et.
- [x] Canlı CRUD'da yalnızca kendi test görevini kullanıp temizle.
- [x] Başlangıçtaki 6 PostgreSQL kaydını tüm alanlarıyla karşılaştır: aynı.
- [x] README, klasör şemaları, ders notları ve P5 JWT planını güncelle.

Ayrıntı: [YKH yapısına geçiş](docs/16-ykh-yapisina-gecis.md). Görsel prova açık: Chrome erişimi otomatik onay denetiminde kullanım onayı bulunmadığı için reddedildi. HTTP ve JSDOM kontrolleri geçti; bunlar görsel prova yerine sayılmaz.

## P5 — Spring Security ve yerel JWT (sıradaki aşama)

- [ ] SecurityFilterChain, yerel kullanıcı doğrulama ve BCrypt.
- [ ] Yerel giriş, süreli/imzalı JWT üretimi ve doğrulama.
- [ ] [Yetki matrisini](docs/12-api-sozlesmesi.md#yetki-matrisi-p5-hedefi) uygula.
- [ ] Giriş ve /api/me sözleşmesini kesinleştir; Swagger'a ekle.
- [ ] Axios'ta Bearer taşıma; token saklama/yenileme ve çıkış davranışını belgele.
- [ ] Token taşıma biçimine göre CSRF yapılandırmasını açıkça gerekçelendir.
- [ ] AuthenticationEntryPoint / AccessDeniedHandler ile ProblemDetail 401/403.
- [ ] Token yok/geçersiz/süresi dolmuş ve USER/ADMIN testlerini gerçek filter zinciriyle çalıştır.
- [ ] UI'da kimlik ve rol davranışını göster; token/parolayı HTTP geçmişinde maskele.

Kabul: token yok/geçersiz/süresi dolmuş → 401; USER ile DELETE → 403; ADMIN ile DELETE → 204. Rol düğmeleri backend kontrolünün yerini almaz. P5 tamamlanana kadar bütün görev API'si kimliksiz çalışır.

## P6 — İstek/yanıt paneli ve izleme (kısmen hazır)

- [x] Bütün CRUD çağrılarını ortak Axios istemcisinden geçir.
- [x] Son 10 çağrıda URL/method/header/body/status/yanıt/süre göster.
- [x] 204, JSON hata, ağ hatası ve iptali doğru ele al.
- [x] Authorization/Cookie/Set-Cookie/CSRF header değerlerini maskele.
- [x] Sayfa → Redux → Axios → Spring → Repository/MapStruct şemasını göster.
- [x] Ayrı /pages/istegin-yolculugu ekranı: tek frontend + 14 backend durağı, kıvrımlı düzen ve detay Dialog'u; gerçek görev GET isteği, TaskController/TaskService/Repository/Mapper kaynak alıntıları ve görev CRUD senaryoları.
- [x] Timeline içerik denetimi: 14 kaynak alıntısını kodla karşılaştır, 400/409/204 ve Servlet örneklerini düzelt, dialoglara 27 karşılaştırma örneği ekle. [Denetim kaydı](docs/18-timeline-icerik-denetimi.md).
- [ ] Her isteğe X-Request-ID ekle; backend'de doğrula veya üret.
- [ ] Security'den önce tek kez kayıtlı logging filter; method/path/status/süre ve MDC temizliği.
- [ ] Response header ve ProblemDetail requestId ile log eşleşmesini test et.
- [ ] P5/P6 sonrası filter ve güvenlik breakpoint'lerini gerçek kodla eşleştir.

Kabul: tek bir istek panel, response header ve loglarda aynı sunucu request ID'siyle bulunur. Mevcut UI geçmiş kimliği sunucu request ID'si değildir; şema katman telemetrisi olarak sunulmaz.

## P7 — Doğrulama ve sunum provası

- [x] CRUD/filtre/sayfalama, validation, 404/409, PUT/PATCH DONE kuralı.
- [x] POST Location, boş DELETE, form hataları ve UI regresyonları.
- [x] 19 backend testi, 23 frontend testi (9 timeline testi dahil), lint, Next.js build; YKH dönüşümünde WAR doğrulaması.
- [x] OpenAPI JSON ve Swagger UI; gerçek WAR üzerinden HTTP kontrolü.
- [x] Veri korumasını başlangıç/son PostgreSQL alan karşılaştırmasıyla doğrula.
- [ ] Son içerik denetiminde gorevdb içinde bulunmayan tasks şemasını sunumdan önce kontrol et; güncel canlı CRUD provası yap.
- [ ] P5 sonrası gerçek security filter zinciriyle 401/403 ve ADMIN silme.
- [ ] P6 sonrası request ID eşleşmesi.
- [ ] [Demo akışını](docs/10-demo-akisi.md) gerçek tarayıcıda baştan sona prova et.

Her aşamada önce çalışan davranışı üret, sonra anlatımı güncelle. Tamamlanan çekirdek P1–P4 ve YKH dönüşümüdür; P5/P6 ve görsel prova henüz tamamlandı sayılmaz.
