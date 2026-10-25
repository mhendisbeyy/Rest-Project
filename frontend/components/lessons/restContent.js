const fielding = 'https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm';

export const restConstraints = [
  {
    id: 'client-server', title: 'Client–Server', subtitle: 'İstemci ve sunucu sorumlulukları', icon: 'pi-desktop', status: 'Uygulanıyor', severity: 'success',
    rule: 'Arayüz ile veri/işlem sorumlulukları ayrı bileşenlerde yürür.',
    application: 'Next.js/React ekranı Axios servisini çağırır; Java backend görevi işler ve PostgreSQL’e erişir. Aynı HTTP sözleşmesini kullanan başka bir istemci de görev API’sine bağlanabilir.',
    code: `getAll({ page, size, status }, signal) {
  return request('/api/tasks', { params: { page, size, ...(status ? { status } : {}) }, signal });
}`,
    codeLabel: 'Projedeki görev servisi', file: 'frontend/services/taskService.js',
    takeaway: 'Tarayıcı DB kimlik bilgileriyle PostgreSQL’e bağlanmaz. Ekran ile backend arasındaki ortak sözleşme HTTP isteği/yanıtıdır.', source: fielding,
  },
  {
    id: 'stateless', title: 'Stateless', subtitle: 'Her istek kendi bağlamını taşır', icon: 'pi-send', status: 'Uygulanıyor', severity: 'success',
    rule: 'Bir isteği anlamak için önceki istemci oturum bağlamına ihtiyaç duyulmaz.',
    application: 'Liste çağrısı page/size/status bilgisini her seferinde gönderir. TaskController, “bu kullanıcı önce OPEN seçmişti” diye session’dan filtre okumaz; HttpSession argümanı kullanmaz.',
    code: 'GET /api/tasks?page=0&size=5&status=OPEN\nGET /api/tasks?page=1&size=5&status=OPEN',
    codeLabel: 'Ayrı ayrı anlaşılabilen iki istek', file: 'backend/src/main/java/com/example/restworkshop/controllers/TaskController.java',
    takeaway: 'Görevlerin PostgreSQL’de saklanması ve Redux’ta UI state bulunması bu kuralı bozmaz. Kaynak durumu ile sunucuda tutulan istemci oturum bağlamı farklıdır. JWT, P5 planıdır; stateless özelliğinin tek başına kanıtı değildir.', source: fielding,
  },
  {
    id: 'cache', title: 'Cache', subtitle: 'Yanıtın yeniden kullanım koşulları', icon: 'pi-clock', status: 'Geliştirilecek', severity: 'warning',
    rule: 'Yanıtın önbellekte yeniden kullanılma koşulları anlaşılabilir olmalıdır.',
    application: 'Görev API’sinde uygulamaya özel Cache-Control/ETag/If-None-Match kodu henüz yok. Bu değerlendirme mevcut kaynak koduna dayanır; canlı cache testi yapılmadı.',
    code: '// Öğretici seçenekler; görev API’sinde uygulanmadı.\nCache-Control: no-store\n\n// Başka bir tasarım seçeneği:\nETag: "gorev-surumu"\nIf-None-Match: "gorev-surumu" → değişmediyse 304',
    codeLabel: 'Uygulanmamış HTTP cache seçenekleri', file: 'backend/src/main/java/com/example/restworkshop/controllers/TaskController.java',
    takeaway: 'Header’ın kodda seçilmemiş olması her GET’in mutlaka cache dışı olduğu anlamına gelmez; HTTP cache kuralları da etkilidir. Redux state’i veya JPA persistence context’i HTTP cache politikasının yerine geçmez.',
    source: 'https://www.rfc-editor.org/rfc/rfc9111.html',
  },
  {
    id: 'uniform', title: 'Uniform Interface', subtitle: 'Tek biçimli arayüz · dört alt kısıt', icon: 'pi-th-large', status: 'Kısmen uygulanıyor', severity: 'warning',
    rule: 'Bileşenler ortak, anlaşılır bir kaynak arayüzüyle iletişim kurar.',
    application: 'Kaynak yollarını, DTO temsillerini, HTTP metot/status/header anlamlarını kullanıyoruz. Yanıttan sonraki işlemleri keşfettiren hypermedia/HATEOAS katmanı henüz yok.',
    code: 'private Long id;\nprivate String title;\nprivate String description;\nprivate TaskStatus status;',
    codeLabel: 'Gerçek TaskResponse alanları', file: 'backend/src/main/java/com/example/restworkshop/dto/TaskResponse.java',
    takeaway: 'TaskResponse iş verisini taşır; _links veya izin verilen işlemlerin ilişkilerini sunmaz. taskService.js URL’leri kendisi kurar. POST Location header’ı yararlıdır; tek başına bütün hypermedia akışını sağlamaz.',
    source: 'https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven',
  },
  {
    id: 'layered', title: 'Layered System', subtitle: 'HTTP iletişiminde aracı katmanlar', icon: 'pi-sitemap', status: 'Yerelde örnekleniyor', severity: 'info',
    rule: 'Bileşenler doğrudan konuştukları katmanın ötesine bağımlı olmadan çalışabilir.',
    application: 'Tarayıcı /api/tasks çağrısını Next.js’e gönderir; rewrite bunu Spring backend’e iletir. Bu, yerel HTTP aracı örneğidir. İstemci aynı API sözleşmesiyle yanıtı tüketir.',
    code: "return [{ source: '/api/:path*', destination: `${process.env.API_PROXY_TARGET || 'http://localhost:8080'}/api/:path*` }];",
    codeLabel: 'Gerçek Next.js rewrite kuralı', file: 'frontend/next.config.mjs',
    takeaway: 'Controller/Service/Repository uygulama içi kod katmanlarıdır. REST’in layered system kısıtı HTTP etkileşimindeki proxy/gateway/cache gibi aracılarla ilgilidir. Bu projede üretim gateway/CDN kurulmadı.', source: fielding,
  },
  {
    id: 'code-on-demand', title: 'Code on Demand', subtitle: 'İsteğe bağlı kısıt', icon: 'pi-code', status: 'İsteğe bağlı', severity: 'secondary',
    rule: 'Sunucu istemcinin yeteneklerini çalıştırılabilir kod göndererek genişletebilir.',
    application: 'Next.js ekranı tarayıcıya JavaScript dosyaları sunar. Görev JSON API’si ise TaskResponse/TaskPageResponse ve hata temsilleri döndürür; bu API için ayrıca kod indirme davranışı tasarlanmadı.',
    code: 'GET /api/tasks → TaskPageResponse JSON\nPOST /api/tasks → TaskResponse JSON\nDELETE /api/tasks/{id} → 204, body yok',
    codeLabel: 'Mevcut görev API’sinin yanıt biçimleri', file: 'backend/src/main/java/com/example/restworkshop/controllers/TaskController.java',
    takeaway: 'Bu kısıt isteğe bağlıdır. Görev endpoint’lerinin JavaScript döndürmesi gerekmez. Arayüzün JS yüklemesiyle görev API’sinin sunduğu temsilleri ayrı değerlendir.', source: fielding,
  },
];

export const uniformDetails = [
  { title: 'Kaynakların tanımlanması', rule: 'Kaynak, kimliğiyle tanınır.', example: '/api/tasks koleksiyon; /api/tasks/42 tek görev.', status: 'Var' },
  { title: 'Temsiller üzerinden işlem', rule: 'İstemci kaynak temsilleriyle çalışır.', example: 'JSON → Create/Update DTO; TaskResponse → JSON. JPA entity doğrudan API body’si olarak sunulmaz.', status: 'Var' },
  { title: 'Kendini açıklayan mesajlar', rule: 'Mesaj, işlenmesine yetecek anlamı taşır.', example: 'Method, URL, Content-Type, Accept, status ve ProblemDetail bu sözleşmeyi açıklar.', status: 'Kullanılıyor' },
  { title: 'Hypermedia / HATEOAS', rule: 'Sonraki seçenekler yanıttaki ilişkilerle keşfedilir.', example: 'Görev yanıtı iş verisidir; frontend URL ve işlemleri önceden bilir. İlişki/action temsilleri henüz tasarlanmadı.', status: 'Eksik' },
];

export const restExamples = [
  {
    id: 'list', label: 'Listele · GET', resource: 'Görev koleksiyonunun filtreli, sayfalı temsili',
    request: 'GET /api/tasks?status=OPEN&page=0&size=5 HTTP/1.1\nHost: localhost:8080\nAccept: application/json, application/problem+json',
    response: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"items":[{"id":42,"title":"Sunumu hazırla","description":null,"status":"OPEN"}],"page":0,"size":5,"totalElements":1,"totalPages":1}',
    note: 'Query, hangi temsili istediğimizi belirtir. Çalışan DB ve bu örnek veri varsayılır; boş filtre sonucu 200 ve boş items olabilir.',
  },
  {
    id: 'create', label: 'Oluştur · POST', resource: 'Görev koleksiyonunda yeni kaynak',
    request: 'POST /api/tasks HTTP/1.1\nHost: localhost:8080\nContent-Type: application/json\nAccept: application/json, application/problem+json\n\n{"title":"Sunumu hazırla","description":null}',
    response: 'HTTP/1.1 201 Created\nLocation: /api/tasks/42\nContent-Type: application/json\n\n{"id":42,"title":"Sunumu hazırla","description":null,"status":"OPEN"}',
    note: 'Service OPEN başlangıcını belirler. Controller 201 ve Location üretir. 42 temsili ID’dir; gerçek demoda dönen ID kullanılır.',
  },
  {
    id: 'patch', label: 'Durum · PATCH', resource: 'Mevcut görevin durumunda kısmi değişiklik',
    request: 'PATCH /api/tasks/42 HTTP/1.1\nHost: localhost:8080\nContent-Type: application/json\n\n{"status":"DONE"}',
    response: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id":42,"title":"Sunumu hazırla","description":null,"status":"DONE"}',
    note: 'Önkoşul: görev mevcut. title/description korunur. Tersine DONE → OPEN, iş kuralı nedeniyle 409 TASK_STATE_CONFLICT üretir.',
  },
  {
    id: 'delete', label: 'Sil · DELETE', resource: 'Mevcut görev kaynağının silinmesi',
    request: 'DELETE /api/tasks/42 HTTP/1.1\nHost: localhost:8080',
    response: 'HTTP/1.1 204 No Content',
    note: 'Önkoşul: görev mevcut. 204 yanıtta body yok; JSON/null/{} yazılmaz. Aynı ID’ye ikinci silme, çalışan DB’de 404 üretir.',
  },
];

export const resourceRoutes = [
  ['GET', '/api/tasks?status=OPEN&page=0&size=5', 'Filtreli liste', '200'],
  ['GET', '/api/tasks/{id}', 'Tek görev', '200 / bulunamazsa 404'],
  ['POST', '/api/tasks', 'Oluştur', '201 + Location'],
  ['PUT', '/api/tasks/{id}', 'Düzenlenebilir temsili değiştir', '200 / DONE çatışmasında 409'],
  ['PATCH', '/api/tasks/{id}', 'Yalnızca durumu değiştir', '200 / DONE çatışmasında 409'],
  ['DELETE', '/api/tasks/{id}', 'Sil', '204, body yok'],
];
