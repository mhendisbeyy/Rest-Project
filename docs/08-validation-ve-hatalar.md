# 08 — Validation ve hata yönetimi

## Hedef

Katılımcı bozuk giriş, kaynak bulunamaması, iş kuralı ihlali ve güvenlik reddini birbirinden ayırabilsin.

Mevcut kodda 400/404/409, alan hataları, 405/415 durumlarının korunması ve genel 500 yanıtı uygulanıyor. 401/403, Security aşamasının hedefidir. `requestId` P6'da ekleneceğinden şu anki yanıtlarda yoktur; aşağıdaki ortak örnek nihai biçimi gösterir.

## Giriş doğrulaması ile iş kuralı

Başlığın boş olmaması giriş doğrulamasıdır. DTO üzerinde `@NotBlank` kullanılır ve controller argümanı `@Valid` ile doğrulanır. Boş title isteği 400 olur; Service'e gitmesi gerekmez.

DONE görevin yeniden açılamaması iş kuralıdır. İstek biçim olarak geçerlidir, ancak mevcut görev durumuyla çelişir. Service bunu kontrol eder; bu projede 409 seçiyoruz.

Bozuk JSON veya `status: "BILINMEYEN"` ise DTO oluşturma/dönüşüm hatasıdır. İstemci geçerli enum değeri göndermelidir; yanıt 400 olur.

## Hata matrisi

| Örnek | Sonuç | İşleyen yer |
| --- | --- | --- |
| Boş title | 400 VALIDATION_ERROR | MVC validation + advice |
| Bozuk JSON / geçersiz enum | 400 INVALID_REQUEST | MVC dönüşümü + advice |
| page=-1 veya size=100 | 400 INVALID_REQUEST | Parametre doğrulaması + advice |
| Var olmayan görev | 404 TASK_NOT_FOUND | Service + advice |
| DONE → OPEN | 409 TASK_STATE_CONFLICT | Service + advice |
| Token yok/geçersiz/süresi dolmuş (P5) | 401 UNAUTHENTICATED | Security |
| USER token’ı ile DELETE (P5) | 403 ACCESS_DENIED | Security |

Güvenlik ile MVC farklı giriş noktalarından aynı yanıt sözleşmesini üretir. Genel bir exception handler bütün hataları 200 veya 500'e çevirmemeli; framework'ün 405/415 gibi anlamlı HTTP durumları korunmalı.

## Ortak yanıt

Spring'in `ProblemDetail` desteği kullanılıyor. Standart alanlar: type, title, status, detail, instance. Projeye özel mevcut alanlar code ve gerektiğinde fieldErrors; requestId daha sonra eklenecek.

```json
{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "Tamamlanmış görev yeniden açılamaz.",
  "instance": "/api/tasks/5",
  "code": "TASK_STATE_CONFLICT",
  "requestId": "egitim-003"
}
```

Bu örnek hedef çıktıdır. HTTP status ile body'deki status aynı olmalı; Content-Type `application/problem+json` olmalı. Hata yanıtında da request ID response header'ında bulunmalı.

## Kodlama tercihleri

`GlobalExceptionHandler`, `@RestControllerAdvice` ile MVC hatalarını yönetiyor. `ResponseEntityExceptionHandler` altyapısı ve createResponseEntity aşaması kullanılarak varsayılan HTTP status/header'ları korunuyor. Hem MethodArgumentNotValidException hem HandlerMethodValidationException işleniyor; path kısıtı olan PUT/PATCH metodlarındaki body hataları da alan mesajı üretiyor. İç stack trace istemciye dönmüyor.

Axios ortak istemcisi hata HTTP yanıtındaki ProblemDetail'i koruyor; alan hatalarını formda, diğer hataları ilgili hata alanında gösteriyor. Ağ hatasında HTTP yanıtı gelmeyebilir; sahte bir 500 status'u üretilmiyor. [Uygulamalı örnekler](15-crud-ve-dogrulama.md).

## Canlı gösterim

1. Boş title gönder; 400 ve fieldErrors göster. Bu aşamada kimlik bilgisi gerekmez.
2. Olmayan ID'yi oku; 404 göster.
3. Görevi DONE yap; OPEN'a çevirmeyi dene; 409 göster.
4. Son GET ile görev durumunun DONE kaldığını doğrula.
5. P5 tamamlandığında aynı biçimdeki Security hatasını aç; advice breakpoint'inin bu hatayı yönetmediğini göster.

Kaynak: [Spring request body validation](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html), [Spring exception handling](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-exceptionhandler.html), [ProblemDetail desteği](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html).

[Önceki: Spring Security](07-spring-security.md) · [Sonraki: React ekranı](09-react-ekrani.md)
