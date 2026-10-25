# 01 — HTTP ve REST

## Hedef

Katılımcı, React'in sunucuya hangi bilgileri gönderdiğini ve sunucunun ne döndürdüğünü açıklayabilsin. HTTP protokolü, REST yaklaşımı ve Spring'in rolünü ayırsın.

## Açılış örneği

“Görev Ekle'ye bastığımda React veritabanına doğrudan yazmaz. Bir HTTP isteği gönderir. Sunucu isteği değerlendirir ve bir HTTP yanıtı üretir.”

```text
React → HTTP isteği → Spring Boot uygulaması → Veritabanı
React ← HTTP yanıtı ← Spring Boot uygulaması ← Veritabanı
```

İstek; method, hedef URL, header'lar ve varsa body içerir. Yanıt; status code, header'lar ve varsa body içerir. `204` ve HEAD gibi örneklerde body bulunmaz.

## REST'i nasıl konumlandıracağız?

HTTP iletişim protokolüdür. REST ise kaynaklar, temsiller, tek biçimli arayüz, stateless iletişim, cache ve katmanlar gibi kısıtlarla tanımlanan bir mimari yaklaşımdır. JSON göndermek tek başına REST anlamına gelmez.

Biz görevleri kaynak olarak ele alacağız: `/api/tasks` bir koleksiyon, `/api/tasks/5` belirli bir görevdir. Aynı kaynağa farklı HTTP metodlarıyla farklı anlamlarda erişeceğiz. Örneğin `GET /api/tasks/5` okur, `DELETE /api/tasks/5` siler.

Bu eğitim kaynak odaklı API tasarımına odaklanır. Mevcut görev API’si kimliksiz çalışır; P5’te yerel JWT örneği eklenecek. REST’in bütün kısıtlarını uyguladığımızı iddia etmek yerine kaynak, temsil ve HTTP semantiğini somut örneklerle anlatırız.

## Spring ve Spring Boot nerede?

- Spring MVC, isteği ilgili controller metoduna bağlar ve HTTP ile Java nesneleri arasındaki dönüşümü yürütür.
- Spring'in dependency injection mekanizması Controller, Service ve Repository bağımlılıklarını bağlar.
- Spring Boot, uygulama yapılandırmasını ve çalıştırmayı kolaylaştırır; gömülü servlet container ile uygulamayı başlatır.
- Spring Security, kimlik ve erişim kontrollerini filtre zincirine yerleştirir.

## Canlı gösterim

1. Görev listesi ekranını aç ve Network panelini temizle.
2. Listeyi yenile; `GET /api/tasks` çağrısını bul.
3. Request URL, method, response status ve JSON'u ayrı ayrı göster.
4. Ekrandaki görevlerle JSON'daki görevleri eşleştir.

Katılımcıya sor: “React yerine başka bir istemci aynı HTTP sözleşmesini kullansa backend değişmek zorunda mı?” Beklenen cevap: hayır; istemci API sözleşmesine uyuyorsa aynı backend kullanılabilir.

Kaynak: [HTTP metodları](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods), [Spring MVC işleme akışı](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html).

[Sonraki: Kurulum](02-kurulum.md) · [İçindekiler](README.md)
