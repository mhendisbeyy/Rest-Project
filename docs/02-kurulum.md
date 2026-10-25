# 02 — Kurulum ve çalıştırma

## Araçlar ve sürümler

| Araç | Projedeki seçim |
| --- | --- |
| Java | 21 |
| Spring Boot | 4.1.2 |
| Maven | Wrapper 3.9.9 |
| Veritabanı | PostgreSQL, localhost:5432/gorevdb |
| Frontend | Next.js 15.5.28, React 19.3.1, JavaScript |
| UI | PrimeReact 10.9.9, PrimeFlex 4, PrimeIcons 7, Lara Light Indigo |
| İstek/durum/stil | Axios 1.20.0, Redux Toolkit 2.13.0, React Redux 9.3.0, Sass 1.106.1 |
| Geliştirme | Node.js 22+, npm, ESLint, Vitest |

Kesin bağımlılıklar [pom.xml](../backend/pom.xml), [package.json](../frontend/package.json) ve [package-lock.json](../frontend/package-lock.json) içindedir. Referans alınan YKH klasörleri yalnızca okunmuştur; kurum entegrasyonları kopyalanmamıştır.

## 1. PostgreSQL

Önceden kurulmuş `gorevdb` kullanılır. Varsayılan kullanıcı ve parola `gorev` / `gorev`. [application.properties](../backend/src/main/resources/application.properties) bağlantıyı şu varsayılanla açar:

```text
jdbc:postgresql://localhost:5432/gorevdb
```

`ddl-auto=update` mevcut tabloya bağlanır; `create` veya `create-drop` kullanılmaz. Mevcut kayıtlar silinmez. `DemoDataInitializer` yalnızca `tasks` tablosu boşsa altı örnek görev ekler. Kullanıcı adı/parola yerel eğitim içindir.

Farklı bağlantı gerekiyorsa backend terminalinde:

```powershell
$env:DB_URL='jdbc:postgresql://localhost:5432/gorevdb'
$env:DB_USERNAME='gorev'
$env:DB_PASSWORD='gorev'
```

## 2. Backend

Proje kökünden:

```powershell
Set-Location backend
java -version
.\mvnw.cmd spring-boot:run
```

Maven kuruluysa `mvn spring-boot:run` da kullanılabilir. İlk çalıştırma bağımlılıkları indirir. Port 8080'dir.

Çalıştırılabilir WAR üretmek için aynı klasörde:

```powershell
.\mvnw.cmd clean package
java -jar target\rest-workshop-0.0.1-SNAPSHOT.war
```

Bu iki başlatma yönteminden birini kullan; aynı portta iki backend açma. Ana uygulama `SpringBootServletInitializer` sınıfından türetilir. Gömülü Tomcat ile `java -jar` desteklenir; haricî servlet sunucusuna dağıtım bu çalışmada ayrıca denenmemiştir.

MapStruct 1.6.3 annotation processor, Maven compile sırasında `target/generated-sources/annotations` altında `TaskMapperImpl` üretir. Üretilen sınıf elle düzenlenmez. IDE'de annotation processing etkin olmalı veya Maven üzerinden derleme yapılmalıdır.

## 3. Frontend

İkinci terminalde proje kökünden:

```powershell
Set-Location frontend
node --version
npm.cmd ci
npm.cmd run dev
```

`http://localhost:5173` adresi `/pages/gorevler` sayfasına yönlenir. Uygulama Next.js ile çalışır; TypeScript veya Vite uygulama şablonu kullanılmaz.

Üretim build'ini yerelde denemek için geliştirme sunucusunu kapatıp:

```powershell
npm.cmd run build
npm.cmd run start
```

[next.config.mjs](../frontend/next.config.mjs), `/api/:path*` isteğini `http://localhost:8080/api/:path*` adresine rewrite eder. Başka hedef gerekirse frontend'i başlatmadan önce `$env:API_PROXY_TARGET='http://localhost:8080'` ayarlanır. Bu değer istemciye parola/token taşımaz.

Tarayıcıda Axios göreli `/api/tasks` adresini çağırır. Next sunucusu backend'e iletir. Bu akış aynı origin üzerinden yürür. Doğrudan 8080'e farklı origin çağrısı ayrı bir CORS deneyidir.

## 4. API'yi incele

- [Görevler](http://localhost:8080/api/tasks)
- [Swagger UI](http://localhost:8080/swagger-ui/index.html)
- [OpenAPI JSON](http://localhost:8080/v3/api-docs)

springdoc-openapi 3.2.0 görev modellerini ve endpoint'leri belgelendirir. Swagger'da POST'un `201 + Location`, DELETE'in gövdesiz `204` sözleşmesini göster. “Try it out” gerçek PostgreSQL'e yazabilir; ders için kendi oluşturduğun görevi kullan.

## 5. Otomatik kontroller

Backend klasöründe:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

Frontend klasöründe:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Backend'in test profili bellek içi H2 kullanır; `gorevdb` üzerinde çalışmaz. Frontend testleri JSDOM ve kontrollü Axios yanıtları kullanır.

Canlı uygulamalar açıkken proje kökünde:

```powershell
node scripts/smoke-crud.mjs http://127.0.0.1:5173
```

Betik benzersiz bir test görevi oluşturur, CRUD/hata sözleşmesini kontrol eder ve kendi kaydını temizler. Mevcut kayıtları veya ID sayacını sıfırlamaz.

Güncel içerik denetiminde 19 backend ve 23 frontend testi, lint ve Next.js build başarılı. WAR paketleme ve mevcut 6 PostgreSQL kaydının korunması önceki YKH dönüşümünde doğrulanmıştı. Son salt okunur kontrolde gorevdb içinde tasks tablosu bulunmadı; veri erişimi gerektiren canlı istekler 500 döndü. [Güncel ortam bulguları](18-timeline-icerik-denetimi.md). Gerçek tarayıcı provası Chrome erişiminin otomatik onayda reddedilmesi nedeniyle yapılamadı.

[Önceki: HTTP ve REST](01-http-ve-rest.md) · [Sonraki: Katmanlar](03-katmanlar.md)
