# 10 — 90 dakikalık anlatım ve demo

## Sunum öncesi

Mevcut çekirdek ve YKH dönüşümü hazır. Security/JWT P5 ve log korelasyonu P6 henüz uygulanmadı. Aşağıdaki 90 dakika bugünkü kodla anlatılabilir; güvenlik bölümü kavramsaldır.

- PostgreSQL, backend:8080 ve Next.js:5173'ü aç.
- Yeni bir demo görevi oluştur; ID'yi yanıttan al.
- IDE, SQL logu ve HTTP panelini hazırla.
- Tarayıcı erişimi varsa Network panelini aç.
- Mevcut görevler yerine yalnızca kendi demo görevin üzerinde yazma/silme yap.
- Bağımlılıkları ve build'i sunumdan önce tamamla.

## Zaman çizelgesi

| Süre | Konu | Gösterim |
| --- | --- | --- |
| 00–10 | HTTP, kaynak ve REST | Liste ve HTTP request/response |
| 10–25 | Metod/path/query/header/body | POST, detay, filtre, PUT/PATCH |
| 25–45 | YKH dosya düzeni ve katmanlar | Sayfa → Redux → Axios → Controller → Service → Repository/MapStruct |
| 45–60 | Yaşam döngüsü | Başarılı istek ve validation breakpoint'leri |
| 60–75 | Hatalar ve testler | 400/404/409, silme onayı, 204 |
| 75–85 | Security'ye giriş | JWT/401/403 ve P5 hedefi; henüz canlı güvenlik demosu yok |
| 85–90 | Alıştırma | Katılımcı akışı anlatır |

## Gösterim sırası

### 1. Ekran ve liste

“Bu ekranda her işlem bir HTTP isteğine dönüşüyor.” Listeyi yenile; GET, URL, query, Accept ve yanıt body'sini aç. Filtreyi OPEN yap, sonra tüm durumlara dön. Page/size ile path ID arasındaki farkı sor.

### 2. Görev oluştur

“Yeni görev” formunu aç; başlık/açıklama gir. POST body'sini, 201'i, Location'ı ve OPEN durumunu göster. Arka plan GET geçmişe eklense de POST yanıtının seçili kaldığını göster.

### 3. PUT ve PATCH

Oluşturduğun görevin detayından PUT ile title/description/status değiştir. Sonra PATCH ile yalnızca status'u DONE yap. Diğer alanların korunduğunu ve aynı DONE isteğinin tekrar kabul edildiğini göster.

### 4. Dosya ve katman turu

TasksPage → taskSlice thunk → taskService → ortak Axios istemcisi → TaskController → TaskService → TaskRepository. Dönüşte TaskMapper → TaskResponse → JSON → Redux → DataTable sırasını göster.

Constructor injection, getter/setter DTO'ları ve MapStruct tarafından üretilen sınıfı aç. MapStruct'un yazma iş kurallarını yönetmediğini açıkla. Swagger'da endpoint ve şemaları göster.

### 5. Hata ve transaction

Önce yan menüden **İsteğin yolculuğu** ekranını aç. POST 400 / PATCH 409 senaryolarında hata noktalarını ve atlanan durakları karşılaştır. Bu timeline API çağrısı göndermez; ardından görev ekranında kendi demo görevinle gerçek istekleri tekrarla.

Boş başlıkla POST gönder; alan mesajını ve form taslağının korunduğunu göster. MVC validation nedeniyle Service breakpoint'inin çalışmadığını göster.

DONE görevi önce PATCH, sonra PUT ile OPEN yapmayı dene. 409 ve TASK_STATE_CONFLICT gelir. Son GET ile başlık/açıklama/durumun değişmediğini göster. Olmayan ID için 404 örneği ekle.

### 6. DELETE

Sil düğmesine bas; onaylamadan veri değişmediğini göster. “Evet, sil” ile 204 ve boş body'yi aç. Tekrar GET/DELETE 404 olabilir; idempotency sonucunun aynı kaynak durumuyla ilgili olduğunu açıkla. Demo görevini temizle.

### 7. Security — kavramsal bölüm

[JWT planını](07-spring-security.md) aç: giriş → token → Bearer header → filtre doğrulaması → rol → controller. Token yok/geçersiz/süresi dolmuş 401; geçerli USER ile silme 403; ADMIN ile silme 204 hedefidir.

P5 tamamlanınca aynı geçici görevle bu üç deneyi canlı göster. Şimdiki uygulamada hesap seçimi veya güvenlik reddi varmış gibi anlatma. Request ID/log eşleşmesi de P6 sonrasında gösterilecek.

### 8. Katılımcıya akışı anlattır

“Kaydet'e bastın; JSON hangi dosyalardan geçiyor? 400 ve 409 hangi aşamalarda oluşuyor? Modeli DTO'ya kim, DTO'yu JSON'a kim çeviriyor?”

## Prova listesi

- [ ] Liste, filtre ve sayfalama doğru.
- [ ] POST 201 + Location; DELETE boş 204.
- [ ] PUT/PATCH ve DONE kuralı görünür.
- [ ] Alan hataları form taslağını koruyor.
- [ ] Silme onayı ve son sayfa düzeltmesi çalışıyor.
- [ ] Swagger şeması ile gerçek JSON eşleşiyor.
- [ ] Yalnızca kendi demo görevleri temizleniyor.
- [ ] Gerçek tarayıcıda görünüm ve Network akışı kontrol edildi.
- [ ] P5 sonrası JWT/401/403; P6 sonrası request ID ayrıca prova edildi.

Otomatik testler ve canlı HTTP provası başarılıdır; Chrome erişimi otomatik onayda reddedildiğinden gerçek tarayıcı provası açık kalmıştır.

[Sıfırdan geliştirme planı](../PLAN.md) · [Alıştırmalar](11-alistirmalar-ve-sorular.md)
