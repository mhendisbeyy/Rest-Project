# 05 — HTTP metodlarını kullanıcı hareketleriyle anlatmak

Bu bölümdeki beş temel metod uygulamada çalışıyor. Canlı kod karşılıkları: [TaskController](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java), [TaskService](../backend/src/main/java/com/example/restworkshop/services/TaskService.java), [Axios görev servisi](../frontend/services/taskService.js). Ekran üzerinden anlatım için [CRUD dersini](15-crud-ve-dogrulama.md) kullan. Security henüz eklenmedi; bu aşamada silme için ADMIN gerekmez.

## Temel işlemler

| Method | Projede anlamı | Örnek | Başarı |
| --- | --- | --- | --- |
| GET | Oku | `/api/tasks/5` | 200 |
| POST | Yeni görev oluştur | `/api/tasks` | 201 + Location |
| PUT | Düzenlenebilir temsili bütünüyle değiştir | `/api/tasks/5` | 200 |
| PATCH | Yalnızca durum alanını değiştir | `/api/tasks/5` | 200 |
| DELETE | Görevi sil | `/api/tasks/5` | 204, boş body |

Bu eşleme projenin API sözleşmesidir. Örneğin POST'un genel HTTP anlamı yalnızca “veritabanına ekle” değildir. PUT ile oluşturma mümkün olsa da bizim sözleşmemiz olmayan ID'ye PUT için 404 seçer.

## PUT ile PATCH deneyi

Başlangıç görevi: title `Sunumu hazırla`, description `Demo ekle`, status OPEN.

PUT:

```json
{"title":"Sunumu bitir","description":null,"status":"IN_PROGRESS"}
```

Düzenlenebilir temsil bütünüyle değiştirilir. Bizim sözleşmemizde description eksikse null olur; title veya status eksikse 400 döner.

PATCH:

```json
{"status":"DONE"}
```

Yalnızca durum değişir; title ve description korunur. Bu, projeye özel bir kısmi güncelleme body'sidir; JSON Patch değildir.

## Safe ve idempotent

Safe, istemcinin sunucudaki uygulama durumunu değiştirmeyi istememesi demektir. Log yazılması gibi yan etkiler bu tanımı bozmaz. GET ile görev oluşturmayacağız veya silmeyeceğiz.

Idempotent, aynı isteği tekrarlamanın sunucudaki hedeflenen etkisinin bir kez göndermekle aynı olmasıdır. Yanıtların tamamen aynı olması gerekmez. Aynı DELETE önce 204, sonra 404 dönebilir; görev her iki durumda da mevcut değildir.

PUT ve DELETE idempotent semantiğe sahiptir. POST ve PATCH genel olarak bu garantiyi vermez. Bu projedeki “status'u DONE yap” PATCH'i tekrarlanabilir biçimde tasarlanmıştır; buradan bütün PATCH işlemleri idempotenttir sonucu çıkmaz.

## HEAD ve OPTIONS

HEAD, GET benzeri yanıt metadata'sını body olmadan almak içindir. Spring MVC GET eşlemelerinde HEAD desteğini sağlayabilir. OPTIONS, desteklenen iletişim seçenekleri hakkında bilgi verir; tarayıcının CORS preflight çağrısında da kullanılır. Bunları çekirdek CRUD tamamlandıktan sonra Network panelinde kısa ek örnek olarak göster.

## Canlı gösterim

1. POST ile görev oluştur; yanıttaki ID'yi ve Location header'ını göster.
2. GET ile oluşan görevi oku.
3. PUT ile düzenlenebilir temsilin tamamını değiştir.
4. PATCH ile DONE yap; aynı PATCH'i tekrar gönder.
5. Kendi demo görevine DELETE gönder; silme onayını ve boş 204’ü göster. ADMIN rol kontrolü P5’te eklenecek.
6. Aynı DELETE'i tekrarla; 404'ün idempotency ile çelişmediğini açıkla.

Kaynak: [HTTP metodlarının anlamları ve özellikleri](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods).

[Önceki: Request/Response](04-request-response.md) · [Sonraki: İsteğin yaşam döngüsü](06-yasam-dongusu.md)
