# 20 — Servlet FilterChain ayrıntıları

[İsteğin yolculuğu ekranında](http://localhost:5173/pages/istegin-yolculugu) **Servlet FilterChain** durağını aç. Ana çizelge 15 adım olarak kaldı; Controller → Service → Repository sırası değişmedi. Filtre ayrıntıları kendi dialogunda yer alır.

## Nasıl anlatılır?

1. Tomcat’in kayıtlı filtreleri URL/servlet eşlemesi ve dispatch türüne göre zincire aldığını göster. Controller bu zinciri oluşturmaz. [Servlet 6.1, filtreler](https://jakarta.ee/specifications/servlet/6.1/jakarta-servlet-spec-6.1.html).
2. “Zincire devam” modelini seç: A önce → B önce → MVC → B sonra → A finally. Her `chain.doFilter`, kalan zinciri çağırır.
3. “Filtrede durdur” seç: B, örnek bir koşul için 400 yazıp döner; MVC’ye ulaşılmaz. Bu bağımsız örnek, timeline’ın POST validation senaryosu değildir.
4. “İşlenmemiş hata” seç: çözümlenmeden taşan exception B’nin normal sonrası kodunu atlar; A’nın finally bloğu çalışır. ERROR dispatch ayrı olabilir. MVC Advice’ın çözdüğü bir 400/409 ise zincire normal yanıt olarak dönebilir.
5. Kayıt, dispatch, lifecycle ve Security ayrıntılarını sırayla aç.

Bu model senkron kontrol akışını öğretir; gerçek HTTP çağrısı veya tracing yapmaz. Filtredeki hata doğrudan MVC Advice tarafından ele alınmış sayılmaz. Response commit edilmişse sonradan header/body değiştirmek geç olabilir.

## Bizim WAR başlatmasında gözlenen kayıtlar

25 Ekim 2026'da mevcut WAR, ayrı **8081** portunda aşağıdaki ayarlarla kısa süre başlatıldı:

```text
--server.port=8081
--app.seed-data.enabled=false
--spring.jpa.hibernate.ddl-auto=none
--logging.level.web=debug
```

Veritabanı şeması/seed yazması kapatıldı, API’ye yazma isteği gönderilmedi. Yalnızca başlangıç kaydı okundu; denetim sunucusu sonra kapatıldı. Normal 8080 ayarları değiştirilmedi.

Boot’un `Mapping filters` kaydı:

| Kayıt adı | URL | Order |
| --- | --- | --- |
| characterEncodingFilter | /* | -2147483648 |
| formContentFilter | /* | -9900 |
| requestContextFilter | /* | -105 |

Servlet kaydı `dispatcherServlet urls=[/]` idi. Bunlar o sürüm/ayarlarla gözlenen Boot kayıtlarıdır; bütün container filtrelerinin evrensel listesi değildir. Küçük order gidişte önce çalışır. [Boot Servlet/Filter kaydı ve debug görünümü](https://docs.spring.io/spring-boot/reference/web/servlet.html).

Dialogda her filtrenin görevi açıklanır. FormContentFilter form alanlarını destekler; görev API’mizin JSON body’sini DTO’ya dönüştüren MVC/Jackson’dır. CorsFilter, ForwardedHeaderFilter ve Security gibi olası ekler ayrıca işaretlenir; mevcut zincirde varmış gibi gösterilmez.

## Kayıt örneği ve lifecycle

Dialogdaki `FilterRegistrationBean<RequestTraceFilter>` örneği URL `/api/*`, dispatch REQUEST ve order 10 seçer. Filtre aynı zamanda @Component değildir; çift kayıt riskini konuş. Boot’ta filtre bean’i otomatik kaydedilebilir; sıra için filtre sınıfında @Order/Ordered veya kayıt nesnesinde setOrder kullanılır. @Bean metodunun @Order’ı filtre sırasını ayarlamak için yeterli değildir. [Boot kayıt kuralları](https://docs.spring.io/spring-boot/reference/web/servlet.html).

OncePerRequestFilter sınıf örneği süreyi yerel değişkende tutar ve finally’de senkron zincir süresini yazar. Gerçek backend’e bu sınıf veya kayıt eklenmedi. ASYNC/ERROR davranışı, registration ile ilgili filtre kancalarına bağlıdır. [OncePerRequestFilter API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/OncePerRequestFilter.html).

Lifecycle bölümünde init/doFilter/destroy, eşzamanlı istekler ve REQUEST/FORWARD/INCLUDE/ASYNC/ERROR türleri açıklanır. MVC interceptor ile Service transaction interceptor’ı ayrı sınırlar olarak karşılaştırılır.

Security bölümü P5’in yerini gösterir: container zinciri → DelegatingFilterProxy → FilterChainProxy → ilk eşleşen SecurityFilterChain. Projede Security/JWT bağımlılığı ve özel logging filtresi henüz yoktur. [Spring Security Servlet mimarisi](https://docs.spring.io/spring-security/reference/servlet/architecture.html).

## Kodun yeri

- [Dialogdaki filtre ayrıntıları ve model](../frontend/components/lessons/FilterChainDetails.jsx)
- [Gözlenen kayıtlar, model ve Java örnekleri](../frontend/components/lessons/filterChainContent.js)
- [Timeline dialoguna bağlantı](<../frontend/app/(main)/pages/istegin-yolculugu/components/JourneyStepDialog.jsx>)
- [Etkileşim testleri](../frontend/tests/architecture.test.jsx)

[Timeline kullanım notları](17-interaktif-istek-yolculugu.md) · [API ve REST ekranı](21-api-ve-rest-mimarisi.md) · [İçindekiler](README.md)
