# 19 — HTTP metotları ve Spring MVC parametre bağlama ekranları

Görev Yönetimi ekranındaki ders bağlantılarından veya yan menüden iki rehbere ulaşılır:

- [Spring MVC Parametre Bağlama Anotasyonları](http://localhost:5173/pages/parametre-baglama)
- [HTTP Metotları](http://localhost:5173/pages/http-metotlari)

Kartlarda kısa açıklama bulunur. Kartı açınca HTTP isteği, Java kodu, örnek sonuç, sık karıştırılan noktalar ve resmî kaynak bir Dialog içinde görünür. “Projede kullanılanlar” filtresi gerçek TaskController örneklerini ayırır. Ek öğretici örnekler ve HEAD/OPTIONS ayrıca işaretlenir. Bu sayfalar API isteği göndermez; PostgreSQL bağlantısı olmadan da anlatım için kullanılabilir.

## Parametre bağlama anlatımı

Önce “Hangi veri nereden geliyor?” bölümünü göster. URL yolu, query, header ve body kutularını açarak aynı kavramların farklı veri kaynakları olduğunu anlat. Metot eşleme anotasyonları ile argüman bağlama anotasyonlarını ayır: `@GetMapping` metodu seçer; `@RequestParam` argümanı besler; `@Valid` doğrulamayı tetikler. [Spring MVC metot argümanları](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html).

| Anotasyon | Ekrandaki örnek | Durum |
| --- | --- | --- |
| @RequestParam | status/page/size → liste argümanları | Projedeki findAll |
| @PathVariable | /api/tasks/42 → Long id | Projedeki findById |
| @RequestBody | JSON → CreateTaskRequest | Projedeki create |
| @RequestHeader | Accept-Language → dil | Ek öğretici örnek |
| @ModelAttribute | Query alanları → TaskFilter nesnesi | Ek öğretici örnek |
| @CookieValue | Cookie içindeki tema değeri | Ek öğretici örnek |
| @RequestPart | Multipart JSON ve dosya parçaları | Ek öğretici örnek |
| @RequestAttribute | Önceki sunucu bileşeninin eklediği requestId | Ek öğretici örnek |
| @SessionAttribute | Mevcut session’daki tema attribute’u | Ek öğretici örnek |
| @MatrixVariable | URL segmentindeki ;gorunum=kisa | Ek öğretici örnek |

Gerçek üç örnek [TaskController](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java) kodundan alındı. `/ornekler/...` yolları ve TaskFilter gibi ek sınıflar uygulamada yoktur. Request/session attribute örneklerinin sunucuda önceden veri hazırlanması gerektiği ayrı önkoşul olarak gösterilir; bu hazırlık HTTP body’si değildir.

Sunum sırasında şunları karşılaştır:

1. GET query’sindeki `status=OPEN`, Java enum’a bağlanır. UNKNOWN dönüşemez; page=-1 ise dönüşebilir fakat @Min kısıtını geçemez.
2. `/api/tasks/42` içindeki 42 path’tedir. Görevin bulunması bağlama işi değildir; Service/Repository kontrolüdür.
3. POST JSON’unu Jackson okur. @Valid ve DTO kısıtları başlığın geçerliliğini kontrol eder. [Request body](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html).
4. Header veya cookie okumak kimlik doğrulama kurmaz. Görev projesinde JWT hâlâ P5 konusudur.
5. ModelAttribute query/form alanlarını bir nesnede toplamak; RequestPart ise multipart parçalarını okumak için örneklenir. [ModelAttribute](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html), [Multipart](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/multipart-forms.html).

## HTTP metotları anlatımı

GET/POST/PUT/PATCH/DELETE kartları projenin mevcut sözleşmesini gösterir. Örnek ID 42 canlı kayıt varsayımı değildir; yazma demosunda kendi POST yanıtından aldığın ID’yi kullan. Genel HTTP semantiği ile bu API’nin seçtiği davranış ayrıca belirtilir. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9), [PATCH için RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html).

Önce PUT/PATCH karşılaştırmasını göster: PUT için title/description/status birlikte; PATCH için yalnızca status. Description’ın PUT’ta eksikse null olması ve DONE’dan yeniden açmanın 409 üretmesi bu uygulamanın kurallarıdır. Ardından DELETE’i aç: 204’te body yoktur; ikinci silmenin 404 olması idempotent semantiğiyle çelişmez.

HEAD/OPTIONS kartları Spring MVC’nin framework desteğini anlatır. Yeni controller metodu eklenmedi; örnekler canlı doğrulama olarak sunulmaz. HEAD body göndermez ama Service sorgusu çalışabilir. OPTIONS Allow bilgisi, CORS izniyle aynı şey değildir. [Spring MVC HEAD/OPTIONS](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html).

## Dosyalar ve doğrulama

- [Parametre bağlama sayfası](<../frontend/app/(main)/pages/parametre-baglama/page.js>) ve [HTTP metotları sayfası](<../frontend/app/(main)/pages/http-metotlari/page.js>)
- [Ortak kart/dialog ekranı](../frontend/components/lessons/LessonCatalog.jsx)
- [İçerik, HTTP örnekleri ve Java alıntıları](../frontend/components/lessons/lessonContent.js)
- [Görev Yönetimi ders bağlantıları](../frontend/components/lessons/LessonLinks.jsx)
- [Rehber stilleri](../frontend/styles/pages/rehberler.scss)
- [Etkileşim testleri](../frontend/tests/lessons.test.jsx)

Yeni üç test; kapsam filtresi ve doğru dialog içeriği, PUT/PATCH ayrımı, DELETE body’si ve HEAD/OPTIONS’un framework örneği olarak sunulmasını doğrular. Toplam **26 frontend testi, ESLint ve Next.js üretim build’i başarılı**. İki yeni rehber ve Görev Yönetimi HTTP 200, her sayfanın bağlı 8 JS/CSS dosyası da 200 döndü. Altı benzersiz Java alıntısı TaskController kaynak metniyle karşılaştırıldı; yerel Markdown bağlantıları doğrulandı. Backend kodu değiştirilmedi; bu ekleme için Maven testleri yeniden çalıştırılmadı. Görsel tarayıcı provası yapılmadı.

[Request/Response dersi](04-request-response.md) · [HTTP metotları dersi](05-http-metotlari.md) · [İçindekiler](README.md)
