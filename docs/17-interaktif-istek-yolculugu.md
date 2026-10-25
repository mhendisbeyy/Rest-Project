# 17 — İnteraktif istek yolculuğu ekranı

Ekran: [localhost:5173/pages/istegin-yolculugu](http://localhost:5173/pages/istegin-yolculugu). Yan menüde **İsteğin yolculuğu** bağlantısı var; görev ekranındaki kısa şema da buraya götürür.

Bu sayfa öğretim amaçlı örnek akış gösterir. Senaryo seçmek API çağrısı göndermez ve PostgreSQL'e yazmaz. 42 numaralı görev temsildir. Gerçek çağrılar görev ekranındaki HTTP panelinden incelenir.

## Nasıl anlatılır?

1. GET senaryosuyla başla. Timeline'daki duraklara tıklayarak girdi/çıktı, açıklama, kod örneği ve debugger ipucunu aç.
2. DispatcherServlet → HandlerMapping → HandlerAdapter sırasını özellikle göster.
3. POST'a geç; body'nin Jackson ile DTO'ya okunmasını, validation'ı ve 201/Location dönüşünü karşılaştır.
4. POST 400 seç. Hata noktası otomatik seçilir; controller ve Service'in neden atlandığını aç.
5. PATCH 409 seç. Mevcut görevin repository'den okunmasının iş kuralından önce olduğunu, sonra rollback/Advice yolunu göster.
6. DELETE 204 seç. MapStruct ve JSON body yazımının bu senaryoda neden atlandığını aç.

Atlanan duraklar da tıklanabilir: adımın genel görevi ve bu senaryoda neden çalışmadığı birlikte açıklanır. Önceki/sonraki düğmeleriyle gezilebilir. Timeline düğmelerindeyken ↑/↓, Home/End tuşları desteklenir. İnceleme konumu, yürütme süresi veya tamamlanmış gerçek istek göstergesi değildir.

## 23 durak

| # | Durak | Ana soru |
| --- | --- | --- |
| 1 | Kullanıcı hareketi | React'te istek hangi olayla başlar? |
| 2 | Redux async thunk | pending/fulfilled/rejected neyi değiştirir? |
| 3 | Axios | URL, query, header ve body nasıl hazırlanır? |
| 4 | Next.js rewrite | 5173'teki istek 8080'e nasıl ulaşır? |
| 5 | Tomcat / Servlet nesneleri | HTTP hangi Java web nesneleriyle temsil edilir? |
| 6 | Servlet FilterChain | İstek servlet'ten önce nasıl kesilebilir veya sarılabilir? |
| 7 | DispatcherServlet | MVC bileşenlerini kim koordine eder? |
| 8 | HandlerMapping | Hangi controller metodu seçilir? |
| 9 | HandlerAdapter | Bu metot nasıl hazırlanıp çağrılır? |
| 10 | Argüman/JSON bağlama | Path, query ve JSON nasıl Java tiplerine dönüşür? |
| 11 | Bean Validation | Geçerli JSON'un alanları kurala uyuyor mu? |
| 12 | Controller | HTTP sınırı işi kime devreder? |
| 13 | Transaction proxy'si | Service çağrısının transaction sınırı nerede başlar? |
| 14 | Service | İşlem nasıl koordine edilir? |
| 15–16 | İş kuralı / Repository | Model hangi sırayla okunur ve değiştirilir? |
| 17 | MapStruct | Model hangi Java yanıt DTO'suna dönüşür? |
| 18 | Transaction'dan çıkış | Commit veya rollback ne zaman olur? |
| 19 | Exception çözümleme / Advice | Hata nasıl ProblemDetail'e çevrilir? |
| 20 | Dönüş değeri / ResponseEntity | HTTP status, header ve body nasıl seçilir? |
| 21 | HttpMessageConverter / Jackson | DTO nasıl JSON body'ye yazılır? |
| 22 | MVC / filtre zincirinden dönüş | Response istemciye nasıl geri gider? |
| 23 | Axios → Redux → ekran | Sonuç veya hata kullanıcıya nasıl görünür? |

15–16 sırası senaryoya göre değişir. POST'ta Service önce OPEN modeli oluşturur, sonra repository save çağrılır. PATCH 409'da önce mevcut kayıt okunur, sonra DONE geçiş kontrolü yapılır. Diğer duraklar da tek bir framework çağrısının alt adımları olabilir; 23 bağımsız ağ çağrısı yoktur.

## Üç farklı interceptor kavramı

- **Axios interceptor:** Tarayıcıdaki HTTP istemcisinin request/response kancası.
- **MVC HandlerInterceptor:** Seçilen handler çevresindeki MVC kancası; bu projede özel uygulaması kayıtlı değil.
- **TransactionInterceptor:** @Transactional Service çağrısını saran Spring AOP mekanizması.

Servlet Filter, MVC interceptor'ından önceki container zincirindedir. P5'teki Security/JWT bu filtre sınırında yer alacak; bu ekran güvenliğin uygulanmış olduğunu göstermez.

## DispatcherServlet'i açarken

DispatcherServlet'e front controller de. HandlerMapping'in metodu seçtiğini, HandlerAdapter'ın argümanları çözerek çağrıyı yürüttüğünü anlat. REST sonucu adapter içinde yazılabilir; her istek ViewResolver/HTML görünümü kullanmaz. [Spring MVC bileşenleri](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/special-bean-types.html).

Binding ve Bean Validation, controller metodu çağrılmadan önce hata üretebilir. @RequestBody JSON'u converter üzerinden okur; metot parametresi kısıtlarına göre farklı validation exception'ları oluşabilir. [Request body ve validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html).

Normal REST body yazıldıktan sonraki MVC postHandle aşamasını yeni response header eklemek için kullanma. Bu projede özel interceptor yok; ekran genel kancanın yerini açıklar. [MVC interception](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html).

## Kodun yeri

- [Next.js sayfası](<../frontend/app/(main)/pages/istegin-yolculugu/page.js>)
- [Etkileşimli ekran](<../frontend/app/(main)/pages/istegin-yolculugu/components/RequestJourneyPage.jsx>)
- [Açıklamalar ve senaryolar](<../frontend/app/(main)/pages/istegin-yolculugu/components/journeyContent.js>)
- [Sass stilleri](../frontend/styles/pages/istegin-yolculugu.scss)
- [Davranış testleri](../frontend/tests/journey.test.jsx)

Anlatım değiştiğinde journeyContent içindeki açıklama ve örnekleri gerçek backend davranışıyla birlikte güncelle. P5 JWT ve P6 log korelasyonu eklendiğinde filtre durağı genişletilecek. Timeline şu an canlı tracing, katman süresi veya gerçek breakpoint ölçümü içermez.

## Doğrulama

Timeline'ın 4 testi; detay açma, önceki/sonraki ve klavye gezintisi, 400'de atlanan Service/transaction, 409'da repository/kural sırası ve rollback, 204'te DTO/JSON body atlanmasını kontrol eder. Önceki 14 frontend testiyle toplam 18 test geçti; lint ve Next.js üretim build'i başarılı. Gerçek tarayıcı görsel provası, önceki Chrome erişim onayı kısıtı nedeniyle ayrıca doğrulanmış sayılmıyor.

[Yaşam döngüsü dersi](06-yasam-dongusu.md) · [Demo akışı](10-demo-akisi.md) · [İçindekiler](README.md)
