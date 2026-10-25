# 07 — Spring Security ve yerel JWT örneği

## Mevcut durum

Bu bölüm **P5 planıdır**. Şu an Security bağımlılığı, giriş ekranı, token üretimi veya JWT doğrulama filtresi yoktur. Görev endpoint'leri kimliksiz çalışır. Bugünkü kodda 401/403 güvenlik demosu yapılmış gibi anlatılmaz.

YKH'ye uygun yerel bir JWT örneği kurulacak. Kurumsal SSO, dış kimlik sağlayıcısı veya YKH kullanıcı servisleri taşınmayacak.

## İki temel soru

**Authentication:** “Kimsin?” Yerel demo girişinde kullanıcı adı/parola doğrulanır; istemciye imzalı, süreli bir JWT verilir. JWT parola veya şifreli kullanıcı deposu değildir.

**Authorization:** “Bu işlemi yapabilir misin?” Geçerli token, her işleme izin vermez. USER görevleri okuyup oluşturabilir/güncelleyebilir; yalnızca ADMIN siler. ADMIN'de USER rolü de bulunur.

Backend token'ı yalnızca decode etmekle yetinmez: imza, süre ve yapılandırılan claim koşullarını doğrular. İstemcinin ekranda bir düğmeyi gizlemesi sunucu yetkilendirmesinin yerini almaz.

## Hedef istek akışı

```text
Yerel giriş → kimliği doğrula → JWT üret
Tarayıcı Axios → Authorization: Bearer <token>
Spring Security filtreleri → token doğrula → rol kontrolü
DispatcherServlet → Controller → Service → Repository / MapStruct
```

Token üretimi ve saklama/yenileme politikası P5 uygulanırken açıkça belgelenecek. Şimdiki Axios katmanına sahte token veya örnek Authorization değeri eklenmedi.

## Hedef HTTP sonuçları

| Deney (P5 sonrası) | Beklenen |
| --- | --- |
| Token olmadan korumalı GET | 401 UNAUTHENTICATED |
| Geçersiz veya süresi dolmuş token | 401 UNAUTHENTICATED |
| USER token'ı ile DELETE | 403 ACCESS_DENIED |
| ADMIN token'ı ile DELETE | 204, boş body |
| Geçerli token ile boş title POST | 400 VALIDATION_ERROR |
| Geçerli token ile DONE → OPEN | 409 TASK_STATE_CONFLICT |

401 kimlik doğrulama, 403 yetki sorunudur. 400 ve 409 ise Security'yi geçen isteğin farklı aşamalarda reddedilmesidir.

## Spring tarafındaki parçalar

- `SecurityFilterChain`: hangi yollar açık, hangileri kimlik veya rol ister?
- Yerel demo kullanıcıları ve BCrypt: girişte parola doğrulama.
- JWT üretme/doğrulama bileşenleri: süre, imza anahtarı ve claim kuralları.
- `AuthenticationEntryPoint`: ortak ProblemDetail biçiminde 401.
- `AccessDeniedHandler`: ortak ProblemDetail biçiminde 403.
- Controller'a gelmeden çalışan kimlik ve yetki kontrolleri.

JWT uygulama detayları P5'te seçilecek; bu dönüşüm yalnızca paket/teknoloji uyumunu yapar.

## CSRF ve CORS'u ayır

CORS, tarayıcının farklı origin erişim kurallarıyla ilgilidir; kimlik doğrulama yöntemi değildir. Bu projede Next.js rewrite ile tarayıcı aynı origin'e çağrı yapar.

CSRF kararı, kimlik bilgisinin tarayıcı tarafından otomatik gönderilip gönderilmediğine bağlıdır. Authorization header'ındaki Bearer akışı ile cookie tabanlı kimlik aynı değerlendirmeyi gerektirmez. P5'te token taşıma biçimiyle birlikte açıkça yapılandırılacak. Önceki HTTP Basic + `/api/csrf` planı artık ana yaklaşım değildir.

Yerel JWT örneği bir üretim kimlik altyapısı sayılmaz. Gerçek dağıtımda HTTPS, anahtar yönetimi ve token yaşam süresi ayrıca tasarlanır.

## Anlatım deneyi

P5 tamamlandığında aynı geçici görev üzerinde token yok/geçersiz token/USER/ADMIN denemelerini sırayla yap. Her isteğin header'ını Network panelinde göster. UI HTTP geçmişinde Authorization maskelenmelidir; mevcut Axios istemcisi bu başlığı şimdiden maskeler.

[Önceki: Yaşam döngüsü](06-yasam-dongusu.md) · [Sonraki: Validation ve hatalar](08-validation-ve-hatalar.md)
