# Anlatım notları

P1–P4 ve YKH yapısına dönüşüm tamamlandı: GET/POST/PUT/PATCH/DELETE, form doğrulaması ve hata yanıtları çalışıyor. Önce [ilk çalışan isteği](14-ilk-calisan-istek.md), sonra [CRUD ve doğrulama dersini](15-crud-ve-dogrulama.md) takip et. Security ve request ID ile log izleme henüz uygulanmadı. Veritabanı PostgreSQL; H2 yalnızca backend otomatik testlerinde kullanılıyor.

## Okuma sırası

| Bölüm | Hedef |
| --- | --- |
| [01 — HTTP ve REST](01-http-ve-rest.md) | İstemci/sunucu, kaynak ve temsil kavramları |
| [02 — Kurulum](02-kurulum.md) | Araçlar, proje üretimi ve iki uygulamanın bağlantısı |
| [03 — Katmanlar](03-katmanlar.md) | Controller, Service, Repository, DTO, Model ve MapStruct |
| [04 — Request/Response](04-request-response.md) | URL, header, body, query ve status |
| [05 — HTTP metodları](05-http-metotlari.md) | GET, POST, PUT, PATCH, DELETE, HEAD ve OPTIONS |
| [06 — İsteğin yaşam döngüsü](06-yasam-dongusu.md) | Sayfa ve Redux'tan SQL'e, MapStruct üzerinden JSON yanıta |
| [07 — Spring Security](07-spring-security.md) | P5 hedefi: yerel JWT, authentication ve authorization |
| [08 — Validation ve hatalar](08-validation-ve-hatalar.md) | 400, 401, 403, 404, 409 ve ortak hata yanıtı |
| [09 — React ekranı](09-react-ekrani.md) | Next.js, Redux, Axios, PrimeReact ve HTTP paneli |
| [10 — Demo akışı](10-demo-akisi.md) | 90 dakikalık sunucu notları ve prova listesi |
| [11 — Alıştırmalar ve sorular](11-alistirmalar-ve-sorular.md) | Katılımcı uygulamaları ve cevap anahtarı |
| [12 — API sözleşmesi](12-api-sozlesmesi.md) | Kodlama sırasında başvurulacak kesin davranışlar |
| [13 — Kaynaklar](13-kaynaklar.md) | Resmî belgeler ve teknik referanslar |
| [14 — İlk çalışan istek](14-ilk-calisan-istek.md) | Mevcut kodda React → PostgreSQL akışını adım adım izle |
| [15 — CRUD ve doğrulama](15-crud-ve-dogrulama.md) | POST/PUT/PATCH/DELETE, iş kuralı ve hata yanıtlarını göster |
| [16 — YKH yapısına geçiş](16-ykh-yapisina-gecis.md) | Yeni dosya düzeni, teknoloji dönüşümü ve doğrulama kaydı |
| [17 — İnteraktif istek yolculuğu](17-interaktif-istek-yolculugu.md) | 15 duraklı timeline, DispatcherServlet ayrıntıları ve hata rotaları |
| [18 — Timeline içerik denetimi](18-timeline-icerik-denetimi.md) | Kod karşılaştırması, 27 açıklayıcı örnek, düzeltmeler ve güncel doğrulama sınırları |
| [19 — HTTP ve parametre bağlama rehberleri](19-http-ve-parametre-rehberleri.md) | İki ders ekranı, 10 anotasyon, 7 HTTP metodu ve gerçek görev kodu örnekleri |
| [20 — Servlet FilterChain](20-servlet-filter-chain.md) | Gerçek Boot kayıtları, sıralama, dispatch, lifecycle ve etkileşimli zincir modeli |
| [21 — API ve REST mimarisi](21-api-ve-rest-mimarisi.md) | API sözleşmesi, REST kısıtları ve görev uygulamasının kaynak koduyla değerlendirilmesi |

## Ders anlatma biçimi

Her bölümde önce kullanıcı hareketini göster, sonra HTTP isteğini aç, ilgili Java koduna geç ve yanıtla tekrar ekrana dön. Kavramı tek başına tanımlamak yerine uygulamadaki sorumluluğunu göster.

Katılımcıdan şu dört şeyi ayırmasını iste: HTTP sözleşmesi, Spring'in yaptığı işler, bizim yazdığımız iş kuralı ve React'in yaptığı işler.

## Varsayımlar

- Katılımcılar temel Java, sınıf ve metot kavramlarını biliyor.
- React derinlemesine anlatılmayacak; API istemcisi olarak kullanılacak.
- İlk sunum 90 dakika. Sıfırdan birlikte kodlama ayrı oturumlarda yapılacak.
- Demo yerel makinede çalışacak. HTTPS ve gerçek kullanıcı yönetimi ileri çalışma konusu.
- Ana kaynak modelimiz `Task`; P5’te yerel JWT ile USER/ADMIN örneği kurulacak. Şu an kullanıcı veya token mekanizması yok.

[Geliştirme planına dön](../PLAN.md)
