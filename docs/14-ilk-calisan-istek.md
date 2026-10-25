# 14 — İlk çalışan istek: React'ten PostgreSQL'e

## Bu aşamada hazır olanlar

Bu belge ilk GET akışını inceler. Spring Boot 4.1.2 + Java 21 backend, Next.js + React + JavaScript frontend ve PostgreSQL gorevdb bağlantısı kullanılır. Yazma işlemleri de artık hazır; onlar [CRUD ve doğrulama dersinde](15-crud-ve-dogrulama.md) anlatılır. Security sonraki aşamadadır.

## 1. Uygulamaları başlat

[Kurulum belgesindeki](02-kurulum.md) iki terminal komutunu çalıştır. PostgreSQL açık olmalı. Tarayıcıda `http://localhost:5173` adresini aç. İlk boş tabloda her durumdan ikişer tane olmak üzere altı örnek görev eklenir.

Veriler React içindeki sabit bir listeden gelmez. Backend, PostgreSQL tasks tablosunu sorgular. Backend kapalıysa ekran hata gösterir; örnek veriyle başarılı bağlantı taklidi yapmaz.

## 2. İsteği React tarafında bul

[TasksPage.jsx](<../frontend/app/(main)/pages/gorevler/components/TasksPage.jsx>), sayfa/boyut/durum değiştiğinde Redux `loadTasks` thunk’ını dispatch eder. [taskSlice.js](../frontend/store/slices/taskSlice.js), [taskService.js](../frontend/services/taskService.js) üzerinden URL ve query parametrelerini Axios’a verir:

```http
GET /api/tasks?page=0&size=5
Accept: application/json, application/problem+json
```

[api.js](../frontend/services/api.js), Axios ile tarayıcıdan isteği gönderir. Thunk, yanıt verisini taskSlice’a ve HTTP exchange kaydını httpSlice’a aktarır; DataTable ve HTTP paneli güncellenir. React geliştirme StrictMode'u nedeniyle başlangıçta iptal edilen/tekrarlanan bir istek görülebilir; bu durum üretim derlemesinde aynı geliştirme kontrolüyle çalışmaz.

[next.config.mjs](../frontend/next.config.mjs), `/api` isteklerini 8080 portuna iletir. Tarayıcı backend'e doğrudan farklı origin isteği göndermediğinden ana demo için CORS ayarı gerekmez.

## 3. Controller'a geç

[TaskController.java](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java) içinde `findAll` metoduna breakpoint koy.

- `@RestController`: dönüş değeri HTTP body olarak işlenir.
- `@RequestMapping("/api/tasks")`: ortak yol.
- `@GetMapping`: GET isteği eşlemesi.
- `@RequestParam`: status, page ve size bağlama.
- `@Min` / `@Max`: sayfa parametrelerinin sınırları.

Listeyi yenile ve page=0, size=5 değerlerini göster. Durumu OPEN seç; status'un URL'den metoda nasıl geldiğini göster. `status=UNKNOWN`, `page=-1` veya `size=51` için 400 oluşur.

## 4. Service'e geç

[TaskService.java](../backend/src/main/java/com/example/restworkshop/services/TaskService.java) içinde `findAll` metodunu aç. Burada sıralama `id ASC`; durum varsa filtreli repository sorgusu, yoksa tüm kayıtlar seçilir. Entity’ler constructor ile verilen TaskMapper üzerinden response DTO’larına çevrilir. [TaskMapper](../backend/src/main/java/com/example/restworkshop/dto/mapper/TaskMapper.java), MapStruct arayüzüdür; getter/setter kullanan TaskMapperImpl Maven compile sırasında üretilir. Bu mapper JSON üretmez.

`@Transactional(readOnly = true)`, bu okuma çağrılarını transaction içinde yürütür. HTTP'yi controller, veri sorgusunu repository yönetir. Yazma metotları kendi `@Transactional` ayarını ve ortak DONE kontrolünü kullanır; ayrıntıları CRUD dersinde incele.

## 5. Repository ve SQL'i göster

[TaskRepository.java](../backend/src/main/java/com/example/restworkshop/repositories/TaskRepository.java), JpaRepository'den sayfalı listeleme ve ID ile bulma davranışını alır. `findByStatus` için Spring Data metot adından sorgu üretir.

Konsoldaki SQL'de durum filtresini ve sayfalama sınırını bul. [Task.java](../backend/src/main/java/com/example/restworkshop/models/Task.java) içindeki tablo/sütun eşlemelerini göster. Status veritabanında enum sırası yerine metin olarak saklanır.

## 6. Yanıtı takip et

Service [TaskPageResponse](../backend/src/main/java/com/example/restworkshop/dto/TaskPageResponse.java) döndürür. Spring MVC bunu JSON'a dönüştürür. Axios sonucu Redux’a taşır; taskSlice listeyi, httpSlice son 10 HTTP çağrısını saklar. PrimeReact DataTable yeni durumu gösterir.

İlk örnek veride toplam 6, sayfa boyutu 5, totalPages 2 olur. OPEN filtresinde toplam 2 olur. Bu sayılar sabit uygulama kuralları değildir; veritabanındaki gerçek kayıtlara göre hesaplanır.

## 7. Path variable ile detay

Bir görevin Detay düğmesine bas. Bu kez `GET /api/tasks/{id}` gönderilir. Controller'daki `findById` ve `@PathVariable` bağlamasını göster. ID, listeden gelen değerdir.

Olmayan pozitif ID için [TaskNotFoundException](../backend/src/main/java/com/example/restworkshop/exception/TaskNotFoundException.java) oluşur; [GlobalExceptionHandler](../backend/src/main/java/com/example/restworkshop/controllers/advice/GlobalExceptionHandler.java) 404 ProblemDetail döndürür. Sıfır/negatif veya sayısal olmayan ID ise 400'dür.

## 8. Kalıcılığı açıkla

[application.properties](../backend/src/main/resources/application.properties), PostgreSQL bağlantısını ve `ddl-auto=update` ayarını taşır. [DemoDataInitializer](../backend/src/main/java/com/example/restworkshop/config/DemoDataInitializer.java), yalnızca boş tabloda seed çalıştırır. Yeniden başlatmak veri sıfırlama yöntemi değildir.

Örnek veri ekleme, API isteğinin bir parçası değildir; uygulama başlangıcındaki ayrı bir işlemdir. Bu ayrımı yaşam döngüsünü anlatırken özellikle belirt.

## Kontrol edilen davranışlar

- Backend: context açılışı, okuma ve yazma entegrasyon testleri; toplam 19 test başarılı.
- API testleri: filtre ve sayfalama toplamları, boş sayfa, liste ID'siyle detay, 404 ve geçersiz parametreler.
- Test profili: yalnızca H2; PostgreSQL kayıtlarına müdahale etmez.
- Canlı PostgreSQL: liste/detay ve Next.js rewrite üzerinden CRUD doğrulandı. Başlangıçtaki altı kaydın bütün alanları kontrol sonunda aynı kaldı; yeni veriler için her durumda iki görev varsayılmaz.
- Frontend: Next.js üretim derlemesi, lint ve 20 otomatik test başarılı. Backend WAR paketleme, üretilen MapStruct ve OpenAPI şeması kontrol edildi.
- Görsel kontrol: Chrome kullanımına otomatik onay verilmediğinden yapılmadı; etkileşim provası henüz doğrulanmış sayılmıyor.

## Sıradaki geliştirme

POST/PUT/PATCH/DELETE, form ekranı, 201/Location, 204 ve DONE iş kuralı tamamlandı; [sonraki dersten](15-crud-ve-dogrulama.md) takip et. Bir sonraki geliştirme aşaması P5: Spring Security ile yerel JWT, kimlik ve USER/ADMIN rolleridir.

[İçindekiler](README.md) · [Geliştirme planı](../PLAN.md)
