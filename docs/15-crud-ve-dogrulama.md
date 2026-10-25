# 15 — CRUD, iş kuralı ve doğrulama

## Bu derste gösterilecek akış

Yeni bir görev oluştur, PUT ile bütün düzenlenebilir alanları değiştir, PATCH ile DONE yap, yeniden açmayı dene ve görevi sil. Aynı kaynağın farklı HTTP metodlarıyla nasıl işlendiğini göster. Spring Security henüz eklenmediği için bu dersin istekleri kimlik bilgisi gerektirmez.

## 1. POST — Yeni kaynak oluştur

Ekranda “Yeni görev” düğmesine bas. Başlık ve açıklama gir; “Görevi oluştur” ile gönder.

```http
POST /api/tasks
Content-Type: application/json

{"title":"REST demosunu prova et","description":"Metodları karşılaştır"}
```

Beklenen: **201 Created**, Location header'ında `/api/tasks/{üretilen-id}` ve görev JSON'u. Status sunucuda OPEN olur; istemci id veya status gönderirse DTO sözleşmesine uymadığı için 400 alır.

Kod turu:

1. [TaskFormDialog](<../frontend/app/(main)/pages/gorevler/Dialogs/TaskFormDialog.jsx>) form taslağını toplar; TasksPage Redux createTask thunk’ını dispatch eder.
2. [taskService.create](../frontend/services/taskService.js) ortak Axios istemcisiyle POST gönderir; Next.js rewrite backend’e iletir.
3. [TaskController.create](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java) `@Valid @RequestBody` ile girdiyi alır.
4. [CreateTaskRequest](../backend/src/main/java/com/example/restworkshop/dto/CreateTaskRequest.java) kabul edilen alanları ve kısıtları tanımlar.
5. [TaskService.create](../backend/src/main/java/com/example/restworkshop/services/TaskService.java) OPEN görev oluşturur, repository ile kaydeder ve MapStruct TaskMapper üzerinden TaskResponse üretir.
6. Controller, `ResponseEntity.created(...)` ile 201 ve Location üretir.

HTTP panelinde 201 seçili kalır. Listeyi yenileyen arka plan GET çağrısı da geçmişe eklenir; yazma yanıtını gizlemez. ID'yi yanıttan al; örnek verinin veya testin ID'sini sabit kabul etme.

## 2. PUT — Düzenlenebilir temsili bütünüyle değiştir

Detayı açıp “Düzenle PUT” düğmesine bas. Başlık, açıklama ve durum aynı body içinde gönderilir:

```json
{"title":"REST demosunu tamamla","description":null,"status":"IN_PROGRESS"}
```

Başarı 200'dür. Bu API'de title ve status zorunludur. Description eksik veya null ise açıklama temizlenir. Olmayan ID'ye PUT 404 döner; yeni görev oluşturulmaz.

[UpdateTaskRequest](../backend/src/main/java/com/example/restworkshop/dto/UpdateTaskRequest.java) ile CreateTaskRequest'i karşılaştır. Oluşturma isteğinin status almaması, PUT'un ise status istemesi sözleşme kararımızdır.

## 3. PATCH — Yalnızca durumu değiştir

Detay kartındaki “Yeni durum” alanından DONE seçip “Durumu değiştir PATCH” düğmesine bas.

```json
{"status":"DONE"}
```

Başarı 200'dür; başlık ve açıklama korunur. Aynı DONE değerini tekrar gönder; istek kabul edilir. Bu, projeye özel bir PATCH body'sidir. JSON Patch/JSON Merge Patch uygulamıyoruz. PATCH'e title gibi başka alan göndermek 400'dür.

Kod: [UpdateTaskStatusRequest](../backend/src/main/java/com/example/restworkshop/dto/UpdateTaskStatusRequest.java), TaskController.updateStatus ve TaskService.updateStatus.

## 4. İş kuralı — DONE görevi yeniden açamazsın

DONE göreve OPEN veya IN_PROGRESS gönder. Body geçerli olsa da mevcut durumla çeliştiği için **409 Conflict** döner.

```json
{
  "type":"about:blank",
  "title":"Conflict",
  "status":409,
  "detail":"Tamamlanmış görev yeniden açılamaz.",
  "instance":"/api/tasks/7",
  "code":"TASK_STATE_CONFLICT"
}
```

Path örnektir; kendi oluşturduğun görevin ID'sini kullan. Aynı deneyi PUT ile de yap. [TaskService.validateStatusTransition](../backend/src/main/java/com/example/restworkshop/services/TaskService.java) iki yöntem tarafından ortak kullanılır. Kural alanlar değiştirilmeden önce kontrol edilir; reddedilen PUT başlığı veya açıklamayı da değiştirmez. Son GET ile bunu doğrula.

Service'in yazma metotlarındaki `@Transactional`, sınıftaki readOnly okuma ayarını bu işlemler için değiştirir. PUT/PATCH, transaction içinde yönetilen entity'yi günceller; JPA dirty checking değişikliği commit sırasında SQL'e taşır. Bu nedenle her güncellemede ayrıca save çağrısı görmezsin.

## 5. Doğrulama — Geçersiz girdiyi ayır

Yeni görev formunda başlığı boş bırakıp gönder. **400 VALIDATION_ERROR** ve title alan mesajı gelir. Girilen açıklama formda korunur.

```json
{
  "type":"about:blank",
  "title":"Bad Request",
  "status":400,
  "detail":"İstek alanlarını kontrol edin.",
  "instance":"/api/tasks",
  "code":"VALIDATION_ERROR",
  "fieldErrors":[{"field":"title","message":"Başlık boş olamaz."}]
}
```

Form `noValidate` kullanır; bu eğitimde sunucunun doğrulama yanıtını canlı göstermek için tarayıcının yerleşik form engelini devreye almıyoruz. Sunucudaki `@Valid`, `@NotBlank`, `@Size`, `@NotNull` kontrolleri çalışır.

| Girdi | Sonuç |
| --- | --- |
| Boş title, 101 karakter title veya 501 karakter description | 400 VALIDATION_ERROR |
| PUT/PATCH'te status eksik | 400 VALIDATION_ERROR |
| Bozuk JSON, bilinmeyen alan veya enum | 400 INVALID_REQUEST |
| Status'u 0/1/2 gibi bir sayı ile gönderme | 400 INVALID_REQUEST |
| Olmayan görev | 404 TASK_NOT_FOUND |
| DONE → OPEN/IN_PROGRESS | 409 TASK_STATE_CONFLICT |

Jackson 3'te sayısal enum reddi `spring.jackson.datatype.enum.fail-on-numbers-for-enums=true` ile ayarlı. DTO'da olmayan alanlar da reddedilir. Bunu enum değerleri ile Java enum sırası arasındaki farkı anlatmak için kullan.

[GlobalExceptionHandler](../backend/src/main/java/com/example/restworkshop/controllers/advice/GlobalExceptionHandler.java), hem DTO alan doğrulamasını hem path kısıtlarıyla birlikte oluşan metot doğrulama hatalarını işler. Framework'ün 405/415 status'ları korunur; 405'teki Allow header'ı kaybolmaz. Beklenmeyen 500 yanıtında iç exception mesajı veya stack trace gönderilmez. Request ID henüz uygulanmadı.

## 6. DELETE — Kaynağı sil

Detaydan “Sil DELETE”, sonra “Evet, sil” düğmesine bas. **204 No Content** gelir; response body yoktur. [Axios istemcisi](../frontend/services/api.js) 204'ü JSON parse etmeye çalışmaz. HTTP paneli gövdenin olmadığını açıkça gösterir.

Son sayfadaki son görev silinirse liste geçerli önceki sayfaya döner. Aynı göreve bir daha DELETE veya GET gönderirsen 404 gelir. İkinci DELETE'in status'unun farklı olması idempotent semantiği bozmaz; kaynak artık yoktur.

## 7. Otomatik ve canlı kontroller

Backend dizininde:

```powershell
.\mvnw.cmd test
```

Frontend dizininde:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
```

Proje kökünde, PostgreSQL/backend/Next.js açıkken:

```powershell
node scripts/smoke-crud.mjs http://127.0.0.1:5173
```

[Canlı kontrol betiği](../scripts/smoke-crud.mjs) benzersiz başlıklı bir test görevi oluşturur; tüm yazma yöntemlerini, 400/409'u, 201/Location'ı ve boş 204'ü kontrol eder. Sonunda kendi test görevini siler; mevcut görev tablosunu sıfırlamaz. Kayıt sayısının başlangıca dönmesini kontrol eder. YKH dönüşüm provasında ayrıca başlangıçtaki altı PostgreSQL kaydının bütün alanları karşılaştırıldı ve aynı kaldığı doğrulandı. Identity sayacı geri alınmaz; sonraki ID'nin artması beklenir.

Doğrulama sonucu: 19 backend testi, 18 frontend testi, build/lint ve gerçek PostgreSQL üzerinde Next.js rewrite dahil canlı CRUD kontrolü başarılı. Frontend testleri JSDOM ve kontrollü HTTP yanıtlarıyla çalışır; görsel tarayıcı provası değildir. Önceki Chrome erişim kısıtı nedeniyle görsel prova henüz yapılmadı.

## Sıradaki aşama

P5: Spring Security, yerel JWT, USER/ADMIN, Bearer header ve 401/403. Giriş/token mekanizması bu aşamada uygulanacak; silme yetkisi yalnızca ADMIN’de olacak. Ayrıntılar [Security planında](07-spring-security.md).

[İçindekiler](README.md) · [HTTP metodları](05-http-metotlari.md) · [Validation ve hatalar](08-validation-ve-hatalar.md) · [Geliştirme planı](../PLAN.md)
