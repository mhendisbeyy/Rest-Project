# 11 — Alıştırmalar ve sorular

## Çalışan çekirdek üzerinde

### A1 — İsteği parçalara ayır

`GET /api/tasks?status=OPEN&page=0&size=5` içindeki method, koleksiyon ve query parametrelerini göster. Sonra listeden aldığın ID'yle tek görev iste.

Beklenen: GET /api/tasks koleksiyon; status/page/size query; GET /api/tasks/{id} kaynak kimliği.

### A2 — PUT/PATCH farkını kanıtla

Kendi görevini oluştur. PUT ile title/description/status değiştir. PATCH ile yalnızca status'u DONE yap. GET ile diğer alanların korunduğunu doğrula.

Beklenen: PUT bütün düzenlenebilir temsili, bizim PATCH yalnızca status'u değiştirir. HTTP panelindeki body'ler farklıdır.

### A3 — Hatanın yerini bul

status=UNKNOWN GET, boş title POST ve DONE → OPEN PATCH gönder. Önce hangi aşamada duracağını tahmin et.

Beklenen: MVC dönüşümü/400, MVC validation/400, Service/409. Controller/Service breakpoint'leriyle karşılaştır.

### A4 — Kuralın iki girişini kontrol et

DONE görevi hem PATCH hem PUT ile yeniden aç. İkisinin de 409 döndüğünü ve PUT'un başlık/açıklamayı değiştirmediğini doğrula.

### A5 — Eşleme ve durum akışını bul

TaskMapper arayüzünü, üretilen TaskMapperImpl'i ve taskSlice'ı aç. Hangisi DTO üretir, hangisi HTTP gönderir, hangisi listeyi saklar?

Beklenen: MapStruct DTO üretir; Axios HTTP gönderir; Redux liste ve seçim durumunu tutar. Jackson JSON okur/yazar.

### A6 — Sil ve temizle

Yalnızca kendi görevinle silme onayını, boş 204'ü ve ikinci DELETE'teki 404'ü göster. Son sayfanın son kaydıysa listenin önceki sayfaya dönmesini kontrol et.

## Sonraki aşama alıştırmaları

**P5:** Token yok/geçersiz/süresi dolmuş ve USER/ADMIN token'larıyla aynı geçici kaynak üzerinde istek gönder. Beklenen: 401, USER DELETE 403, ADMIN DELETE 204.

**P6:** Paneldeki sunucu request ID'sini response header, hata body'si ve logda bul. Mevcut UI geçmiş UUID'siyle bunu karıştırma.

## Kısa sorular

| Soru | Beklenen cevap |
| --- | --- |
| Her istek controller'a gelir mi? | Hayır; MVC hazırlığı, P5 sonrası Security de durdurabilir. |
| Query ile path farkı? | Bu tasarımda filtre/sayfalama query, kaynak kimliği path'tir. |
| Service neden var? | İş kuralı ve transaction sınırını HTTP/veri erişiminden ayırır. |
| Entity neden doğrudan dönmüyor? | HTTP sözleşmesini kalıcı modelden ayırmak için. |
| MapStruct JSON üretir mi? | Hayır; Java nesneleri arasında eşler. JSON'u Jackson üretir. |
| Redux store neden global singleton değil? | Next.js sunucu istekleri arasında kullanıcı durumunun paylaşılmaması için. |
| 401 / 403 farkı? | Geçerli kimlik yok / kimlik olsa da işlem yetkisi yok (P5 hedefi). |
| JWT şifreli kullanıcı deposu mu? | Hayır; imza, claim ve süre doğrulaması gereken bir token biçimidir. |
| 204'ü JSON parse eder miyiz? | Body yoktur; ayrı ele alınır. |
| Axios 404'te ne yapar? | Varsayılan olarak promise'i reddeder; ortak istemci ProblemDetail'i korur. Ağ hatası ayrıca ele alınır. |
| İkinci DELETE 404 olursa idempotency bozulur mu? | Hayır; hedef durum yine kaynağın yokluğudur. |
| CORS kullanıcı yetkisi mi? | Hayır; tarayıcının origin erişim kurallarıdır. |
| Filter hatasını MVC advice otomatik yakalar mı? | Hayır; Security handler'ları ayrı giriş noktasıdır. |

## İleri çalışma

Çekirdek ve P5/P6 tamamlandıktan sonra farklı origin CORS, method security, kaynak sahipliği, veritabanı kullanıcıları, session/OAuth2 karşılaştırması ve optimistic locking ayrı oturumlarda incelenebilir.

[Demo akışı](10-demo-akisi.md) · [API sözleşmesi](12-api-sozlesmesi.md) · [İçindekiler](README.md)
