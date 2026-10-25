# 16 — REST Atölyesi'nin YKH yapısına dönüşümü

## Sonuç ve kapsam

Görev uygulaması YKH'nin frontend/backend teknoloji ve klasör düzenine taşındı. Görev endpoint'leri, PostgreSQL tasks tablosu ve mevcut satırlar korundu. Referans YKH projeleri değiştirilmedi.

Spring Security/JWT bu dönüşümde eklenmedi. SSO, e-imza, MinIO, raporlama ve kurum entegrasyonları kapsam dışıdır.

## Frontend eşlemesi

| Önce | Şimdi |
| --- | --- |
| Vite + TypeScript | Next.js 15.5.28 App Router + JavaScript |
| src/App.tsx | app/(main)/pages/gorevler/components/TasksPage.jsx |
| src/components/TaskForm.tsx | app/(main)/pages/gorevler/Dialogs/TaskFormDialog.jsx |
| Fetch istemcisi | services/api.js, ortak Axios |
| Görev API fonksiyonları | services/taskService.js |
| Sayfa içi ortak durum | store/slices/taskSlice.js |
| HTTP geçmişi | store/slices/httpSlice.js |
| Özel HTML kontrolleri | PrimeReact DataTable, Dialog, form kontrolleri, Tag, Toast |
| Vite proxy | next.config.mjs rewrites |

React 19.3.1 korunur. PrimeReact 10.9.9/Lara Light Indigo, PrimeFlex 4, PrimeIcons 7 ve Sass kullanılır. Axios 1.20.0, Redux Toolkit 2.13.0 ve React Redux 9.3.0 sürümleri lock dosyasında kayıtlıdır.

```text
frontend/
  app/
    layout.js
    providers.js
    page.js
    (main)/
      layout.js
      pages/gorevler/
        page.js
        components/
          TasksPage.jsx
          TaskList.jsx
          TaskDetail.jsx
        Dialogs/TaskFormDialog.jsx
  components/
    RequestInspector.jsx
    LifecycleDiagram.jsx
  layout/
    layout.js
    context/layoutcontext.js
  services/
    api.js
    taskService.js
  store/
    store.js
    slices/
      taskSlice.js
      httpSlice.js
  styles/
    layout/layout.scss
    pages/gorevler.scss
  public/
  tests/
```

`(main)` URL'ye eklenmez. Kök adres /pages/gorevler'e yönlenir. Uygulama 5173 portunda kalır; browser Axios göreli /api yolunu çağırır ve Next.js sunucusu 8080'e iletir.

## Bir POST'u dosyalardan takip et

1. TaskFormDialog taslağı bileşende tutar; Kaydet'te TasksPage'e verir.
2. TasksPage, Redux createTask thunk'ını dispatch eder.
3. Thunk → taskService.create → Axios request.
4. Next.js rewrite → TaskController.create.
5. MVC JSON'u CreateTaskRequest bean'ine bağlayıp doğrular.
6. TaskService OPEN model oluşturur, Repository ile kaydeder.
7. MapStruct modeli TaskResponse'a çevirir.
8. Controller 201 + Location üretir; Jackson DTO'yu JSON'a yazar.
9. Axios yanıt/body/header/süreyi kaydeder; Redux görev detayını ve HTTP geçmişini günceller.
10. PrimeReact ekranı güncellenir; liste GET'i yenilenirken POST sonucu panelde seçili kalır.

Store modül düzeyinde singleton değildir: makeStore fabrikası provider içinde useRef ile çağrılır. Liste/filtre/detay Redux'ta; form taslağı yerel bileşendedir. Son 10 HTTP çağrısı tutulur. Ağ hatası, iptal, boş 204 ve ProblemDetail davranışı ortak Axios katmanında korunur.

## Backend eşlemesi

| Önceki paket | Yeni paket |
| --- | --- |
| controller | controllers |
| entity/Task | models/Task |
| entity/TaskStatus | enums/TaskStatus |
| repository | repositories |
| service | services |
| exception/GlobalExceptionHandler | controllers/advice/GlobalExceptionHandler |
| DTO record'ları | Getter/setter DTO sınıfları |
| Elle yanıt eşlemesi | dto/mapper/TaskMapper |

Java 21/Spring Boot 4.1.2 ve com.example.restworkshop ana paketi korunur. MapStruct 1.6.3 processor, TaskMapperImpl'i Maven compile sırasında üretir. Service mapper'ı constructor üzerinden alır. Oluşturma/güncelleme ve DONE kuralı Service'te kalır.

Paketleme WAR'dır. SpringBootServletInitializer ve provided Tomcat ile hem Maven üzerinden hem java -jar ile yerel başlatma desteklenir. Haricî uygulama sunucusu dağıtımı ayrıca denenmedi.

springdoc-openapi 3.2.0: Swagger UI /swagger-ui/index.html; şema /v3/api-docs. Şema testi görev alanlarını, POST 201/Location ve DELETE 204'ü kontrol eder.

## Korunan davranışlar

/api/tasks yolları ve JSON alanları değişmedi. Filtre/sayfalama, 201/Location, boş 204, 400/404/409 ve ProblemDetail aynı sözleşmeyi kullanır. DONE görevi PUT veya PATCH ile açmak 409'dur. Geri alınan PUT hiçbir alanı değiştirmez.

Mevcut gorevdb ve tasks tablosu korunur. Şema/veri sıfırlama yapılmadı. Seed yalnızca boş tabloda çalışır.

## Doğrulama kaydı — 25 Ekim 2026

| Kontrol | Sonuç |
| --- | --- |
| Backend testleri | 19 başarılı; önceki 18 davranış + OpenAPI |
| Frontend testleri | 14 başarılı; önceki 12 davranış + store yalıtımı/filtre regresyonu |
| ESLint | Başarılı |
| Next.js üretim build | Başarılı |
| Maven WAR paketleme | Başarılı |
| MapStruct çıktısı | Getter/setter eşlemesi üretildi |
| Swagger UI / OpenAPI | Canlı WAR üzerinden HTTP 200, beklenen şema |
| Kök yönlendirme | 307 → /pages/gorevler |
| Next.js rewrite üzerinden canlı CRUD | 201/Location, PUT/PATCH, 400/404/409, boş 204 başarılı |
| PostgreSQL veri koruması | Başlangıç/son 6 kayıt; id/title/description/status alanları birebir aynı |
| Gerçek tarayıcı görsel provası | Yapılamadı; aşağıdaki erişim sınırına bak |

Canlı test benzersiz geçici bir görev oluşturup yalnızca onu sildi. ID sayacı doğal olarak ilerler; sıfırlanmaz. Backend testleri H2; frontend testleri JSDOM ve kontrollü Axios adapter'ı kullanır.

Otomatik onay denetimi, Google Chrome erişimini uygulama için kullanım onayı olmadığı gerekçesiyle reddetti. Bu nedenle tarayıcıda görünüm/etkileşim provası doğrulanmış sayılmaz. Canlı HTTP ve otomatik test sonuçları bu sınırdan ayrıdır.

## Sonraki aşamalar

P5 yerel JWT ve USER/ADMIN yetkileri; P6 sunucu X-Request-ID/log korelasyonu. UI geçmiş UUID'si mevcut aşamada sunucu request ID'si değildir.

[Çalıştırma](02-kurulum.md) · [İlk istek](14-ilk-calisan-istek.md) · [CRUD](15-crud-ve-dogrulama.md) · [Plan](../PLAN.md)
