import { makeTaskListScenario, taskListRequest } from './taskRequestExample';
import { applicationCode } from './journeyApplicationCode';
import { explanatoryExamples } from './journeyExamples';

const springMvc = 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/sequence.html';
const beans = 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/special-bean-types.html';
const requestBody = 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html';
const errors = 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-ann-rest-exceptions.html';
const transactions = 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-decl-explained.html';

export const phases = [
  { id: 'client', label: 'Frontend · tek adım', icon: 'pi-desktop' },
  { id: 'mvc', label: 'Servlet ve Spring MVC', icon: 'pi-sitemap' },
  { id: 'business', label: 'İşlem ve veritabanı', icon: 'pi-database' },
  { id: 'return', label: 'HTTP yanıtı ve dönüş', icon: 'pi-replay' },
];

const briefDescriptions = {
  browser: 'Frontend, HTTP isteğini backend’e gönderir.',
  tomcat: 'HTTP, Servlet nesnelerine alınır.',
  filters: 'İstek filtre zincirinden geçer.',
  dispatcher: 'Spring MVC akışını koordine eder.',
  mapping: 'Uygun controller metodu seçilir.',
  adapter: 'Controller çağrısı hazırlanır.',
  binding: 'Path, query ve JSON Java’ya bağlanır.',
  validation: 'Girdi kısıtları kontrol edilir.',
  controller: 'HTTP girdisi Service’e aktarılır.',
  transaction: 'Transaction sınırı açılır.',
  service: 'İşlem ve veri erişimi koordine edilir.',
  rules: 'Model ve iş kuralları uygulanır.',
  repository: 'JPA ile PostgreSQL’e erişilir.',
  mapper: 'Model, yanıt DTO’suna çevrilir.',
  commit: 'Commit veya rollback tamamlanır.',
  exception: 'Hata, ProblemDetail’e çevrilir.',
  response: 'Status, header ve body seçilir.',
  serialization: 'Yanıt DTO’su JSON’a yazılır.',
  unwind: 'Backend HTTP yanıtını istemciye gönderir.',
};

// All scenarios use the existing task API; application snippets come from this project.
export const steps = [
  {
    id: 'browser', phase: 'client', title: 'Frontend → HTTP isteği', subtitle: 'Method · URL · headers · body', icon: 'pi-send',
    summary: 'Frontend, kullanıcının işlemini HTTP isteği olarak backend’e gönderir; istemci tarafı burada tek adımda gösterilir.',
    paragraphs: ['Tarayıcı, mobil uygulama veya Postman aynı HTTP sözleşmesiyle backend’e ulaşabilir. İstemci bir Java controller metodunu doğrudan çağırmaz; method, hedef yol, header ve gerekiyorsa body içeren bir HTTP mesajı gönderir.', 'Aşağıdaki HTTP/1.1 metin gösterimi isteğin parçalarını görünür kılar. Backend bu mesajı Servlet nesneleri üzerinden işler. Devam eden duraklar sunucunun bu isteği nasıl karşıladığını anlatır.'],
    input: 'Kullanıcının okuma veya yazma işlemi.', output: 'Backend’e gönderilen HTTP isteği.',
    code: taskListRequest, language: 'HTTP/1.1 · örnek istek',
    file: 'HTTP istemcisi · tarayıcı Network / Postman', breakpoint: 'Request URL, method, request headers ve varsa payload.',
    pitfall: 'Mevcut görev API’si Authorization header’ı istemez. Body olmayan GET isteğine Content-Type eklemek gerekmez.',
  },
  {
    id: 'tomcat', phase: 'mvc', title: 'Tomcat ve Servlet nesneleri', subtitle: 'HttpServletRequest / Response', icon: 'pi-server',
    summary: 'Servlet container, HTTP isteğini Java web altyapısının işleyebileceği nesnelere taşır.',
    paragraphs: ['Yerel çalıştırmada WAR içindeki gömülü Tomcat 8080 portunu dinler. Yol, method, header ve body HttpServletRequest üzerinden erişilebilir; yanıt HttpServletResponse üzerinden yazılır.', 'Container, ilgili servlet ve filtre eşlemelerine göre zinciri çalıştırır. TaskController bir servlet değildir; Spring MVC’nin yönettiği bir handler’dır.'],
    input: 'HTTP isteğinin method, yol, header ve body bilgileri.', output: 'Servlet request/response ve filtre zinciri.',
    code: '// Servlet container’ın sağladığı nesne üzerinden inceleme\nrequest.getMethod();       // GET, POST, PATCH...\nrequest.getRequestURI();   // /api/tasks veya /api/tasks/42\nrequest.getQueryString();  // page=0&size=5&status=OPEN\nrequest.getHeader("Accept");', language: 'Java · Servlet API incelemesi',
    file: 'Gömülü Tomcat / Servlet altyapısı', breakpoint: 'Debugger’da HttpServletRequest.getMethod() ve getRequestURI().',
    pitfall: 'Spring Boot uygulamayı başlatır; HTTP’yi kabul eden servlet container’dır.',
    source: { label: 'Servlet request API', url: 'https://jakarta.ee/specifications/servlet/6.1/apidocs/jakarta.servlet/jakarta/servlet/http/HttpServletRequest.html' },
  },
  {
    id: 'filters', phase: 'mvc', title: 'Servlet FilterChain', subtitle: 'Servlet’ten önce ve sonra', icon: 'pi-filter',
    summary: 'Filtreler isteği sarabilir, reddedebilir veya chain.doFilter ile sonraki adıma geçirebilir.',
    paragraphs: ['Filtre, DispatcherServlet’in dışındadır. Zincire devam edilmezse MVC’ye ulaşılmaz. chain.doFilter öncesindeki kod gidişte, sonrasındaki kod ise kontrol geri döndüğünde çalışır.', 'Bu projede özel JWT ve request logging filtresi henüz yoktur. P5’te Spring Security, Authorization header’ındaki Bearer token’ı bu sınırda doğrulayacak. P6’da log korelasyonu eklenecek.'],
    input: 'Servlet request/response.', output: 'DispatcherServlet’e geçiş veya filtrede sonlandırılan yanıt.',
    code: '// Kavramsal örnek; projede kayıtlı özel filtre değildir.\ntry {\n    chain.doFilter(request, response);\n} finally {\n    // Yanıt status’unu oku, kaynakları/MDC’yi temizle.\n}', language: 'Java · kavramsal',
    file: 'Servlet altyapısı; özel Security/logging filtresi P5/P6', breakpoint: 'İleri inceleme: container filter zinciri; P5 sonrası FilterChainProxy.',
    pitfall: 'MVC advice, filtrede oluşan bütün hataları otomatik yakalamaz.',
  },
  {
    id: 'dispatcher', phase: 'mvc', title: 'DispatcherServlet', subtitle: 'Spring MVC’nin merkezî yönlendiricisi', icon: 'pi-directions',
    summary: 'DispatcherServlet, isteği uygun MVC bileşenlerine devreden front controller’dır.',
    paragraphs: ['Önce uygun handler’ın bulunmasını, sonra bu handler’ın çağrılmasını koordine eder. İş kuralını kendisi yürütmez; Controller ve Service’in yerini almaz.', 'HandlerMapping, HandlerAdapter, bağlama, validation ve dönüş değeri işleme iç içe yürür. Timeline bunları öğrenmek için ayırır. REST body’si adapter içinde yazılabilir; JSON API’miz HTML şablonu çözmez.'],
    input: 'Filtreleri geçen servlet isteği.', output: 'Handler seçimi ve çağrı sürecinin koordinasyonu.',
    code: '// Kavramsal, sadeleştirilmiş sıra\nDispatcherServlet.doDispatch(...)\n  → getHandler(request)\n  → getHandlerAdapter(handler)\n  → adapter.handle(request, response, handler)', language: 'Akış · framework',
    file: 'Spring Framework · DispatcherServlet', breakpoint: 'İleri debugger: DispatcherServlet#doDispatch.',
    pitfall: 'Adı DispatcherServlet’tir. Her görev için ayrı bir servlet yazmıyoruz.',
    source: { label: 'DispatcherServlet işleme akışı', url: springMvc },
  },
  {
    id: 'mapping', phase: 'mvc', title: 'HandlerMapping', subtitle: 'Hangi controller metodu?', icon: 'pi-map',
    summary: 'Yol ve HTTP metodu gibi koşullar, uygun handler metoduyla eşleştirilir.',
    paragraphs: ['RequestMappingHandlerMapping, @RequestMapping ve @GetMapping gibi eşlemeleri kullanır. Örneğin GET /api/tasks liste metoduna, POST /api/tasks create metoduna gider. Query değerleri bu projede farklı bir controller seçmez; parametre olarak bağlanır.', 'Eşleşmede HandlerExecutionChain, handler ile varsa interceptor’ları taşır. preHandle false dönerse handler çağrılmaz. Projede özel HandlerInterceptor yoktur. İstek yolunun var olup HTTP metodunun uymaması 405 üretebilir.'],
    input: 'İstek yolu, method ve mapping koşulları.', output: 'Seçilen HandlerMethod ve varsa MVC interceptor zinciri.',
    code: '@RestController\n@RequestMapping("/api/tasks")\npublic class TaskController {\n    @GetMapping\n    public TaskPageResponse findAll(...) { ... }\n}', language: 'Java · kısaltılmış',
    file: 'backend/.../controllers/TaskController.java', breakpoint: 'RequestMappingHandlerMapping; logda “Mapped to ...” satırı.',
    pitfall: 'Filtre container seviyesindedir; HandlerInterceptor MVC’nin seçtiği handler çevresindedir.',
    source: { label: 'HandlerMapping ve özel MVC bileşenleri', url: beans },
  },
  {
    id: 'adapter', phase: 'mvc', title: 'HandlerAdapter', subtitle: 'Metot nasıl çağrılacak?', icon: 'pi-cog',
    summary: 'RequestMappingHandlerAdapter, annotation’lı controller metodunu çalıştırmaya hazırlar.',
    paragraphs: ['Adapter, argüman çözümleyicilerini ve dönüş değeri işleyicilerini kullanır. Böylece DispatcherServlet her parametre annotation’ının ayrıntısını bilmek zorunda kalmaz.', 'Bağlama ve validation, controller çağrısına hazırlıktır. Controller’dan dönünce aynı adapter’ın dönüş işleyicileri ResponseEntity veya DTO’yu işler; mesaj dönüştürücü JSON’u yazar. Bunlar ayrı HTTP istekleri değildir.'],
    input: 'Seçilen controller HandlerMethod.', output: 'Çözümlenmiş argümanlarla çağrı; ardından dönüş değerinin işlenmesi.',
    code: '// Kavramsal alt akış\nRequestMappingHandlerAdapter\n  → argümanları çözümle\n  → doğrula\n  → controller metodunu çağır\n  → dönüş değerini işle', language: 'Akış · framework',
    file: 'Spring Framework · RequestMappingHandlerAdapter', breakpoint: 'İleri debugger: invokeHandlerMethod.',
    pitfall: 'Mapping “hangi metot?”, adapter “bu metodu nasıl çalıştırırım?” sorusunu çözer.',
    source: { label: 'HandlerAdapter', url: beans },
  },
  {
    id: 'binding', phase: 'mvc', title: 'Parametre ve JSON bağlama', subtitle: 'ArgumentResolver · Jackson', icon: 'pi-code',
    summary: 'URL ve HTTP body, controller parametrelerinin Java tiplerine dönüştürülür.',
    paragraphs: ['@RequestParam query değerini, @PathVariable yol değişkenini çözümler. @RequestBody için HttpMessageConverter, Jackson üzerinden JSON’u istek DTO’suna okur.', '@RequestHeader header okuyabilir; mevcut TaskController özel header parametresi almaz. Geçersiz enum, sayı veya bozuk JSON, controller metodunun gövdesine girmeden 400 oluşturabilir.'],
    input: 'Query/path metinleri ve varsa JSON body.', output: 'int/Long/TaskStatus veya CreateTaskRequest gibi Java değerleri.',
    code: '@RequestParam(defaultValue = "0") @Min(0) int page\n@PathVariable @Positive Long id\n@Valid @RequestBody CreateTaskRequest request', language: 'Java · parametre örnekleri',
    file: 'backend/.../controllers/TaskController.java · dto/', breakpoint: 'Controller girişinde parametreler; bozuk JSON’da advice.',
    pitfall: 'JSON → DTO dönüşümünü Jackson yapar; MapStruct bu adımda kullanılmaz.',
    source: { label: 'Controller argümanları', url: 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html' },
  },
  {
    id: 'validation', phase: 'mvc', title: 'Bean Validation', subtitle: '@Valid · @NotBlank · @Min', icon: 'pi-check-circle',
    summary: 'Java’ya dönüşebilen girdinin, tanımlanan alan ve metot kısıtlarına uyup uymadığı kontrol edilir.',
    paragraphs: ['Başlık boş olamaz; en çok 100 karakterdir. Açıklama en çok 500 karakter; PUT/PATCH status değeri zorunludur. page ve size için de sınırlar vardır.', 'Hata, MethodArgumentNotValidException veya metot kısıtlarına bağlı olarak HandlerMethodValidationException ile gelebilir. GlobalExceptionHandler ikisini de karşılar. Boş title POST, Service’e ulaşmaz.'],
    input: 'Bağlanmış Java argümanları ve DTO.', output: 'Geçerli argümanlar veya 400’e çevrilecek validation exception’ı.',
    code: '@NotBlank(message = "Başlık boş olamaz.")\n@Size(max = 100)\nprivate String title;', language: 'Java · kısaltılmış DTO',
    file: 'backend/.../dto/CreateTaskRequest.java', breakpoint: 'GlobalExceptionHandler#handleMethodArgumentNotValid.',
    pitfall: 'Boş başlık validation’dır. DONE görevi yeniden açmak, mevcut veri gerektiren iş kuralıdır.',
    source: { label: '@RequestBody ve validation', url: requestBody },
  },
  {
    id: 'controller', phase: 'mvc', title: 'TaskController', subtitle: 'HTTP sınırı → Service', icon: 'pi-sliders-h',
    summary: 'Controller HTTP girdisini alır, Service’i çağırır ve yanıt sözleşmesini belirler.',
    paragraphs: ['Bu noktada parametreler hazırlanmıştır. Controller repository’ye doğrudan gitmez; TaskService’e işi devreder.', 'POST dönüşünde ResponseEntity.created ile Location/201; DELETE dönüşünde noContent ile 204 seçilir. Controller’ın çağrılması, veritabanı işleminin başarılı olduğu anlamına gelmez.'],
    input: 'Doğrulanmış controller argümanları.', output: 'Service çağrısı; başarıda DTO veya ResponseEntity.',
    code: '@PostMapping\npublic ResponseEntity<TaskResponse> create(\n        @Valid @RequestBody CreateTaskRequest request) {\n    TaskResponse task = taskService.create(request);\n    return ResponseEntity.created(\n        URI.create("/api/tasks/" + task.getId())\n    ).body(task);\n}', language: 'Java',
    file: 'backend/.../controllers/TaskController.java', breakpoint: 'findAll, create, updateStatus veya delete giriş satırı.',
    pitfall: 'Spring MVC controller’ı bulur; iş kuralı Service’te kalır.',
  },
  {
    id: 'transaction', phase: 'business', title: 'Transaction proxy’si', subtitle: 'AOP · @Transactional', icon: 'pi-lock',
    summary: 'Service çağrısı, Spring’in transaction sınırından geçer.',
    paragraphs: ['Controller’ın Spring bean’i üzerinden yaptığı çağrıda transaction interceptor, @Transactional ayarını uygular. Sınıftaki readOnly=true okuma ayarıdır; yazma metotları kendi @Transactional ayarıyla çalışır.', 'Transaction Service metodunu sarar. DTO içeride hazırlanır; proxy normal dönerken transaction tamamlanır. readOnly bir optimizasyon ipucudur, kullanıcı yetkisi veya bütün ortamlarda yazmayı yasaklayan bir güvenlik kuralı değildir.'],
    input: 'Controller’dan gelen Service çağrısı.', output: 'Transaction bağlamında çalışan Service metodu.',
    code: '@Service\n@Transactional(readOnly = true)\npublic class TaskService {\n    @Transactional\n    public TaskResponse updateStatus(...) { ... }\n}', language: 'Java · kısaltılmış',
    file: 'backend/.../services/TaskService.java', breakpoint: 'İleri debugger: TransactionInterceptor; Service giriş/çıkışı.',
    pitfall: 'Spring AOP transaction proxy’si ile MVC interceptor’ı farklıdır. Varsayılan proxy yaklaşımında aynı sınıf içindeki this.metot() çağrısı yeni bir proxy geçişi oluşturmaz.',
    source: { label: 'Spring transaction altyapısı', url: transactions },
  },
  {
    id: 'service', phase: 'business', title: 'TaskService', subtitle: 'İşlemi koordine et', icon: 'pi-briefcase',
    summary: 'Service veri erişimini, iş kurallarını ve yanıt eşlemesini bir araya getirir.',
    paragraphs: ['Repository ve mapper constructor ile alınır. Listelemede sıralama/sayfalama; oluşturmada OPEN başlangıcı; güncellemede mevcut görev ve durum kuralı burada yönetilir.', 'Katmanlar çizelgede giriş sırasıyla gösterilir. Güncellemede Service önce Repository’den mevcut kaydı alır; kontrol Service’e döndüğünde DONE kuralını uygular. Mapper da Service’in içinde çağrılır.'],
    input: 'İstek DTO’su veya filtre/ID değerleri.', output: 'Repository/iş kuralı/mapper çağrıları veya domain exception.',
    code: 'public TaskService(TaskRepository taskRepository,\n                   TaskMapper taskMapper) {\n    this.taskRepository = taskRepository;\n    this.taskMapper = taskMapper;\n}', language: 'Java',
    file: 'backend/.../services/TaskService.java', breakpoint: 'findAll, create veya updateStatus.',
    pitfall: 'Service, HTTP header okumak veya React state’i yönetmek için değildir.',
  },
  {
    id: 'rules', phase: 'business', title: 'İş kuralı ve model değişikliği', subtitle: 'OPEN başlangıcı · DONE kısıtı', icon: 'pi-shield',
    summary: 'Girdi geçerli olsa bile mevcut durumla çelişen bir işlem reddedilebilir.',
    paragraphs: ['POST’ta yeni Task OPEN durumunda oluşturulur. PUT/PATCH’te önce mevcut görev yüklenir, sonra DONE’dan çıkış kuralı denetlenir. Yasak geçişte alanlar değiştirilmeden exception atılır.', 'Bu eğitimde TaskStateConflictException, 409’a çevrilir. Başlık boşluğu kontrolünden farkı, karar için mevcut görev durumunun gerekmesidir.'],
    input: 'Yeni görev verisi veya mevcut Task ve istenen durum.', output: 'Geçerli model / değişiklik ya da TaskStateConflictException.',
    code: 'if (task.getStatus() == TaskStatus.DONE\n        && newStatus != TaskStatus.DONE) {\n    throw new TaskStateConflictException();\n}', language: 'Java',
    file: 'backend/.../services/TaskService.java · models/Task.java', breakpoint: 'validateStatusTransition; kontrolün update’ten önce olduğunu göster.',
    pitfall: '409, JSON’un bozuk olduğu anlamına gelmez. İstek mevcut kaynak durumuyla çelişir.',
  },
  {
    id: 'repository', phase: 'business', title: 'Repository → JPA → PostgreSQL', subtitle: 'Sorgu ve kalıcılık bağlamı', icon: 'pi-database',
    summary: 'Spring Data repository’si JPA üzerinden tasks tablosuna erişir.',
    paragraphs: ['Listelemede findAll/findByStatus; detay ve güncellemede findById kullanılır. Spring Data repository uygulamasını üretir; Hibernate SQL ve entity eşlemesini yürütür.', 'POST save çağırır. PUT/PATCH yönetilen entity’yi değiştirir; dirty checking yazmayı flush/commit’e taşıyabilir. DELETE önce kaydı bulur, sonra siler. SQL’in tam zamanını logdan gözlemle.'],
    input: 'Sayfalama/filtre, ID veya entity.', output: 'Page<Task>, Task ya da planlanan/kaydedilen veri değişikliği.',
    code: 'public interface TaskRepository\n        extends JpaRepository<Task, Long> {\n    Page<Task> findByStatus(\n        TaskStatus status, Pageable pageable);\n}', language: 'Java',
    file: 'backend/.../repositories/TaskRepository.java', breakpoint: 'Service’te repository çağrısı ve org.hibernate.SQL logu.',
    pitfall: 'Repository iş kuralını veya HTTP status’unu seçmez. findById, bulunamama sonucunu Service’e verir.',
  },
  {
    id: 'mapper', phase: 'business', title: 'MapStruct → yanıt DTO’su', subtitle: 'Java model → Java DTO', icon: 'pi-clone',
    summary: 'Model, API’nin dışarı sunduğu yanıt nesnesine çevrilir.',
    paragraphs: ['TaskMapper bir arayüzdür. Annotation processor, getter/setter kullanan TaskMapperImpl sınıfını derleme sırasında üretir ve Spring bean olarak Service’e verir.', 'Liste için TaskResponse listesi, tek kaynak için TaskResponse oluşturulur. Mapper SQL çalıştırmaz ve JSON yazmaz. DELETE gövdesi olmadığı için mapper kullanılmaz.'],
    input: 'Task veya Task listesi.', output: 'TaskResponse veya TaskResponse listesi.',
    code: '@Mapper(componentModel = "spring",\n        unmappedTargetPolicy = ReportingPolicy.ERROR)\npublic interface TaskMapper {\n    TaskResponse toDto(Task task);\n    List<TaskResponse> toDto(List<Task> tasks);\n}', language: 'Java',
    file: 'backend/.../dto/mapper/TaskMapper.java', breakpoint: 'target/generated-sources/annotations/.../TaskMapperImpl.java.',
    pitfall: 'İstek JSON’unu okuyan Jackson; yanıt modelini DTO’ya eşleyen MapStruct’tur.',
    source: { label: 'MapStruct referansı', url: 'https://mapstruct.org/documentation/stable/reference/html/' },
  },
  {
    id: 'commit', phase: 'business', title: 'Transaction’dan çıkış', subtitle: 'Commit / rollback', icon: 'pi-check-square',
    summary: 'Service dönüşünde transaction sınırı tamamlanır; hata varsa uygun rollback uygulanır.',
    paragraphs: ['Flush, bekleyen değişiklikleri SQL’e taşıyabilir; commit transaction’ı tamamlar. POST’ta IDENTITY için INSERT daha önce çalışabilir. Mapper’ın DTO üretmesi commit’in başarılı olduğunu garanti etmez.', 'Varsayılan rollback kuralı RuntimeException ve Error içindir; checked exception için ek kural gerekebilir. TaskStateConflictException RuntimeException olduğundan rollback olur. MVC validation hatasında Service çağrılmadığı için bu transaction hiç açılmaz.'],
    input: 'Service sonucu veya dışarı taşan exception.', output: 'Tamamlanmış transaction ya da rollback sonrası hata.',
    code: '// Kavramsal proxy davranışı\ntransaction başlat\ntry: service metodunu çalıştır → commit\ncatch rollback gerektiren hata: rollback → hatayı ilet', language: 'Kavramsal akış',
    file: 'Spring transaction proxy’si · TaskService @Transactional', breakpoint: 'Transaction tamamlanması; SQL flush/commit logları.',
    pitfall: 'JSON serileştirmesi bu Service transaction’ından sonra olur. Sonradan oluşan her hata DB işlemini geri almaz.',
    source: { label: 'Transaction proxy’si', url: transactions },
  },
  {
    id: 'exception', phase: 'return', title: 'Exception çözümleme ve Advice', subtitle: 'HandlerExceptionResolver', icon: 'pi-exclamation-triangle',
    summary: 'MVC içinde oluşan hata, uygun resolver ve exception handler yoluyla HTTP yanıtına çevrilir.',
    paragraphs: ['GlobalExceptionHandler, @RestControllerAdvice ve ResponseEntityExceptionHandler kullanır. Validation 400, bulunamayan görev 404, durum çatışması 409 üretir.', 'Başarılı akışta exception handler çalışmaz. Güvenlik filtresinin hatalarını ise P5’te Security handler’ları yönetecek; advice bütün katmanlar için genel bir try/catch değildir.'],
    input: 'MVC hazırlığı veya controller/Service çağrısından taşan exception.', output: 'Status, header ve ProblemDetail hata nesnesi.',
    code: '@ExceptionHandler(TaskStateConflictException.class)\npublic ResponseEntity<Object> handleTaskStateConflict(\n        TaskStateConflictException exception, WebRequest request) {\n    return domainProblem(exception, HttpStatus.CONFLICT,\n                         "TASK_STATE_CONFLICT", request);\n}', language: 'Java',
    file: 'backend/.../controllers/advice/GlobalExceptionHandler.java', breakpoint: 'Validation handler veya handleTaskStateConflict.',
    pitfall: 'Bütün hataları 200/500’e çevirmiyoruz; 405/415 gibi framework status ve header’ları korunur.',
    source: { label: 'MVC hata yanıtları', url: errors },
  },
  {
    id: 'response', phase: 'return', title: 'Dönüş değeri ve ResponseEntity', subtitle: 'Status · headers · body', icon: 'pi-envelope',
    summary: 'Java dönüş değeri HTTP yanıtının status, header ve body parçalarına dönüştürülür.',
    paragraphs: ['HandlerAdapter’ın dönüş işleyicileri @ResponseBody/ResponseEntity sonucunu ele alır. Normal liste yanıtı 200; create 201 ve Location; delete 204 ve boş body üretir.', 'Hata rotasında başarılı controller dönüşü yerine advice’ın ResponseEntity/ProblemDetail sonucu işlenir. REST için HTML görünümü çözmeye gerek yoktur.'],
    input: 'Controller’ın veya exception handler’ın dönüş değeri.', output: 'HTTP status/header ayarı ve varsa yazılacak body nesnesi.',
    code: 'return ResponseEntity.created(\n    URI.create("/api/tasks/" + task.getId())\n).body(task);\n\n// DELETE\nreturn ResponseEntity.noContent().build();', language: 'Java',
    file: 'backend/.../controllers/TaskController.java · controllers/advice/', breakpoint: 'Controller dönüşü; ileri inceleme: HttpEntityMethodProcessor.',
    pitfall: 'ResponseEntity kendi başına JSON metni değildir; body nesnesini converter yazar.',
  },
  {
    id: 'serialization', phase: 'return', title: 'HttpMessageConverter ve Jackson', subtitle: 'Yanıt DTO’su → JSON', icon: 'pi-file',
    summary: 'Dönüş nesnesi, içerik türüne uygun converter ile HTTP body’ye yazılır.',
    paragraphs: ['Bu REST API’de Jackson Java DTO’sunu JSON’a serileştirir. Accept ve üretilebilen medya türleri yanıt formatının seçiminde rol oynar. ProblemDetail için application/problem+json kullanılır.', 'DELETE 204’te body nesnesi yoktur; JSON/null yazılmaz. Bu örnekte dönüşüm durağı atlanır. MapStruct çıktısı JSON’a burada dönüşür.'],
    input: 'TaskResponse/TaskPageResponse veya ProblemDetail.', output: 'JSON yanıt baytları ve Content-Type; 204’te body yok.',
    code: '// Model → MapStruct → TaskResponse → Jackson → HTTP body\n{\n  "id": 42,\n  "title": "REST sunumunu hazırla",\n  "description": null,\n  "status": "OPEN"\n}', language: 'JSON · temsili yanıt',
    file: 'Spring MVC HttpMessageConverter / Jackson altyapısı', breakpoint: 'İleri inceleme: AbstractMessageConverterMethodProcessor.',
    pitfall: '204 yanıtını istemcide JSON parse etmeye çalışma.',
    source: { label: 'HTTP mesaj dönüştürme', url: 'https://docs.spring.io/spring-framework/reference/web/webmvc/message-converters.html' },
  },
  {
    id: 'unwind', phase: 'return', title: 'HTTP yanıtının gönderilmesi', subtitle: 'MVC → FilterChain → Tomcat → istemci', icon: 'pi-replay',
    summary: 'Backend işleme zincirinden geri döner ve HTTP yanıtını istemciye gönderir.',
    paragraphs: ['Varsa MVC tamamlanma kancaları ve filtrelerin chain.doFilter sonrasındaki kodları çalışır. Bu projede özel MVC interceptor’ı veya ölçüm filtresi eklenmedi.', 'REST yanıtı adapter içinde yazılmış, hatta commit edilmiş olabilir. Bu dönüş durağı, bütün ağ baytlarının mutlaka en son anda gönderildiği anlamına gelmez. REST postHandle içinde header eklemek geç kalabilir; bu çizelge kontrol akışını öğretir.'],
    input: 'Hazırlanmış/yazılmış response.', output: 'İstemciye iletilen HTTP status, headers ve varsa body.',
    code: '// Backend dönüşünün sadeleştirilmiş görünümü\nMVC → FilterChain’e dönüş → Tomcat → HTTP yanıtı → istemci', language: 'Akış',
    file: 'Spring MVC / Servlet altyapısı', breakpoint: 'Servlet response.getStatus() ve istemcide response headers/body.',
    pitfall: 'Burada gösterilen sıra eğitim modelidir; katman bazlı canlı tracing veya süre ölçümü değildir.',
    source: { label: 'MVC interceptor kancaları', url: 'https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet/handlermapping-interceptor.html' },
  },
];

const normalOrder = steps.map(step => step.id);
const skip = (reason) => ({ state: 'skipped', reason });

export const scenarios = [
  makeTaskListScenario(normalOrder),
  {
    id: 'create', label: 'POST · Oluştur', method: 'POST', status: 201, outcome: 'Yeni kaynak ve Location',
    description: 'Geçerli DTO ile OPEN görev oluşturulur; yanıt 201 ve yeni kaynağın Location header’ını taşır.',
    request: 'POST /api/tasks\nContent-Type: application/json\nAccept: application/json, application/problem+json\n\n{"title":"REST sunumunu hazırla","description":null}',
    response: 'HTTP 201 Created\nLocation: /api/tasks/42\nContent-Type: application/json\n\n{"id":42,"title":"REST sunumunu hazırla","description":null,"status":"OPEN"}',
    order: normalOrder,
    stages: {
      binding: { note: 'Jackson JSON’u CreateTaskRequest bean’ine okur. id veya status gönderilmez.', code: applicationCode.controllerCreate, language: 'Java · TaskController.create argümanı' },
      controller: { code: applicationCode.controllerCreate, language: 'Java · TaskController.create metodu' },
      service: { code: applicationCode.serviceCreate, language: 'Java · TaskService.create metodu' },
      validation: { note: 'Başlık boş değil; uzunluklar DTO kısıtlarına uyuyor.', code: '@NotBlank(message = "Başlık boş olamaz.")\n@Size(max = 100, message = "Başlık en fazla 100 karakter olabilir.")\nprivate String title;\n\n@Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir.")\nprivate String description;', file: 'backend/src/main/java/com/example/restworkshop/dto/CreateTaskRequest.java', language: 'Java · CreateTaskRequest alan kısıtları' },
      transaction: { note: 'create metodunun @Transactional ayarı yazma transaction’ı açar.' },
      rules: { code: 'Task task = new Task(request.getTitle(),\n    request.getDescription(), TaskStatus.OPEN);', note: 'Başlangıç durumunu istemci değil, Service OPEN olarak belirler.' },
      repository: { code: 'taskRepository.save(task);', note: 'Yeni görev kaydedilir. IDENTITY ile üretilen ID yanıt için kullanılır; 42 yalnızca örnektir.' },
      exception: skip('Geçerli oluşturma akışında exception handler çalışmaz.'),
      commit: { note: 'Başarılı transaction tamamlandıktan sonra controller 201 yanıtını kurmaya devam eder.' },
      response: { code: applicationCode.controllerCreate, note: 'Controller 201 ve oluşturulan kaynağın Location yolunu döndürür.', language: 'Java · TaskController.create dönüşü' },
    },
  },
  {
    id: 'invalid', label: 'POST · 400', method: 'POST', status: 400, outcome: 'Validation’da durur', stop: 'validation',
    description: 'JSON geçerlidir fakat başlık boştur. Controller gövdesi ve Service çağrılmaz; Advice alan hatasını döndürür.',
    request: 'POST /api/tasks\nContent-Type: application/json\n\n{"title":"","description":"Taslak korunur"}',
    response: 'HTTP 400 Bad Request\nContent-Type: application/problem+json\n\n{"type":"about:blank","title":"Bad Request","status":400,"detail":"İstek alanlarını kontrol edin.","instance":"/api/tasks","code":"VALIDATION_ERROR","fieldErrors":[{"field":"title","message":"Başlık boş olamaz."}]}',
    order: normalOrder,
    stages: {
      binding: { note: 'JSON okunabilir; title boş metin olarak DTO’ya bağlanır. Hata JSON sözdiziminde değildir.', code: applicationCode.controllerCreate, language: 'Java · TaskController.create argümanı' },
      validation: { state: 'stop', note: '@NotBlank başarısız olur. MethodArgumentNotValidException oluşur; controller metodunun gövdesine girilmez.', code: '@NotBlank(message = "Başlık boş olamaz.")\nprivate String title;\n\n// title = "" → validation hatası' },
      controller: skip('Argüman doğrulaması başarısız olduğu için controller metodunun gövdesi çağrılmaz.'),
      transaction: skip('Service çağrılmadı; TaskService transaction’ı açılmadı.'),
      service: skip('Validation hatası MVC hazırlığında oluştu; Service’e gelinmedi.'),
      rules: skip('Model oluşturma/durum kuralı aşamasına ulaşılmadı.'),
      repository: skip('Service çalışmadığından bu istekte görev sorgusu veya yazması yoktur.'),
      mapper: skip('Başarılı görev DTO’su üretilmez; hata body’si Advice tarafından hazırlanır.'),
      commit: skip('TaskService transaction’ı açılmadığından commit/rollback yapılmaz.'),
      exception: { note: 'handleMethodArgumentNotValid, fieldErrors içeren ProblemDetail oluşturur.', code: applicationCode.validationHandler, language: 'Java · GlobalExceptionHandler' },
      response: { note: 'Dönüş, controller’ın başarı DTO’su değil; advice’ın 400 ProblemDetail yanıtıdır.', code: applicationCode.validationProblem, file: 'backend/src/main/java/com/example/restworkshop/controllers/advice/GlobalExceptionHandler.java', language: 'Java · validationProblem yardımcı metodu' },
      serialization: { note: 'ProblemDetail application/problem+json olarak yazılır; başarılı görev JSON’u yoktur.' },
    },
  },
  {
    id: 'conflict', label: 'PATCH · 409', method: 'PATCH', status: 409, outcome: 'İş kuralında durur', stop: 'rules',
    description: 'Örnekte 42 numaralı görev DONE’dır. OPEN isteği DTO doğrulamasını geçer; mevcut kayıt okunduktan sonra reddedilir.',
    request: 'PATCH /api/tasks/42\nContent-Type: application/json\n\n{"status":"OPEN"}',
    response: 'HTTP 409 Conflict\nContent-Type: application/problem+json\n\n{"type":"about:blank","title":"Conflict","status":409,"detail":"Tamamlanmış görev yeniden açılamaz.","instance":"/api/tasks/42","code":"TASK_STATE_CONFLICT"}',
    order: normalOrder.filter(id => id !== 'rules').flatMap(id => id === 'repository' ? [id, 'rules'] : [id]),
    stages: {
      binding: { note: 'Path id=42 ve body status=OPEN Java’ya bağlanır.', code: applicationCode.controllerPatch, language: 'Java · TaskController.updateStatus argümanları' },
      validation: { note: '42 pozitif ve OPEN geçerli enum değeridir. @Positive path ID’yi, @NotNull body’deki status alanını doğrular. PATCH DTO’sunda title yoktur; validation görevin mevcut durumunu bilmez.', code: '@NotNull(message = "Durum zorunludur.")\nprivate TaskStatus status;', file: 'backend/src/main/java/com/example/restworkshop/dto/UpdateTaskStatusRequest.java', language: 'Java · UpdateTaskStatusRequest kısıtı' },
      controller: { code: applicationCode.controllerPatch, language: 'Java · TaskController.updateStatus' },
      transaction: { note: 'updateStatus yazma transaction’ı açar; ileride iş kuralı hatasıyla rollback olacaktır.' },
      service: { code: applicationCode.servicePatch, note: 'Önce requireTask ile mevcut durum okunmalıdır.', language: 'Java · TaskService.updateStatus' },
      repository: { code: 'taskRepository.findById(42L);', note: 'Örnekte kayıt bulunur ve status DONE’dır. Burada yalnızca okuma yapılır; henüz UPDATE yoktur.' },
      rules: { state: 'stop', note: 'DONE → OPEN yasak. TaskStateConflictException atılır; task.changeStatus satırı çalışmaz.' },
      mapper: skip('Service normal dönmez; başarılı TaskResponse eşlemesine ulaşılmaz.'),
      commit: { note: 'RuntimeException dışarı taşar; transaction rollback olur. Görev durumu ve diğer alanlar korunur.' },
      exception: { note: 'handleTaskStateConflict, 409 ve TASK_STATE_CONFLICT üretir.', code: applicationCode.conflictHandler, language: 'Java · GlobalExceptionHandler' },
      response: { note: 'Controller’ın başarılı dönüşüne ulaşılmaz; Advice’ın 409 yanıtı işlenir.', code: applicationCode.conflictHandler, file: 'backend/src/main/java/com/example/restworkshop/controllers/advice/GlobalExceptionHandler.java', language: 'Java · handleTaskStateConflict' },
      serialization: { note: 'ProblemDetail, application/problem+json biçiminde yazılır.' },
    },
  },
  {
    id: 'delete', label: 'DELETE · 204', method: 'DELETE', status: 204, outcome: 'Body olmadan tamamlanır', focus: 'response',
    description: 'Örnekte var olan görev silinir. Başarı yanıtı yalnızca status/header taşır; JSON body üretilmez.',
    request: 'DELETE /api/tasks/42\nAccept: application/json, application/problem+json',
    response: 'HTTP 204 No Content\n\n[Yanıt gövdesi yok]',
    order: normalOrder,
    stages: {
      binding: { note: 'Yalnızca path ID bağlanır; request body yoktur.', code: applicationCode.controllerDelete, language: 'Java · TaskController.delete argümanı' },
      validation: { note: 'ID’nin pozitif olması doğrulanır; DELETE body DTO’su almaz.', code: applicationCode.controllerDelete, file: 'backend/src/main/java/com/example/restworkshop/controllers/TaskController.java', language: 'Java · delete parametresindeki @Positive' },
      controller: { code: applicationCode.controllerDelete, language: 'Java · TaskController.delete' },
      transaction: { note: 'delete yazma transaction’ı kullanır.' },
      service: { code: applicationCode.serviceDelete, language: 'Java · TaskService.delete' },
      rules: skip('Bu API’de silme için DONE geçiş kontrolü yoktur; kaynak varlığı requireTask ile denetlenir.'),
      repository: { note: 'Önce findById ile varlık denetlenir, ardından delete çağrılır. SQL transaction içinde yürütülür.' },
      mapper: skip('delete void döner; response DTO’su üretmek için mapper çağrılmaz.'),
      commit: { note: 'Silme transaction’ı tamamlanır; sonra controller noContent yanıtını döndürür.' },
      exception: skip('Bu senaryoda kaynak vardır ve silme başarılıdır. Olmayan ID ayrı olarak 404 üretir.'),
      response: { code: applicationCode.controllerDelete, note: 'Status 204. Body null metni veya boş JSON nesnesi olarak yazılmaz; hiç body yoktur.', language: 'Java · TaskController.delete dönüşü' },
      serialization: { ...skip('204 No Content için yazılacak JSON body yoktur; DTO/ProblemDetail serileştirilmez.'), code: 'HTTP/1.1 204 No Content', language: 'HTTP · status satırı; gövde yok' },
    },
  },
];

const detailParents = { transaction: 'service', rules: 'service', commit: 'service', mapper: 'response' };

export function getPipelineStepId(id) { return detailParents[id] || id; }

export function getScenarioSteps(scenario) {
  const body = scenario.status === 204 ? null : JSON.parse(scenario.response.split('\n\n').slice(1).join('\n\n'));
  const requestHead = scenario.request.split('\n\n')[0].split('\n');
  const requestUrl = new URL(requestHead[0].split(' ')[1], 'http://localhost:8080');
  const header = name => requestHead.slice(1).find(line => line.toLowerCase().startsWith(`${name.toLowerCase()}:`))?.split(':').slice(1).join(':').trim() || null;
  const query = requestUrl.search ? requestUrl.search.slice(1) : null;
  const servletCode = [
    `request.getMethod(); // ${JSON.stringify(scenario.method)}`,
    `request.getRequestURI(); // ${JSON.stringify(requestUrl.pathname)}`,
    `request.getQueryString(); // ${JSON.stringify(query)}`,
    `request.getParameter("status"); // ${JSON.stringify(requestUrl.searchParams.get('status'))}`,
    `request.getHeader("Accept"); // ${JSON.stringify(header('Accept'))}`,
    `request.getHeader("Content-Type"); // ${JSON.stringify(header('Content-Type'))}`,
  ].join('\n');
  const detailedSteps = scenario.order.map(id => {
    const step = steps.find(item => item.id === id);
    return {
      ...step, brief: briefDescriptions[id], examples: explanatoryExamples[id], state: 'included', ...scenario.stages[id],
      ...(id === 'browser' && !scenario.stages[id]?.code ? { code: scenario.request, language: 'HTTP · örnek istek' } : {}),
      ...(id === 'tomcat' ? {
        code: servletCode, language: 'Java · seçili örneğin Servlet API karşılığı', input: scenario.request,
        output: `HttpServletRequest: method=${scenario.method}, requestURI=${requestUrl.pathname}, queryString=${query ?? 'null'}. JSON body bu aşamada DTO yapılmaz.`,
      } : {}),
      ...(id === 'serialization' && body ? {
        code: JSON.stringify(body, null, 2), language: 'JSON · seçili senaryonun örnek yanıt gövdesi',
        input: scenario.status >= 400 ? 'Advice tarafından hazırlanan ProblemDetail.' : step.input,
        output: scenario.status >= 400 ? 'application/problem+json ve hata gövdesi.' : step.output,
      } : {}),
    };
  });
  return detailedSteps.filter(step => !detailParents[step.id]).map(step => {
    const details = detailedSteps.filter(detail => detailParents[detail.id] === step.id);
    const failure = details.find(detail => detail.state === 'stop');
    return {
      ...step,
      ...(failure ? { state: 'stop', note: failure.note } : {}),
      details,
      detailsIntro: step.id === 'service'
        ? 'Transaction sınırı ve iş kuralları bu katmanın ayrıntılarıdır. Güncellemede önce Repository’den kayıt okunur, sonra Service durum geçişini denetler.'
        : step.id === 'response'
          ? 'MapStruct eşlemesi Service içinde yapılır. Ana çizelgede ayrı durak yerine, yanıt DTO’suyla birlikte burada incelenir.'
          : null,
    };
  });
}
