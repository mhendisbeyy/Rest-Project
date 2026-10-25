# 09 — Next.js, Redux, Axios ve PrimeReact ekranı

## Ekranın amacı

Katılımcı bir kullanıcı hareketini HTTP isteğiyle eşleştirsin. Solda görev listesi ve detay; sağda son 10 çağrının request/response bilgileri bulunur. Üst menü, yan menü ve içerik alanı YKH düzenini izler. Tema Lara Light Indigo'dur.

## Sayfa ve sağlayıcılar

`app/page.js` kök adresi `/pages/gorevler` yoluna yönlendirir. `(main)` bir route group'tur; URL'ye eklenmez. [Sayfa](<../frontend/app/(main)/pages/gorevler/page.js>), istemci bileşeni TasksPage'i açar.

[app/layout.js](../frontend/app/layout.js) global tema, PrimeFlex/PrimeIcons ve Sass stillerini yükler. [providers.js](../frontend/app/providers.js), Redux, PrimeReact ve menü bağlamını sağlar. `makeStore()` her provider örneğine ayrı store üretir; modül düzeyinde paylaşılan store yoktur.

## Durum nerede tutulur?

| Veri | Yer |
| --- | --- |
| Görevler, filtre, page/size, seçili detay, yükleniyor/hata durumu | [taskSlice](../frontend/store/slices/taskSlice.js) |
| Son 10 HTTP çağrısı ve seçili çağrı | [httpSlice](../frontend/store/slices/httpSlice.js) |
| Başlık/açıklama/durum form taslağı, alan hataları | TaskFormDialog bileşeni |
| Formun açık olması | TasksPage bileşeni |
| Yan menünün açık olması | Layout context |

Formdaki her tuş vuruşu Redux'a veya sunucuya gönderilmez. Kaydetme sırasında taslak API girdisine çevrilir.

## Bir liste isteği

1. [TasksPage](<../frontend/app/(main)/pages/gorevler/components/TasksPage.jsx>) page/size/status değişince `dispatch(loadTasks(...))` çağırır.
2. Redux async thunk `taskService.getAll` metoduna gider.
3. [taskService.js](../frontend/services/taskService.js), kaynak yolunu ve query parametrelerini belirler.
4. [api.js](../frontend/services/api.js), Axios ile tarayıcıdan isteği gönderir.
5. Next.js rewrite isteği Spring backend'e iletir.
6. Yanıt Redux liste durumunu ve HTTP geçmişini günceller; DataTable yeniden çizilir.

Eski liste/detay çağrıları AbortSignal ile iptal edilir. Redux thunk request ID kontrolü eski bir yanıtın yeni seçimi ezmesini önler. Bu istemci içi kimlik, P6'da eklenecek sunucu `X-Request-ID` başlığı değildir.

## PrimeReact parçaları

- `DataTable` / `Column`: liste ve satır seçimi.
- `Dropdown`: durum filtresi, sayfa boyutu ve durum değişimi.
- `Dialog`: yeni/düzenle formu ve silme onayı.
- `InputText` / `InputTextarea`: başlık ve açıklama.
- `Button`, `Tag`, `Toast`: eylemler, durum etiketi ve başarı bildirimi.

Tüm durumlar seçimi boş metin değeriyle temsil edilir; servis bunu URL'ye status olarak eklemez. Filtre değişince sayfa 0'a döner. Son sayfanın son kaydı silinirse liste geçerli önceki sayfaya düzeltilir.

## Form ve yazma yanıtı

[TaskFormDialog](<../frontend/app/(main)/pages/gorevler/Dialogs/TaskFormDialog.jsx>), oluşturma modunda POST; düzenleme modunda PUT girdisi toplar. PATCH detay alanından yalnızca status gönderir. Silme ayrı onay ister.

Backend `fieldErrors` gönderirse ilgili alanın altında gösterilir ve taslak korunur. Genel hata mesajı da görünür. Form `noValidate` kullanır; böylece eğitimde sunucunun validation yanıtı gösterilebilir.

Başarılı yazma çağrısı HTTP panelinde seçilir. Listeyi güncelleyen GET geçmişe eklenir fakat yazma yanıtının seçimini değiştirmez. Kullanıcı geçmişten istediği çağrıyı seçebilir.

## Ortak Axios davranışı

`request()`, başarıda `{ data, exchange }` döndürür. Exchange; method, URL, header'lar, body, status ve istemci süresini içerir.

| Durum | Davranış |
| --- | --- |
| 201 JSON | Body ve Location header'ı korunur |
| 204 | JSON parse edilmez; data undefined, panelde gövde yok |
| 400/404/409 ProblemDetail | detail/code/fieldErrors korunur |
| Ağ hatası | Status null; bağlantı mesajı gösterilir |
| İptal | Başarısız API çağrısı gibi hata gösterilmez |
| Yanlış yönlendirme sonucu HTML | Beklenen JSON gelmediği açıkça bildirilir |

Authorization, Cookie, Set-Cookie ve CSRF başlıkları geçmişe açık değerleriyle kaydedilmez. Süre tarayıcıdan gözlenen toplam süredir; tek tek backend katman süreleri ölçülmez.

## Test sınırı

29 test Axios ve gerçek PrimeReact bileşenlerinin JSDOM davranışlarını doğrular. Timeline etkileşimleri, seçili senaryoya uygun Advice/JSON ve Servlet örnekleri, store yalıtımı, filtreyi tüm durumlara geri alma, alan hataları, PUT/PATCH, silme onayı, son sayfa ve yazma yanıtı seçimi kapsanır. [HTTP ve parametre bağlama rehberlerinin](19-http-ve-parametre-rehberleri.md) filtre/dialog davranışları, FilterChain modeli ve API/REST ekranı da test edilir. Timeline dialoglarındaki 27 karşılaştırma örneği için [içerik denetimi](18-timeline-icerik-denetimi.md). Otomatik onay Chrome erişimini reddettiğinden gerçek tarayıcı görsel provası yapılamadı.

[Önceki: Hatalar](08-validation-ve-hatalar.md) · [Sonraki: Demo akışı](10-demo-akisi.md)
