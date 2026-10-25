# 04 — URL, header, body ve yanıt

## Bir okuma isteği

```http
GET /api/tasks?status=OPEN&page=0&size=5 HTTP/1.1
Host: localhost:5173
Accept: application/json, application/problem+json
```

`/api/tasks` koleksiyonu seçer. Query string'deki status, page ve size sonucu filtreler/sayfalar. Header, yanıt türü tercihini taşır. Filtre için GET body kullanmıyoruz. Next.js rewrite bu isteği 8080'e iletir.

## Bir değiştirme isteği

```http
PATCH /api/tasks/5 HTTP/1.1
Host: localhost:5173
Content-Type: application/json
Accept: application/json, application/problem+json

{"status":"DONE"}
```

Kaynak kimliği path'te; değiştirilecek veri body'dedir. ID örnektir; demoda kendi oluşturduğun görevin ID'sini kullan. Örnek, HTTP/1.1'in metin gösterimidir.

Mevcut isteklerde Authorization gerekmez. P5'te `Authorization: Bearer <token>`, P6'da `X-Request-ID` eklenecek. Bunlar henüz çalışan özellik olarak sunulmaz.

## Spring karşılıkları

| İhtiyaç | Örnek | Spring karşılığı |
| --- | --- | --- |
| Yol | /api/tasks | @RequestMapping |
| HTTP metodu | PATCH | @PatchMapping |
| Kaynak kimliği | /tasks/5 | @PathVariable |
| Filtre/sayfalama | ?status=OPEN | @RequestParam |
| Header okuma | Accept veya özel header | @RequestHeader ya da uygun filter |
| JSON veri | {"status":"DONE"} | @RequestBody |
| Alan doğrulama | title boş olamaz | @Valid ve DTO kısıtları |
| Status/header/body | 201 + Location | ResponseEntity |

TaskController'da path/query/body bağlamalarını canlı göster. Header'lar `@RequestHeader` ile de okunabilir; mevcut controller özel header bağlamaz. Kimlik doğrulaması P5'te filtre zincirinde yapılacak.

`@RequestParam` form verilerini de bağlayabilir; bu projede filtre/sayfalama için kullanılır.

## JSON ve Java arasındaki iki dönüşüm

İstek JSON'u → Jackson → istek DTO'su. Model → MapStruct → yanıt DTO'su → Jackson → yanıt JSON'u.

MapStruct ile Jackson aynı işi yapmaz: biri Java nesneleri arasında eşleme, diğeri JSON okuma/yazmadır. Bozuk JSON veya geçersiz enum, controller metodunun gövdesine ulaşmadan 400 üretebilir. `@Valid` doğrulaması da metot çağrısından önce yapılır.

`Content-Type` gönderilen içeriğin türüdür; `Accept` istenen yanıt türüdür.

## Yanıtı üç parçada incele

POST: status `201`, header `Location: /api/tasks/{id}`, body görev JSON'u. DELETE: status `204`, body yok. Hata: örneğin `409`, `Content-Type: application/problem+json`, body ProblemDetail.

Ekrandaki HTTP panelinde istek/yanıt sekmelerini aç; tarayıcı erişimi olduğunda aynı bilgiyi Network panelinde karşılaştır.

[Önceki: Katmanlar](03-katmanlar.md) · [Sonraki: HTTP metodları](05-http-metotlari.md)
