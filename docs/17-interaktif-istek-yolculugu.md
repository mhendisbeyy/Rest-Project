# 17 — İnteraktif istek yolculuğu ekranı

Ekran: [localhost:5173/pages/istegin-yolculugu](http://localhost:5173/pages/istegin-yolculugu). Yan menüde **İsteğin yolculuğu** bağlantısı var; görev ekranındaki kısa şema da buraya götürür.

Timeline, satır sonunda kıvrılarak bir alt satırda ters yönde devam eder. Numaralı noktalar ve bağlantı çizgileri akış sırasını gösterir. Kullanılabilir alanın genişliğine göre satır başına 2–6 adım yerleşir; yatay kaydırma gerekmez. Her durakta adım adı ve kısa açıklama görünür. Tıklayınca ayrıntılı açıklama, senaryo notu, girdi/çıktı, kod örneği ve debugger ipucu **PrimeReact Dialog** içinde açılır. Ana adımlar ve açılır ayrıntılarda toplam **27 karşılaştırma örneği**, girdi/koşul → beklenen sonuç → neden düzeninde anlatılır. [İçerik denetimi ve düzeltmeler](18-timeline-icerik-denetimi.md).

Frontend **tek adım** olarak gösterilir. Devamındaki 14 adım backend'in HTTP isteğini almasını, MVC hazırlığını, katmanları ve yanıt üretmesini açıklar. Varsayılan örnek:

Ana çizelgede **Controller → Service → Repository** doğrudan birbirini izler. Transaction başlangıcı, iş kuralı ve commit/rollback Service dialogundaki açılır ayrıntılardadır. MapStruct, yanıt dialogunda incelenir; gerçek eşleme yine Service içinde yapılır. Bu sadeleştirme kodun çalışma sırasını değiştirmez.

```http
GET /api/tasks?page=0&size=5&status=OPEN HTTP/1.1
Host: localhost:8080
Accept: application/json, application/problem+json
```

| İstek parçası | Backend'deki karşılığı |
| --- | --- |
| GET | HTTP metodu, handler seçimini etkiler |
| /api/tasks | TaskController sınıfındaki ortak yol + findAll @GetMapping |
| status=OPEN | @RequestParam TaskStatus status → TaskStatus.OPEN |
| page=0, size=5 | @RequestParam int page/size; @Min/@Max kısıtları |
| Host: localhost:8080 | Doğrudan backend'e gönderilen örnek isteğin hedefi |
| Accept: application/json, application/problem+json | services/api.js içinde tanımlanan yanıt türleri |
| Body / Authorization | Bu GET'te yok; çalışan API henüz kimlik bilgisi istemiyor |

GET örneğinde body veya path variable yoktur. Tomcat durağında Servlet request'in nasıl temsil edildiği; bağlama durağında gerçek TaskController.findAll argümanları gösterilir. /api/tasks/{id} ayrı findById metodudur. Sayfalı listeye path variable veya uygulamada bulunmayan dil parametresi eklenmez.

Bu sayfa görev API'sinin gerçek isteği ve projedeki kod parçalarıyla anlatım yapar. Senaryo seçmek API çağrısı göndermez ve PostgreSQL'e yazmaz. “Gerçek GET yanıtını aç” bağlantısı aynı yolu Next.js rewrite üzerinden çağırır; kullanıcı güncel yanıtı görebilir. Sabit örnek yanıt önceki yerel GET kontrolündendir; mevcut veritabanının canlı sonucu değildir. Son denetimde gorevdb içinde tasks tablosu bulunmadığı için veri okuma yanıtları 500 dönmüştür; [ortam bulguları](18-timeline-icerik-denetimi.md). Görev ekranı isteği 5173'e gönderir, rewrite 8080 backend'ine iletir.

## Nasıl anlatılır?

1. GET · Liste senaryosuyla başla. Ham isteği, query parametrelerini ve Accept header'ını göster. Altındaki gerçek kod yolu düğmelerinden ilgili sınıf/metodun dialogunu aç.
2. DispatcherServlet → HandlerMapping → HandlerAdapter sırasını özellikle göster.
3. POST'a geç; body'nin Jackson ile DTO'ya okunmasını, validation'ı ve 201/Location dönüşünü karşılaştır.
4. POST 400 seç. Hata noktası otomatik vurgulanır; tıklayıp dialogunu aç. Controller ve Service'in neden atlandığını da kendi duraklarından incele.
5. PATCH 409 seç. Service hata noktası olarak vurgulanır. Dialogdan iş kuralı ve transaction çıkışını aç; Repository okumasından sonra Service'in reddettiğini ve rollback/Advice yolunu göster.
6. DELETE 204 seç. Yanıt dialogundaki MapStruct ayrıntısını ve JSON body yazımının neden atlandığını aç.

Atlanan duraklar da tıklanabilir: adımın genel görevi ve bu senaryoda neden çalışmadığı dialogda birlikte açıklanır. Aşama düğmeleriyle istemci/MVC/işlem/dönüş gruplarına hızlı geçilebilir. ←/→ o satırın yönünü, ↑/↓ bir üst/alt satırdaki konumu takip eder. Home/End ilk/son adıma gider; Enter veya Space dialogu açar. Dialogdaki önceki/sonraki düğmeleri kronolojik sırayla ilerler; Kapat veya Esc dialogu kapatır ve odağı açıldığı durağa döndürür. İnceleme konumu, yürütme süresi veya tamamlanmış gerçek istek göstergesi değildir.

## 15 durak: tek frontend adımı ve backend

| # | Durak | Ana soru |
| --- | --- | --- |
| 1 | Frontend → HTTP isteği | İstemci backend'e hangi HTTP mesajını gönderir? |
| 2 | Tomcat / Servlet nesneleri | HTTP hangi Java web nesneleriyle temsil edilir? |
| 3 | Servlet FilterChain | İstek servlet'ten önce nasıl kesilebilir veya sarılabilir? |
| 4 | DispatcherServlet | MVC bileşenlerini kim koordine eder? |
| 5 | HandlerMapping | Hangi controller metodu seçilir? |
| 6 | HandlerAdapter | Bu metot nasıl hazırlanıp çağrılır? |
| 7 | Argüman/JSON bağlama | Path, query, header ve body nasıl okunur? |
| 8 | Bean Validation | Alanlar ve metot argümanları kısıtlara uyuyor mu? |
| 9 | Controller | HTTP sınırı işi kime devreder? |
| 10 | Service | İşlem nasıl koordine edilir? Transaction ve iş kuralları ayrıntıdadır. |
| 11 | Repository | Model nasıl okunur veya kaydedilir? |
| 12 | Exception çözümleme / Advice | Hata nasıl ProblemDetail'e çevrilir? |
| 13 | Dönüş değeri / ResponseEntity | HTTP status, header ve body nasıl seçilir? MapStruct ayrıntısı burada açılır. |
| 14 | HttpMessageConverter / Jackson | DTO nasıl JSON body'ye yazılır? |
| 15 | HTTP yanıtının gönderilmesi | MVC/filtre zincirinden nasıl geri dönülür? |

Bu çizelge katmanları sade biçimde gösterir; her nokta tek bir metot çağrısı veya 15 ayrı ağ isteği değildir. POST'ta Service önce OPEN modeli oluşturur, sonra Repository'ye kaydeder. PATCH 409'da Repository'den okunan kayıt Service'te kontrol edilir ve reddedilir. MapStruct, Service'in içinde yanıt DTO'sunu üretir; yanıt dialogunda bunun kodu gösterilir.

## Backend'de iki farklı interceptor kavramı

Servlet FilterChain durağı ayrıca Boot başlangıç kaydındaki üç filtreyi, FilterRegistrationBean örneğini, lifecycle/dispatch türlerini ve bağımsız etkileşimli zincir modelini açar. [FilterChain ders notu](20-servlet-filter-chain.md).

- **MVC HandlerInterceptor:** Seçilen handler çevresindeki MVC kancası; bu projede özel uygulaması kayıtlı değil.
- **TransactionInterceptor:** @Transactional Service çağrısını saran Spring AOP mekanizması.

Servlet Filter, MVC interceptor'ından önceki container zincirindedir. P5'teki Security/JWT bu filtre sınırında yer alacak; bu ekran güvenliğin uygulanmış olduğunu göstermez.

## Bizim kodumuzda takip edilecek metotlar

1. [Frontend görev servisi](../frontend/services/taskService.js): getAll, page/size/status değerlerini ortak request fonksiyonuna verir. Frontend timeline'da tek adımdır.
2. [TaskController](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java): findAll, gerçek @RequestParam ve sayfa kısıtlarını tanımlar; taskService.findAll çağırır.
3. [TaskService](../backend/src/main/java/com/example/restworkshop/services/TaskService.java): findAll, id ASC sıralama ve PageRequest oluşturur; filtre varsa findByStatus dalına gider.
4. [TaskRepository](../backend/src/main/java/com/example/restworkshop/repositories/TaskRepository.java): findByStatus, Page<Task> döndürür.
5. [TaskMapper](../backend/src/main/java/com/example/restworkshop/dto/mapper/TaskMapper.java): toDto(tasks.getContent()), List<TaskResponse> üretir.
6. [TaskPageResponse](../backend/src/main/java/com/example/restworkshop/dto/TaskPageResponse.java): items ve sayfalama alanlarını taşır; JSON'u Jackson yazar.

Framework duraklarındaki Servlet API ve DispatcherServlet örnekleri altyapıyı açıklar; bunlar uygulamada ayrıca yazdığımız özel filtre/controller sınıfları gibi sunulmaz.

## DispatcherServlet'i açarken

DispatcherServlet'e front controller de. HandlerMapping'in metodu seçtiğini, HandlerAdapter'ın argümanları çözerek çağrıyı yürüttüğünü anlat. REST sonucu adapter içinde yazılabilir; her istek ViewResolver/HTML görünümü kullanmaz. [Spring MVC bileşenleri](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/special-bean-types.html).

Binding ve Bean Validation, controller metodu çağrılmadan önce hata üretebilir. @RequestBody JSON'u converter üzerinden okur; metot parametresi kısıtlarına göre farklı validation exception'ları oluşabilir. [Request body ve validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html).

Normal REST body yazıldıktan sonraki MVC postHandle aşamasını yeni response header eklemek için kullanma. Bu projede özel interceptor yok; ekran genel kancanın yerini açıklar. [MVC interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html).

## Kodun yeri

- [Next.js sayfası](<../frontend/app/(main)/pages/istegin-yolculugu/page.js>)
- [Etkileşimli ekran](<../frontend/app/(main)/pages/istegin-yolculugu/components/RequestJourneyPage.jsx>)
- [Adım ayrıntısı dialogu](<../frontend/app/(main)/pages/istegin-yolculugu/components/JourneyStepDialog.jsx>)
- [Ham HTTP isteği ve açıklaması](<../frontend/app/(main)/pages/istegin-yolculugu/components/HttpRequestExample.jsx>)
- [Gerçek görev GET isteği ve kaynak kod alıntıları](<../frontend/app/(main)/pages/istegin-yolculugu/components/taskRequestExample.js>)
- [Açıklamalar ve senaryolar](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyContent.js>)
- [27 açıklayıcı örnek](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyExamples.js>)
- [POST/PATCH/DELETE ve Advice kaynak alıntıları](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyApplicationCode.js>)
- [Örneklerin dialog gösterimi](<../frontend/app/(main)/pages/istegin-yolculugu/components/JourneyExampleCards.jsx>)
- [Sass stilleri](../frontend/styles/pages/istegin-yolculugu.scss)
- [Davranış testleri](../frontend/tests/journey.test.jsx)

Anlatım değiştiğinde journeyContent içindeki açıklama ve örnekleri gerçek backend davranışıyla birlikte güncelle. P5 JWT ve P6 log korelasyonu eklendiğinde filtre durağı genişletilecek. Timeline şu an canlı tracing, katman süresi veya gerçek breakpoint ölçümü içermez.

## Doğrulama

Timeline'ın 9 temel testi; gerçek görev GET mesajı, tek frontend adımı, Controller/Service/Repository bitişikliği, ayrıntılara taşınan transaction/iş kuralı/MapStruct, kod yolu düğmeleri, dialog/klavye gezintisi ve 400/409/204 rotalarını kontrol eder. Seçili hata senaryosunda doğru Advice/ProblemDetail kodu, POST Servlet değerleri ve örneklerin görünmesi de test edilir. Ek mimari testleri FilterChain modelini ve API/REST ekranını doğrular; toplam 29 frontend testi, lint ve Next.js üretim build'i başarılı. 19 backend testi de önceki içerik denetiminde H2 üzerinde geçti. PostgreSQL kontrolünün şema sınırı ve önceki sonuçlardan farkı [denetim kaydındadır](18-timeline-icerik-denetimi.md). Gerçek tarayıcı görsel provası, önceki Chrome erişim onayı kısıtı nedeniyle ayrıca doğrulanmış sayılmıyor.

[Yaşam döngüsü dersi](06-yasam-dongusu.md) · [Demo akışı](10-demo-akisi.md) · [İçindekiler](README.md)
