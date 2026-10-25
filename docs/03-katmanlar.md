# 03 — YKH düzeninde katmanlar

## Sorumlulukları tek istekle göster

`GET /api/tasks?status=OPEN&page=0&size=5` çağrısını aç. HTTP, iş kuralı, veri erişimi ve DTO dönüşümünün ayrı sorumluluklarını göster.

```text
com.example.restworkshop/
  controllers/
    TaskController.java
    advice/GlobalExceptionHandler.java
  dto/
    CreateTaskRequest.java
    UpdateTaskRequest.java
    UpdateTaskStatusRequest.java
    TaskResponse.java
    TaskPageResponse.java
    mapper/TaskMapper.java
  models/Task.java
  enums/TaskStatus.java
  repositories/TaskRepository.java
  services/TaskService.java
  config/
    DemoDataInitializer.java
    OpenApiConfig.java
  exception/
    TaskNotFoundException.java
    TaskStateConflictException.java
```

Ana paket değişmedi. YKH'nin çoğul paket adları ve DTO/mapper ayrımı uygulandı.

## Controller: HTTP sınırı

[TaskController](../backend/src/main/java/com/example/restworkshop/controllers/TaskController.java), URL ve HTTP metodunu Java metoduna bağlar. `@RequestParam`, `@PathVariable`, `@Valid @RequestBody` girişleri tanımlar. `ResponseEntity`, POST için 201/Location ve DELETE için boş 204 üretir.

Controller repository'ye doğrudan gitmez. DONE durum kuralı veya entity alanlarını değiştirme kararı controller'da bulunmaz.

## Service: işlem ve iş kuralı

[TaskService](../backend/src/main/java/com/example/restworkshop/services/TaskService.java), constructor ile `TaskRepository` ve `TaskMapper` alır. Spring bağımlılıkları oluşturup verir; Service içinde `new TaskRepository()` yazmayız.

- Listeleme `id ASC` sıralama ve sayfalama kullanır.
- Oluşturma, başlangıç durumunu OPEN seçer.
- PUT, bütün düzenlenebilir alanları değiştirir.
- PATCH, yalnızca status'u değiştirir.
- Her iki güncelleme `validateStatusTransition` ile DONE'dan çıkışı reddeder.
- Bulunamayan görev için `TaskNotFoundException` üretir.

Sınıfta `@Transactional(readOnly = true)`; yazma metotlarında `@Transactional` vardır. PUT/PATCH yönetilen entity'yi değiştirir; JPA dirty checking değişikliği transaction commit sırasında veritabanına taşır. SQL her zaman Java'daki değişiklik satırında çalışmaz.

## Repository: veri erişimi

[TaskRepository](../backend/src/main/java/com/example/restworkshop/repositories/TaskRepository.java), `JpaRepository<Task, Long>` genişletir. Spring Data uygulamayı üretir. `findByStatus` adından filtre sorgusu türetilir. Repository HTTP status'u seçmez ve DONE kuralını yönetmez.

## Model ve enum

[Task](../backend/src/main/java/com/example/restworkshop/models/Task.java), `tasks` tablosuna bağlı JPA entity'sidir. [TaskStatus](../backend/src/main/java/com/example/restworkshop/enums/TaskStatus.java) değerleri OPEN, IN_PROGRESS, DONE'dır. `EnumType.STRING` sayesinde veritabanında enum metni tutulur. Paket değişikliği tablo adını ve kayıtları değiştirmez.

## DTO: HTTP sözleşmesi

İstek ve yanıtlar getter/setter kullanan sınıflardır. İstek DTO'larında Jakarta Validation annotation'ları korunur. JSON alan adları değişmez.

POST DTO'su id/status kabul etmez; PUT title/description/status alır; PATCH yalnızca status alır. Yanıt DTO'su entity'nin HTTP'de sunulan temsilidir. Entity'yi doğrudan döndürmek API'yi kalıcılık modeline bağlar.

## MapStruct: modelden yanıt DTO'suna

[TaskMapper](../backend/src/main/java/com/example/restworkshop/dto/mapper/TaskMapper.java):

```java
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface TaskMapper {
    TaskResponse toDto(Task task);
    List<TaskResponse> toDto(List<Task> tasks);
}
```

Maven annotation processor, bu arayüzün getter/setter çağıran uygulamasını derleme sırasında üretir. Spring bunu bean olarak Service'e verir. Eşlenmeyen hedef alan derleme hatası olur.

MapStruct veritabanı sorgusu yapmaz; JSON da üretmez. Sadece Java modelini Java DTO'suna çevirir. JSON serileştirmesini Spring MVC/Jackson yapar. Oluşturma, güncelleme ve durum geçişi kararları Service'te kalır.

## Advice ve exception

[GlobalExceptionHandler](../backend/src/main/java/com/example/restworkshop/controllers/advice/GlobalExceptionHandler.java), `controllers/advice` altında MVC hatalarını ProblemDetail'e çevirir. İş kuralı exception'ları `exception` paketindedir. Validation 400, bulunamama 404, durum çatışması 409 üretir.

Spring Security filtre hatalarının bu MVC advice üzerinden otomatik geçtiğini varsayma; P5'te güvenlik handler'ları ayrıca düzenlenecek.

[Önceki: Kurulum](02-kurulum.md) · [Sonraki: Request/Response](04-request-response.md)
