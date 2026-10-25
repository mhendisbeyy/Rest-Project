const mvc = 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller';
const controllerFile = 'backend/src/main/java/com/example/restworkshop/controllers/TaskController.java';
const httpSpec = 'https://www.rfc-editor.org/rfc/rfc9110.html#section-9';

// Excerpts from TaskController; the class has @RequestMapping("/api/tasks").
const controller = {
  list: `@GetMapping
public TaskPageResponse findAll(
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "5") @Min(1) @Max(50) int size
) {
    return taskService.findAll(status, page, size);
}`,
  get: `@GetMapping("/{id}")
public TaskResponse findById(@PathVariable @Positive Long id) {
    return taskService.findById(id);
}`,
  create: `public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
    TaskResponse task = taskService.create(request);
    return ResponseEntity.created(URI.create("/api/tasks/" + task.getId())).body(task);
}`,
  put: `@PutMapping("/{id}")
public TaskResponse update(@PathVariable @Positive Long id,
                           @Valid @RequestBody UpdateTaskRequest request) {
    return taskService.update(id, request);
}`,
  patch: `@PatchMapping("/{id}")
public TaskResponse updateStatus(@PathVariable @Positive Long id,
                                 @Valid @RequestBody UpdateTaskStatusRequest request) {
    return taskService.updateStatus(id, request);
}`,
  delete: `public ResponseEntity<Void> delete(@PathVariable @Positive Long id) {
    taskService.delete(id);
    return ResponseEntity.noContent().build();
}`,
};

export const bindingAnnotations = [
  {
    id: 'request-param', name: '@RequestParam', scope: 'project', icon: 'pi-filter', location: 'Query / form alanı',
    summary: 'Filtre ve sayfalama gibi istek parametrelerini Java argümanına bağlar.',
    request: 'GET /api/tasks?status=OPEN&page=0&size=5 HTTP/1.1\nHost: localhost:8080\nAccept: application/json',
    code: controller.list, file: controllerFile,
    result: 'status = TaskStatus.OPEN\npage = 0\nsize = 5',
    explanation: 'Görev listesindeki durum filtresi ve sayfalama bu metodu kullanır. status gönderilmezse null, page/size gönderilmezse 0/5 alınır. Servlet MVC’de form alanları da @RequestParam ile okunabilir.',
    pitfall: 'Varsayılan olarak zorunludur; required=false veya defaultValue davranışı değiştirir. status=UNKNOWN dönüşüm hatası, page=-1 ise @Min ihlalidir; ikisi de bu API’de 400 döner. JSON body alanlarını @RequestParam okumaz.',
    source: `${mvc}/ann-methods/requestparam.html`,
  },
  {
    id: 'path-variable', name: '@PathVariable', scope: 'project', icon: 'pi-link', location: 'URL yolu',
    summary: 'URL şablonundaki {id} gibi bir parçayı metot argümanına bağlar.',
    request: 'GET /api/tasks/42 HTTP/1.1\nHost: localhost:8080\nAccept: application/json',
    code: controller.get, file: controllerFile,
    result: 'id = Long 42\n@PathVariable → değeri alır\n@Positive → pozitif olmasını doğrular',
    explanation: '42 bir kaynak kimliğidir; query parametresi değildir. Ortak /api/tasks yolu ve /{id} eşlemesi birlikte bu metodu seçer. Görevin mevcut olup olmadığı daha sonra Service’te kontrol edilir.',
    pitfall: 'id=0 doğrulamadan 400 alır. Pozitif ve geçerli ID’nin kaydı yoksa, çalışan veritabanında 404 TASK_NOT_FOUND döner. URL’de sayı olmayan bir ID de Java Long’a dönüşemez.',
    source: `${mvc}/ann-requestmapping.html`,
  },
  {
    id: 'request-body', name: '@RequestBody', scope: 'project', icon: 'pi-code', location: 'HTTP body',
    summary: 'İstek gövdesini mesaj dönüştürücüyle Java nesnesine okur.',
    request: 'POST /api/tasks HTTP/1.1\nHost: localhost:8080\nContent-Type: application/json\nAccept: application/json\n\n{"title":"Sunumu hazırla","description":null}',
    code: controller.create, file: controllerFile,
    result: 'CreateTaskRequest\ntitle = "Sunumu hazırla"\ndescription = null\n@Valid → DTO kısıtlarını denetler',
    explanation: 'JSON’u Jackson okur. @RequestBody bağlamayı, @Valid doğrulamayı tetikler; @NotBlank/@Size kuralları DTO’da tanımlıdır. Oluşturulan görevin OPEN durumunu Service belirler.',
    pitfall: 'Bozuk JSON ile boş başlık aynı hata değildir: ilki INVALID_REQUEST, ikincisi VALIDATION_ERROR üretir. İkisi de 400’dür. Content-Type gelen body’nin, Accept ise beklenen yanıtın türünü anlatır.',
    source: `${mvc}/ann-methods/requestbody.html`,
  },
  {
    id: 'request-header', name: '@RequestHeader', scope: 'example', icon: 'pi-align-left', location: 'HTTP header',
    summary: 'Bir istek header’ını Java argümanında okumayı sağlar.',
    request: 'GET /ornekler/dil HTTP/1.1\nHost: localhost:8080\nAccept-Language: tr',
    code: '@GetMapping("/ornekler/dil")\npublic String dil(\n        @RequestHeader(name = "Accept-Language", defaultValue = "tr") String dil) {\n    return dil;\n}',
    result: 'dil = "tr"',
    explanation: 'Header, URL filtresi veya JSON alanı değildir. Bu ek örnek bir dil tercihini okur. Mevcut TaskController’da @RequestHeader argümanı bulunmaz; Accept/Content-Type zaten MVC tarafından değerlendirilir.',
    pitfall: 'Bir header’ı okumak kimlik doğrulamak anlamına gelmez. Projede JWT henüz yoktur; bu örnek yeni bir güvenlik mekanizması kurmaz.',
    source: `${mvc}/ann-methods/requestheader.html`,
  },
  {
    id: 'model-attribute', name: '@ModelAttribute', scope: 'example', icon: 'pi-list', location: 'Birden fazla alan → nesne',
    summary: 'Query/form gibi alanları tek bir model nesnesinde toplar.',
    request: 'GET /ornekler/filtre?status=OPEN&page=0 HTTP/1.1\nHost: localhost:8080',
    code: '// Kavramsal JavaBean; getter/setter metotları da bulunur.\npublic class TaskFilter {\n    private TaskStatus status;\n    private int page;\n}\n\n@GetMapping("/ornekler/filtre")\npublic String filtre(@ModelAttribute TaskFilter filtre) {\n    return filtre.getStatus() + ":" + filtre.getPage();\n}',
    result: 'filtre.status = TaskStatus.OPEN\nfiltre.page = 0',
    explanation: 'Bu örnekte iki query alanı bir JavaBean’e bağlanır. MVC, URI değişkenleri ve uygun header’lardan da model alanları çözebilir. Görev API’miz şu an ayrı @RequestParam argümanlarını kullanır.',
    pitfall: 'JSON’u @RequestBody gibi okumaz. Gelen alanları doğrudan veritabanı entity’sine bağlamak yerine yalnızca izin verilen alanları içeren ayrı bir giriş sınıfı kullan.',
    source: `${mvc}/ann-methods/modelattrib-method-args.html`,
  },
  {
    id: 'cookie-value', name: '@CookieValue', scope: 'example', icon: 'pi-sliders-h', location: 'Cookie header’ındaki değer',
    summary: 'Gönderilen cookie içinden adı belirtilen değeri okur.',
    request: 'GET /ornekler/tema HTTP/1.1\nHost: localhost:8080\nCookie: tema=acik',
    code: '@GetMapping("/ornekler/tema")\npublic String tema(\n        @CookieValue(name = "tema", defaultValue = "acik") String tema) {\n    return tema;\n}',
    result: 'tema = "acik"',
    explanation: 'Cookie header’ının tamamı yerine tema adlı değere erişilir. TaskController bu anotasyonu kullanmaz; görev uygulamasına cookie eklenmedi.',
    pitfall: 'Cookie okumak, yeni cookie oluşturmaz. Yanıtta cookie ayarlamak ayrı bir işlemdir; bu örnek oturum açma uygulamaz.',
    source: `${mvc}/ann-methods/cookievalue.html`,
  },
  {
    id: 'request-part', name: '@RequestPart', scope: 'example', icon: 'pi-paperclip', location: 'Multipart body parçası',
    summary: 'Dosya ve JSON gibi ayrı multipart parçalarını okumayı sağlar.',
    request: 'POST /ornekler/ekler HTTP/1.1\nHost: localhost:8080\nContent-Type: multipart/form-data; boundary=demo\n\n--demo\nContent-Disposition: form-data; name="meta"\nContent-Type: application/json\n\n{"title":"Sunum eki","description":null}\n--demo\nContent-Disposition: form-data; name="dosya"; filename="not.txt"\nContent-Type: text/plain\n\nDers notu\n--demo--',
    code: '@PostMapping(value = "/ornekler/ekler", consumes = "multipart/form-data")\npublic String ek(\n        @Valid @RequestPart("meta") CreateTaskRequest meta,\n        @RequestPart("dosya") MultipartFile dosya) {\n    return meta.getTitle() + ":" + dosya.getOriginalFilename();\n}',
    result: 'meta.title = "Sunum eki"\ndosya.originalFilename = "not.txt"',
    explanation: 'JSON meta parçası kendi Content-Type bilgisine göre DTO’ya okunur; dosya MultipartFile olarak alınır. Bu, tek JSON body gönderen görev API’mizden farklı bir ek örnektir.',
    pitfall: 'Parça adları meta/dosya eşleşmelidir. Tarayıcı FormData gönderirken boundary’yi tarayıcı üretir. Görev uygulamasına dosya yükleme endpoint’i eklenmedi.',
    source: `${mvc}/ann-methods/multipart-forms.html`,
  },
  {
    id: 'request-attribute', name: '@RequestAttribute', scope: 'example', icon: 'pi-tag', location: 'Sunucudaki request attribute',
    summary: 'İstek işlenirken sunucu tarafında önceden eklenmiş bir değeri alır.',
    request: 'GET /ornekler/izleme HTTP/1.1\nHost: localhost:8080',
    condition: 'Sunucuda önce çalışan bir filter/interceptor, request.setAttribute("requestId", "demo-123") çağırmış olsun.',
    code: '@GetMapping("/ornekler/izleme")\npublic String izleme(@RequestAttribute("requestId") String requestId) {\n    return requestId;\n}',
    result: 'requestId = "demo-123"\nDeğer HTTP query/header’dan doğrudan gelmez.',
    explanation: 'Örneğin sunucunun önceki bir bileşeni request üzerine veri koyabilir. Bu örnekte o hazırlık varsayılır; projede request ID filtresi henüz uygulanmadı.',
    pitfall: '?requestId=demo-123 göndermek request attribute oluşturmaz. @RequestParam, @RequestHeader ve @RequestAttribute farklı kaynakları okur.',
    source: `${mvc}/ann-methods/requestattrib.html`,
  },
  {
    id: 'session-attribute', name: '@SessionAttribute', scope: 'example', icon: 'pi-user', location: 'Sunucudaki mevcut session',
    summary: 'Oturumda önceden saklanmış bir attribute’u controller’a alır.',
    request: 'GET /ornekler/oturum-temasi HTTP/1.1\nHost: localhost:8080\nCookie: JSESSIONID=ORNEK_OTURUM',
    condition: 'Bu cookie ile eşleşen sunucu session’ında tema="acik" daha önce saklanmış olsun.',
    code: '@GetMapping("/ornekler/oturum-temasi")\npublic String oturumTemasi(\n        @SessionAttribute(name = "tema", required = false) String tema) {\n    return tema == null ? "varsayilan" : tema;\n}',
    result: 'Önkoşul sağlanırsa tema = "acik"\nAttribute yoksa required=false nedeniyle null.',
    explanation: 'Session attribute sunucudadır; cookie burada oturumun kimliğini taşıyabilir. @CookieValue ise doğrudan cookie metnini okur. Görev API’mizde bu oturum örneği uygulanmadı.',
    pitfall: '@SessionAttribute, sınıf seviyesindeki @SessionAttributes ile aynı anotasyon değildir. Bu örnek yeni oturum veya kullanıcı girişi oluşturmaz.',
    source: `${mvc}/ann-methods/sessionattribute.html`,
  },
  {
    id: 'matrix-variable', name: '@MatrixVariable', scope: 'example', icon: 'pi-share-alt', location: 'URL segmentindeki ; alanı',
    summary: 'Bir URL segmentine bağlı noktalı virgüllü değeri çözümler.',
    request: 'GET /ornekler/gorevler/42;gorunum=kisa HTTP/1.1\nHost: localhost:8080',
    code: '@GetMapping("/ornekler/gorevler/{id}")\npublic String gorunum(\n        @PathVariable Long id,\n        @MatrixVariable(name = "gorunum", pathVar = "id") String gorunum) {\n    return id + ":" + gorunum;\n}',
    result: 'id = Long 42\ngorunum = "kisa"',
    explanation: 'gorunum değeri 42 segmentine bağlıdır. Görev API’sindeki ?status=OPEN bir query parametresidir; matrix değişkeni değildir.',
    pitfall: 'Bu ek endpoint projede yoktur. Matrix çözümleme kullanılan path eşleme ayarlarıyla desteklenmelidir; dersin ana API’si query parametrelerini kullanır.',
    source: `${mvc}/ann-methods/matrix-variables.html`,
  },
];

export const httpMethods = [
  {
    id: 'get', name: 'GET', scope: 'project', icon: 'pi-search', location: '@GetMapping',
    summary: 'Kaynağın temsilini okur; görev listesi ve detayını getirir.', safe: 'Evet', idempotent: 'Evet',
    request: 'GET /api/tasks?status=OPEN&page=0&size=5 HTTP/1.1\nHost: localhost:8080\nAccept: application/json',
    code: controller.list, file: controllerFile,
    result: '200 OK → TaskPageResponse\nitems, page, size, totalElements, totalPages',
    explanation: 'Görev Yönetimi’ndeki liste ve filtre bu çağrıyı kullanır. /api/tasks/{id} ise ayrı findById metodudur. Geçerli ama boş bir liste sayfası 200 ve boş items dönebilir.',
    pitfall: 'Bu API filtreyi query’den alır; GET body göndermeyiz. Geçersiz filtre/sayfa 400; geçerli ID’de bulunamayan görev, çalışan veritabanında 404 üretir.', source: httpSpec,
  },
  {
    id: 'post', name: 'POST', scope: 'project', icon: 'pi-plus', location: '@PostMapping',
    summary: 'Hedef kaynağın isteği işlemesini ister; burada yeni görev oluşturur.', safe: 'Hayır', idempotent: 'Garanti değil',
    request: 'POST /api/tasks HTTP/1.1\nHost: localhost:8080\nContent-Type: application/json\n\n{"title":"Sunumu hazırla","description":null}',
    code: controller.create, file: controllerFile,
    result: '201 Created\nLocation: /api/tasks/{üretilen-id}\nBody: yeni TaskResponse, status=OPEN',
    explanation: 'Yeni görev formu bu metodu çağırır. id veritabanında üretilir; Service başlangıç durumunu OPEN yapar. Aynı POST’u iki kez göndermek bu uygulamada iki ayrı görev oluşturabilir.',
    pitfall: 'Genel POST anlamı yalnızca kayıt eklemekle sınırlı değildir. Bizim POST sözleşmemizde boş title, 400 VALIDATION_ERROR ve title alan hatası üretir.', source: httpSpec,
  },
  {
    id: 'put', name: 'PUT', scope: 'project', icon: 'pi-pencil', location: '@PutMapping',
    summary: 'Hedef kaynağın düzenlenebilir temsilini bütünüyle değiştirir.', safe: 'Hayır', idempotent: 'Evet',
    request: 'PUT /api/tasks/42 HTTP/1.1\nHost: localhost:8080\nContent-Type: application/json\n\n{"title":"Sunumu bitir","description":null,"status":"IN_PROGRESS"}',
    code: controller.put, file: controllerFile,
    result: 'Kayıt mevcut ve geçiş uygunsa 200 OK\ntitle/description/status yenilenir; id korunur.',
    explanation: 'Düzenleme formu title, description ve status alanlarını PUT ile gönderir. title/status zorunludur; description gönderilmezse null olur. Olmayan ID’ye bu API yeni kayıt açmaz, 404 döndürür.',
    pitfall: 'PUT ile oluşturma HTTP’de mümkün olsa da bizim sözleşmemiz bunu seçmez. DONE görevini OPEN/IN_PROGRESS yapmaya çalışan PUT 409 döner ve diğer alanlar da değiştirilmez.', source: httpSpec,
  },
  {
    id: 'patch', name: 'PATCH', scope: 'project', icon: 'pi-sliders-h', location: '@PatchMapping',
    summary: 'Kaynağı kısmen günceller; bu API yalnızca durum alanını değiştirir.', safe: 'Hayır', idempotent: 'Genelde garanti değil',
    request: 'PATCH /api/tasks/42 HTTP/1.1\nHost: localhost:8080\nContent-Type: application/json\n\n{"status":"DONE"}',
    code: controller.patch, file: controllerFile,
    result: 'Kayıt mevcutsa 200 OK\nstatus=DONE; title ve description korunur.',
    explanation: 'Detaydaki durum seçimi yalnızca UpdateTaskStatusRequest gönderir. Aynı DONE isteğini tekrar etmek bizim uygulamamızda kabul edilir. Bu özel davranış bütün PATCH tasarımlarına genellenmez.',
    pitfall: 'Bu body projeye özel JSON’dur; JSON Patch değildir. status zorunludur. DONE → OPEN geçişi 409 TASK_STATE_CONFLICT üretir.',
    source: 'https://www.rfc-editor.org/rfc/rfc5789.html',
  },
  {
    id: 'delete', name: 'DELETE', scope: 'project', icon: 'pi-trash', location: '@DeleteMapping',
    summary: 'Hedef kaynakla ilişkiyi kaldırır; burada mevcut görevi siler.', safe: 'Hayır', idempotent: 'Evet',
    request: 'DELETE /api/tasks/42 HTTP/1.1\nHost: localhost:8080',
    code: controller.delete, file: controllerFile,
    result: 'İlk başarılı silme → 204 No Content, body yok\nAynı ID’ye tekrar DELETE → 404 TASK_NOT_FOUND',
    explanation: 'Görev detayındaki onaylanan silme işlemi bu metodu kullanır. Service önce kaydın varlığını kontrol eder. Bu uygulamada silme için JSON body gönderilmez.',
    pitfall: 'Idempotent demek yanıtların aynı olması değildir; hedeflenen etki aynıdır: görev artık yoktur. 204 yanıtında JSON/null/{} body’si bekleme.', source: httpSpec,
  },
  {
    id: 'head', name: 'HEAD', scope: 'framework', icon: 'pi-info-circle', location: 'GET eşlemesinden destek',
    summary: 'GET benzeri yanıt bilgisini gövdeyi almadan incelemek içindir.', safe: 'Evet', idempotent: 'Evet',
    request: 'HEAD /api/tasks/42 HTTP/1.1\nHost: localhost:8080\nAccept: application/json',
    code: '// Spring MVC, @GetMapping için HEAD desteğini sağlar.\n// TaskController içinde ayrı bir HEAD metodu yoktur.\n' + controller.get,
    result: 'GET’in koşullarına göre status ve yanıt header’ları\nYanıt body’si gönderilmez.',
    explanation: 'Bu, Spring MVC’nin sağladığı davranışın anlatımıdır; canlı HEAD provası değildir. Controller/Service sorgusu yine çalışabilir, bu yüzden body olmaması veritabanına gidilmediği anlamına gelmez.',
    pitfall: 'HEAD her zaman 200 vermez; kaynak bulunamaması veya sunucu hatası status’u da gelebilir. Örnekte 42’nin mevcut olduğu varsayılır.',
    source: `${mvc}/ann-requestmapping.html`,
  },
  {
    id: 'options', name: 'OPTIONS', scope: 'framework', icon: 'pi-list', location: 'MVC’nin otomatik yanıtı',
    summary: 'Hedef için iletişim seçenekleri ve desteklenen metotlar hakkında bilgi verir.', safe: 'Evet', idempotent: 'Evet',
    request: 'OPTIONS /api/tasks/42 HTTP/1.1\nHost: localhost:8080',
    code: '// Spring MVC, aynı yola ait eşlemelerden Allow üretir.\n// /api/tasks/{id}: GET, PUT, PATCH, DELETE\n// HEAD / OPTIONS desteği de framework tarafından sağlanır.\n// TaskController’da ayrı bir OPTIONS metodu yoktur.',
    result: 'Allow header’ında o yolun desteklediği metotlar\nBu istek görev oluşturmaz veya güncellemez.',
    explanation: 'Koleksiyon /api/tasks ile detay /api/tasks/{id} farklı metot kümelerine sahiptir. OPTIONS, CORS preflight için de kullanılabilir; bunun için Origin ve Access-Control-Request-Method gibi ek header’lar bulunur.',
    pitfall: 'Allow, CORS izni anlamına gelmez. Bu örnek normal OPTIONS isteğidir; CORS yapılandırması veya canlı preflight doğrulaması eklenmedi.',
    source: `${mvc}/ann-requestmapping.html`,
  },
];

export const bindingPage = {
  kind: 'binding', title: 'Spring MVC Parametre Bağlama Anotasyonları', shortTitle: 'Parametre bağlama', icon: 'pi-code',
  intro: 'URL, query, header ve body içindeki veri controller metodunun Java argümanlarına nasıl ulaşır? Kartı aç, HTTP isteği ile kodu yan yana incele.',
  items: bindingAnnotations,
};

export const methodsPage = {
  kind: 'methods', title: 'HTTP Metotları', shortTitle: 'HTTP metotları', icon: 'pi-send',
  intro: 'Görev oluşturmak, okumak, değiştirmek ve silmek HTTP’de nasıl ifade edilir? Metotları görev API’mizdeki karşılıklarıyla incele.',
  items: httpMethods,
};
