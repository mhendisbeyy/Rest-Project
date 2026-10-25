# API sözleşmesi

Görev CRUD, filtre/sayfalama ve 400/404/409 ProblemDetail davranışı uygulanmıştır. Bu aşamada görev endpoint'leri kimliksiz çalışır. JWT/yetki matrisi **P5**, sunucu request ID'si **P6** hedefidir.

## Adres ve içerik türleri

- Frontend: `http://localhost:5173/pages/gorevler`.
- Backend: `http://localhost:8080`.
- Tarayıcıdaki Axios göreli /api/... çağırır; Next.js rewrite 8080'e iletir.
- Başarı JSON: application/json; hata: application/problem+json.
- JSON body gönderirken Content-Type: application/json.
- Accept: application/json, application/problem+json.

Swagger UI: `/swagger-ui/index.html`; makine okunur şema: `/v3/api-docs`.

## Model ve kurallar

| Alan | Kural |
| --- | --- |
| id | Sunucunun ürettiği pozitif Long; istemci değiştiremez |
| title | Boş olamaz; en çok 100 karakter |
| description | İsteğe bağlı; null veya en çok 500 karakter |
| status | OPEN, IN_PROGRESS, DONE |

POST title/description alır; başlangıç durumu OPEN'dır. PUT bütün düzenlenebilir temsili alır: title ve status zorunlu; description eksikse null olur. PATCH yalnızca status alır; JSON Patch veya JSON Merge Patch standardı uygulanmaz.

DTO'da bulunmayan alanlar 400 INVALID_REQUEST üretir. POST ile id/status, PATCH ile title gönderilemez. Status enum metni olmalıdır; sayı ile enum sırası reddedilir.

DONE → OPEN/IN_PROGRESS hem PUT hem PATCH için 409 üretir. DONE → DONE kabul edilir. Reddedilen PUT başlık/açıklamayı da değiştirmez.

Görevler eğitim için ortak görünür; kaynak sahipliği kuralı yoktur. Paket ve DTO dönüşümü tabloyu, JSON adlarını veya veriyi değiştirmez.

## Çalışan endpoint'ler

| Method | Yol | Girdi | Başarı |
| --- | --- | --- | --- |
| GET | /api/tasks | status?, page?, size? | 200, sayfalı liste |
| GET | /api/tasks/{id} | Pozitif path ID | 200, görev |
| POST | /api/tasks | CreateTaskRequest | 201, görev + Location |
| PUT | /api/tasks/{id} | UpdateTaskRequest | 200, görev |
| PATCH | /api/tasks/{id} | UpdateTaskStatusRequest | 200, görev |
| DELETE | /api/tasks/{id} | Pozitif path ID | 204, body yok |

Olmayan pozitif ID'de GET/PUT/PATCH/DELETE 404'tür. PUT upsert yapmaz. Sayısal olmayan veya pozitif olmayan ID 400'dür.

## Listeleme

`GET /api/tasks?status=OPEN&page=0&size=5`

- status yoksa bütün durumlar.
- page varsayılan 0; negatif olamaz.
- size varsayılan 5; 1–50 aralığında.
- Sıralama id ASC; kullanıcıdan sort alınmaz.
- Geçersiz parametre 400; veri olmayan sayfa 200 ve boş items.
- Toplamlar filtreli sonuç üzerinden hesaplanır.

```json
{
  "items": [
    {"id":1,"title":"REST sunumunu hazırla","description":null,"status":"OPEN"}
  ],
  "page":0,
  "size":5,
  "totalElements":1,
  "totalPages":1
}
```

## POST

```http
POST /api/tasks HTTP/1.1
Content-Type: application/json
Accept: application/json, application/problem+json

{"title":"REST sunumunu hazırla","description":"Demo senaryolarını prova et"}
```

Yanıt: `201 Created`, `Location: /api/tasks/{üretilen-id}`, görev JSON'u. Şu an Authorization veya X-Request-ID gerekmez; sunucu request ID header'ı üretmez.

## PUT ve PATCH

PUT:

```json
{"title":"Sunumu tamamla","description":null,"status":"IN_PROGRESS"}
```

PATCH:

```json
{"status":"DONE"}
```

Her ikisinin başarı yanıtı tam görev JSON'u ve 200'dür. PUT description'ı temizleyebilir; PATCH diğer alanları korur.

## DELETE

Başarı 204'tür; JSON/null/metin body gönderilmez. Tekrar silme 404 olabilir; bu idempotent kaynak etkisiyle çelişmez.

## Hata biçimi — mevcut

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

Standart alanlar ProblemDetail'den gelir; code ve gerektiğinde fieldErrors eklenir. fieldErrors yalnızca alan doğrulamasında bulunur. İç exception mesajı/stack trace kullanıcıya aktarılmaz. requestId henüz yanıtta yoktur.

| Durum | HTTP | code |
| --- | --- | --- |
| DTO doğrulama | 400 | VALIDATION_ERROR |
| Bozuk JSON, enum, bilinmeyen alan, geçersiz URL parametresi | 400 | INVALID_REQUEST |
| Görev bulunamadı | 404 | TASK_NOT_FOUND |
| DONE durumundan çıkma | 409 | TASK_STATE_CONFLICT |
| Beklenmeyen sunucu hatası | 500 | INTERNAL_ERROR |

Framework'ün 405/415 gibi status ve gerekli header'ları korunur. Bütün hatalar 400 veya 500'e çevrilmez.

## Yetki matrisi (P5 hedefi)

**Henüz uygulanmadı.** Yerel kullanıcı/parola doğrulaması ardından JWT üretilecek; korumalı isteklerde `Authorization: Bearer <token>` taşınacak. Giriş ve /api/me ayrıntıları P5 sırasında kesinleştirilecek; eski /api/csrf endpoint planı ana yaklaşım değildir.

| İşlem | Token yok/geçersiz/süresi dolmuş | USER | ADMIN + USER |
| --- | --- | --- | --- |
| GET /api/me | 401 | İzinli | İzinli |
| GET görev/liste | 401 | İzinli | İzinli |
| POST / PUT / PATCH | 401 | İzinli | İzinli |
| DELETE | 401 | 403 | İzinli |

Yerel giriş endpoint'i kimliksiz erişilebilir olacak. Parolalar BCrypt ile doğrulanacak. Token imza/süre/claim koşulları sunucuda denetlenecek. 401 UNAUTHENTICATED ve 403 ACCESS_DENIED ProblemDetail biçimiyle üretilecek. Token saklama/yenileme ve CSRF kararı P5'te seçilen taşıma biçimiyle birlikte belgelenecek.

## Request ID (P6 hedefi)

**Henüz uygulanmadı.** İstemci X-Request-ID gönderir; backend eksik/geçersiz değeri yeniler. Kabul edilen değer 1–64 karakter; harf, rakam, nokta, alt çizgi ve tire içerir. Aynı değer response header, ProblemDetail requestId ve loglarda bulunur.

Security'den önce logging filter reddedilen istekleri de kaydeder; MDC temizliği yapılır. Authorization/Cookie/Set-Cookie/CSRF değerleri maskelenir. Mevcut Axios geçmiş UUID'si bu sunucu kimliği değildir.

## Veri ve demo

PostgreSQL gorevdb ve tasks tablosu korunur. Yalnızca boş tabloda altı seed görev eklenir. Demo ID'si yanıttan alınır; sabit ID varsayılmaz. Reset endpoint'i yoktur. Testler ayrı H2 kullanır. Canlı smoke betiği yalnızca kendi oluşturduğu geçici görevi siler.

[Katmanlar](03-katmanlar.md) · [CRUD dersi](15-crud-ve-dogrulama.md) · [Geliştirme planı](../PLAN.md)
