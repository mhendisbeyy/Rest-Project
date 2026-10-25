# 18 — Timeline içerik denetimi ve açıklayıcı örnekler

25 Ekim 2026'da timeline, projedeki Java/JavaScript kodu ve resmî Spring belgeleriyle karşılaştırıldı. Proje Spring Boot **4.1.2**, paketlenmiş `spring-webmvc` **7.0.10** kullanıyor. Ana çizelge **15 durak** olarak kaldı; Controller → Service → Repository doğrudan birbirini izliyor. Transaction başlangıcı, iş kuralı ve transaction çıkışı Service ayrıntısında; MapStruct yanıt ayrıntısında inceleniyor.

## Düzeltilen noktalar

| Konu | Düzeltilen anlatım / örnek |
| --- | --- |
| 400/409 yanıt örnekleri | Başarıdan kalan `201`/TaskResponse kodu kaldırıldı. Advice metodu ve seçili senaryonun ProblemDetail JSON'u gösteriliyor. |
| Tomcat örneği | Filter'a ait `doFilter` imzasının yerine Servlet request erişimleri konuldu. Method, URI, query ve header yorumları seçilen isteğe göre hesaplanıyor. |
| Query ve JSON ayrımı | GET'te `getParameter("status")` OPEN; yalnızca JSON body içeren POST/PATCH'te null. JSON'u daha sonra MVC/Jackson DTO'ya okuyor. |
| Senaryoya uygun kısıt | PATCH'te status için @NotNull, DELETE'te ID için @Positive gösteriliyor. PATCH/DELETE örneğinde POST'a ait başlık kısıtı gösterilmiyor. |
| MVC sırası | HandlerMapping/HandlerAdapter/bağlama/validation/yanıt işleme iç içe çalışır. Çizelge bunları öğretmek için ayırır; 15 bağımsız metot veya ağ isteği ölçmez. |
| Service ve Repository | PATCH 409'da önce Repository'den görev okunur, kontrol Service'e döndükten sonra DONE kuralı uygulanır. |
| Transaction | Service proxy çağrısını sarar. `readOnly` optimizasyon ipucudur; yetkilendirme kuralı değildir. `save`, flush ve commit farklı kavramlardır. |
| MapStruct | Service içinde Java modelden Java DTO üretir; JSON yazmaz. Yanıt dialogunda gösterilmesi bir anlatım gruplamasıdır. |
| Rollback | Varsayılan olarak RuntimeException/Error rollback tetikler. Commit sonrası JSON yazım hatası, tamamlanmış transaction'ı kendiliğinden geri almaz. |
| Yanıtın dönüşü | Body, adapter çalışırken yazılmış/commit edilmiş olabilir. Son durak ağ paketlerinin gönderim anını ölçmez; REST `postHandle` aşamasında header eklemek geç kalabilir. |
| DELETE 204 | Seçili kod örneği yalnızca status satırını gösterir. JSON, `null` veya `{}` gövdesi üretilmez. |

Servlet container request nesnelerini sağlar; `doFilter` ise Filter sözleşmesidir. [Servlet request API](https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/http/HttpServletRequest.html), [Filter API](https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/Filter.html).

HandlerMapping, handler ve interceptor zincirini seçer; HandlerAdapter çağrıyı ve dönüş işleme altyapısını kullanır. REST body yazımının `postHandle` öncesinde tamamlanabilmesi de bu iç içe yapının sonucudur. [Spring MVC bileşenleri](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/special-bean-types.html), [MVC interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html).

DTO doğrulaması ve metot parametresi kısıtları farklı exception türleri üretebilir. Projedeki advice hem `MethodArgumentNotValidException` hem `HandlerMethodValidationException` işler. [Spring MVC validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-validation.html).

Transaction açıklamaları Service sınırına göre okunmalıdır; okuma ipucu, dış transaction ve rollback kuralları ayrı konulardır. [Spring Data JPA transaction](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html), [Spring rollback kuralları](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html).

## Dialoglarda 27 karşılaştırma örneği

Her örnek **girdi/koşul → beklenen sonuç → neden** biçimindedir. Bunlar seçili isteğin canlı kaydı değildir. Atlanan adımlarda örneğin bu senaryoda çalışmadığı ayrıca belirtilir.

| Durak veya açılır ayrıntı | Örnekler |
| --- | --- |
| Frontend | OPEN filtresinin gerçek GET isteğine dönüşmesi |
| Tomcat | URI, query string ve Servlet parametresinin farkı |
| FilterChain | A/B filtrelerinde gidiş/dönüş sırası; kavramsal olduğu açıkça belirtilir |
| DispatcherServlet | Handler seçimi, çağrı ve yanıt koordinasyonu |
| HandlerMapping | Aynı yola GET/POST eşlemesi; yanlış metoda 405 ve Allow |
| HandlerAdapter | `findAll(OPEN, 0, 5)` çağrısının hazırlanması ve dönüşünün işlenmesi |
| Bağlama | Query → enum/int; UNKNOWN → 400; PATCH'te path, JSON ve header ayrımı |
| Validation | Boş title → VALIDATION_ERROR; negatif page → INVALID_REQUEST |
| Controller | HTTP argümanlarının Service'e aktarılması |
| Transaction ayrıntısı | GET readOnly ile POST yazma transaction'ı |
| Service | Filtreli/filtresiz repository dalı; mevcut DONE görev için PATCH 409 |
| İş kuralı ayrıntısı | DONE → DONE kabul, DONE → OPEN reddi; PUT/PATCH ortak kuralı |
| Repository | `save`/IDENTITY ile INSERT/commit ayrımı; yönetilen entity ve dirty checking |
| MapStruct ayrıntısı | Model → DTO ile DTO → JSON farkı |
| Transaction çıkışı ayrıntısı | Service içi hata ile commit sonrası hatanın farklı etkisi |
| Advice | 400/404 ayrımı ve çalışan DB önkoşulu; text/plain body → 415 |
| ResponseEntity | Sunucunun ürettiği ID ile 201/Location; boş 204 |
| Jackson | Enum'un JSON metnine dönüşmesi; hata rotasında ProblemDetail |
| Dönüş | Filtrelere kontrolün dönmesi ile ağ gönderim zamanının farkı |

`42` yazma senaryolarında temsili ID'dir. PATCH 409, bu ID'deki görevin mevcut ve DONE olduğunu varsayar. Gerçek demoda POST yanıtının döndürdüğü ID kullanılmalıdır. Senaryo seçimi veri tabanına istek göndermez.

## Gerçek kaynak koduyla karşılaştırma

Toplam **14 kaynak alıntısı**, kaynak dosyasındaki metinle boşluk farkları normalize edilerek karşılaştırıldı:

- GET için frontend `getAll`, Controller `findAll`, Service `findAll`, Repository ve Mapper: [GET örnekleri](<../frontend/app/(main)/pages/istegin-yolculugu/components/taskRequestExample.js>).
- POST/PATCH/DELETE Controller ve Service metotları ile validation/conflict advice metotları: [9 Java metodu alıntısı](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyApplicationCode.js>).
- [TaskController](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java), [TaskService](../backend/src/main/java/com/example/restworkshop/services/TaskService.java), [GlobalExceptionHandler](../backend/src/main/java/com/example/restworkshop/controllers/advice/GlobalExceptionHandler.java).
- [Adım ve senaryo içerikleri](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyContent.js>), [27 açıklayıcı örnek](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyExamples.js>), [örneklerin dialogda gösterimi](<../frontend/app/(main)/pages/istegin-yolculugu/components/JourneyExampleCards.jsx>).

MapStruct eşlemesi derlemede üretilir; HTTP JSON okuma/yazması MVC mesaj dönüştürücüsünün görevidir. [MapStruct](https://mapstruct.org/documentation/stable/reference/html/), [Spring mesaj dönüştürme](https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html).

## Doğrulama ve mevcut ortam sınırı

**19 backend testi, 23 frontend testi, ESLint ve Next.js üretim build'i başarılı.** Frontend toplamına 9 timeline testi dahildir. Yeni kontroller, 400/409 seçiliyken başarı kodu/JSON'u gösterilmemesini, POST Servlet erişimlerinin doğru olmasını, örneklerin görünmesini ve 204'te body olmamasını doğrular. Mevcut kontroller tek frontend adımı, 15 durak, bitişik katmanlar, kıvrımlı düzenin klavye davranışı ve atlanan adım açıklamalarını korur.

Backend testleri H2 test profilinde çalıştı; PostgreSQL'e yazmadı. CRUD, validation, 404/409, DONE kuralı, 405/415, 201/Location ve boş 204 davranışları otomatik testlerle doğrulandı. Bu içerik değişikliğinde Java uygulama kodu değiştirilmedi ve WAR yeniden paketlenmedi.

Timeline sayfası HTTP 200, bağlı 8 JS/CSS dosyasının tamamı 200 döndü. Next.js rewrite, backend'in aşağıda açıklanan 500 INTERNAL_ERROR yanıtını aynı şekilde iletti; çalışan PostgreSQL CRUD doğrulaması olarak sayılmadı.

Canlı PostgreSQL denetiminde backend şu ayarlarla başlatıldı: `--app.seed-data.enabled=false --spring.jpa.hibernate.ddl-auto=none`. Yalnızca GET ve salt okunur metadata sorguları kullanıldı; tablo veya kayıt oluşturulmadı/silinmedi. Bağlantı `gorevdb`, kullanıcı `gorev`, etkin şema `public`; `pg_catalog.pg_tables` sorgusunda sistem dışı tablo sayısı **0** çıktı. Sunucu logunda `relation "tasks" does not exist` görülüyor. Denetim için açılan backend işlem sonunda kapatıldı; normal geliştirme başlatma ayarları değiştirilmedi.

| Salt okunur istek | Çalışan şemada beklenen | Bu denetimde canlı sonuç |
| --- | --- | --- |
| `/api/tasks?page=0&size=5&status=OPEN` | 200 filtreli liste | 500 INTERNAL_ERROR; tasks yok |
| `/api/tasks?status=UNKNOWN` | 400 INVALID_REQUEST | 400 INVALID_REQUEST |
| `/api/tasks?page=-1&size=5` | 400 INVALID_REQUEST | 400 INVALID_REQUEST |
| `/api/tasks/0` | 400 INVALID_REQUEST | 400 INVALID_REQUEST |
| `/api/tasks/9223372036854775807` | Kayıt yoksa 404 TASK_NOT_FOUND | 500 INTERNAL_ERROR; tasks yok |
| `/api/tasks?page=1000&size=5` | 200 ve boş items | 500 INTERNAL_ERROR; tasks yok |

Bu sonuç, girdi hatalarının Service/Repository'ye ulaşmadan reddedildiğini de gösterir. Tablo eksikliği kaynak bulunamaması değildir; advice, beklenmeyen veri erişim hatasını ayrıntıları dışarı sızdırmadan 500 ProblemDetail'e çevirir. Önceki yerel GET'ten kalan sabit anlatım yanıtı, mevcut veri tabanının canlı sonucu olarak sunulmaz. Sunumdan önce PostgreSQL şeması ayrıca çalışır hale getirilmelidir.

Gerçek tarayıcıda görsel prova yapılmadı. JSDOM testleri ve HTTP/build kontrolü bu görsel kontrolün yerine sayılmıyor.

[Ekranın kullanım notları](17-interaktif-istek-yolculugu.md) · [İçindekiler](README.md)
