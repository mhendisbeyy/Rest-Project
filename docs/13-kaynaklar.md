# Kaynaklar

Sürüm seçimleri ve framework davranışı için resmî kaynaklar. Çalışan sürümlerin kaydı pom.xml ve package-lock.json'dır; güncel belge örnekleriyle proje sürümü birlikte değerlendirilmelidir.

## YKH dönüşümünde kullanılan belgeler

- [Next.js 15.x güvenlik güncellemesi](https://nextjs.org/blog/nextjs-security-update-october-14-2026) — seçilen 15.5.28 yaması.
- [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) — göreli API yolunun backend'e iletilmesi.
- [PrimeReact v10 kurulumu](https://v10.primereact.org/installation/) — tema ve bileşen kurulumu.
- [Redux Toolkit ve Next.js](https://redux.js.org/usage/nextjs) — her istek/provider için ayrı store yaklaşımı.
- [Axios hata yönetimi](https://axios-http.com/docs/handling_errors) — HTTP yanıtı ile ağ hatasının ayrımı.
- [MapStruct 1.6.3 referansı](https://mapstruct.org/documentation/stable/reference/html/) — derleme zamanı eşleme ve Spring component modeli.
- [springdoc uyumluluk tablosu](https://springdoc.org/#_what_is_the_compatibility_matrix_of_springdoc_openapi_with_spring_boot) — Spring Boot 4.1.x / springdoc 3.2.x.
- [Spring Boot WAR dağıtımı](https://docs.spring.io/spring-boot/how-to/deployment/traditional-deployment.html) — servlet initializer ve çalıştırılabilir WAR.

Yerel yapısal referanslar: D:/YerelKalkinmaHamlesiBackend/ykhclient ve D:/YerelKalkinmaHamlesiBackend/yerelkalkinmahamlesi. Kuruma ait servis veya kimlik bilgileri bu projeye taşınmamıştır.

## HTTP ve Spring MVC

- [HTTP metodları](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods) — anlam, safe/idempotent özellikleri.
- [Request mapping](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html) — yol/metod eşleme.
- [Request body ve validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html) — JSON → DTO.
- [DispatcherServlet işleme akışı](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html) — handler seçimi ve exception çözümleme.
- [Exception handling](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html) — controller advice.
- [ProblemDetail](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html) — ortak hata yanıtı.
- [ResponseEntityExceptionHandler](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/mvc/method/annotation/ResponseEntityExceptionHandler.html) — status/header koruyarak hata özelleştirme.
- [Jackson 3 EnumFeature](https://javadoc.io/static/tools.jackson.core/jackson-databind/3.1.3/tools.jackson.databind/tools/jackson/databind/cfg/EnumFeature.html) — sayısal enum reddi.
- [pgJDBC bağlantısı](https://jdbc.postgresql.org/documentation/use/) ve [Boot veri başlatma](https://docs.spring.io/spring-boot/how-to/data-initialization.html).

## P5 için Security

- [Servlet güvenlik mimarisi](https://docs.spring.io/spring-security/reference/servlet/architecture.html).
- [JWT doğrulama desteği](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html).
- [CSRF](https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html).
- [CORS entegrasyonu](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html).

P5'te yerel JWT örneği kurulacak; bu bağlantılar kurumsal SSO kurulacağı anlamına gelmez. Rol matrisi, iş kuralı ve ekran düzeni bu eğitim için seçilmiş tasarım kararlarıdır.
