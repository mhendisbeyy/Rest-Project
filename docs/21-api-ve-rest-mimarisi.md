# 21 — API ve REST mimarisi ekranı

[API ve REST Mimarisi](http://localhost:5173/pages/api-ve-rest) ekranına yan menüden veya Görev Yönetimi ders bağlantılarından ulaşılır.

Ekran üç kavramı yan yana konumlandırır: API yazılımlar arası sözleşme; HTTP istek/yanıt iletişimi; REST mimari yaklaşım. Görev API’sinin metot, kaynak yolu, DTO, status/header ve hata yanıtlarıyla sözleşmesini gösterir.

## Sunum akışı

1. API/HTTP/REST kartlarını oku. React ve backend’in aynı HTTP sözleşmesiyle konuştuğunu göster.
2. GET/POST/PATCH/DELETE örneklerini değiştir. POST’taki 201/Location ve DELETE’teki gövdesiz 204’ü karşılaştır. Bunlar statik örneklerdir; API çağrısı gönderilmez.
3. REST’in altı kısıtını aç: Client–Server, Stateless, Cache, Uniform Interface, Layered System, isteğe bağlı Code on Demand. [Fielding, REST mimarisi](https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm).
4. Uniform Interface dialogundaki dört alt kısıtı incele. Kaynak kimlikleri, temsiller ve mesaj anlamları görev API’sinde örneklenir; hypermedia/HATEOAS eksikliği ayrıca belirtilir. [Fielding, hypermedia açıklaması](https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven).
5. “Biz REST yaklaşımını nasıl kullanıyoruz?” bölümünde kaynak yollarını gerçek Controller ile karşılaştır.

## Uygulamaya ilişkin değerlendirme

Kartlardaki uygulama durumları, mevcut kaynak koduna göre yapılan değerlendirmedir; otomatik REST uyumluluk sertifikası veya canlı sunucu ölçümü değildir.

| Konu | Kaynak kodundaki karşılığı |
| --- | --- |
| İstemci/sunucu | Next.js/React → Axios → Spring HTTP API |
| Stateless örneği | page/size/status her liste isteğinde gönderilir; Controller önceki session filtresini okumaz |
| Cache | Uygulamaya özel Cache-Control/ETag/koşullu GET davranışı henüz tasarlanmadı |
| Uniform Interface | Kaynak yolları, DTO temsilleri, HTTP metot/status/header sözleşmesi; HATEOAS geliştirme alanı |
| Layered System | Next.js rewrite yerel HTTP aracısıdır; Java Controller/Service/Repository ise kod sorumluluklarıdır |
| Code on Demand | İsteğe bağlıdır; görev API’si JSON/boş yanıt döndürür, Next.js ekranı tarayıcıya JS dosyaları sunar |

Stateless bölümünde PostgreSQL’deki kaynak durumu ve Redux UI state’i ile sunucudaki istemci oturum bağlamı ayrılır. JWT varlığı tek başına stateless mimari kanıtı olarak sunulmaz.

Cache bölümünde öneri header’ları uygulamadaki gerçek yanıt header’ları gibi gösterilmez. Mevcut kodda özel cache politikası bulunmaması, bütün HTTP GET yanıtlarının kesinlikle cache dışı olduğu sonucunu vermez. [HTTP caching, RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html).

TaskResponse dört iş alanı taşır; ilişki/action temsilleri yoktur. Frontend URL’leri taskService.js içinde kurar. Bu nedenle ekran uygulamamızı kaynak odaklı HTTP/JSON API örneği olarak anlatır; hypermedia ve cache konularını geliştirme alanı olarak gösterir. Bu değişiklikte HATEOAS, cache, Security veya yeni backend endpoint’i eklenmedi.

## Gerçek kod bağlantıları

- [TaskController](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java)
- [TaskResponse](../backend/src/main/java/com/example/restworkshop/dto/TaskResponse.java)
- [Frontend görev servisi](../frontend/services/taskService.js)
- [Next.js rewrite](../frontend/next.config.mjs)
- [API/REST sayfa bileşeni](../frontend/components/lessons/ApiRestPage.jsx)
- [Kısıtlar, kaynak yolları ve örnekler](../frontend/components/lessons/restContent.js)
- [Next.js rota dosyası](<../frontend/app/(main)/pages/api-ve-rest/page.js>)
- [Stiller](../frontend/styles/pages/api-rest.scss)
- [Testler](../frontend/tests/architecture.test.jsx)

## Doğrulama

Yeni üç test; FilterChain modelinde durdurma/işlenmemiş hata/finally ayrımını, 15 adımın korunmasını, REST değerlendirmesini ve HTTP örneklerinin istek göndermeden değişmesini doğrular. **29 frontend testi, ESLint ve Next.js üretim build’i başarılı.** API/REST, timeline ve Görev Yönetimi HTTP 200; her sayfanın bağlı 8 JS/CSS dosyası da 200 döndü. Üç Boot filtre kaydı başlangıç loguyla; görev servisi, TaskResponse alanları ve rewrite alıntıları kaynak koduyla karşılaştırıldı. Yerel Markdown bağlantıları doğrulandı. Backend Java kodu değiştirilmedi; Maven testleri yeniden çalıştırılmadı. Gerçek tarayıcı görsel provası yapılmadı.

[HTTP ve REST dersi](01-http-ve-rest.md) · [FilterChain ayrıntıları](20-servlet-filter-chain.md) · [İçindekiler](README.md)
