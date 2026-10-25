export const taskListUrl = '/api/tasks?page=0&size=5&status=OPEN';
export const taskListRequest = `GET ${taskListUrl} HTTP/1.1\nHost: localhost:8080\nAccept: application/json, application/problem+json`;

const javaRoot = 'backend/src/main/java/com/example/restworkshop';
const controllerFile = `${javaRoot}/controllers/TaskController.java`;
const serviceFile = `${javaRoot}/services/TaskService.java`;
const repositoryFile = `${javaRoot}/repositories/TaskRepository.java`;
const mapperFile = `${javaRoot}/dto/mapper/TaskMapper.java`;

// Excerpts from the existing application files; no example product API is used.
const controllerCode = `@GetMapping
public TaskPageResponse findAll(
        @RequestParam(required = false) TaskStatus status,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "5") @Min(1) @Max(50) int size
) {
    return taskService.findAll(status, page, size);
}`;

const serviceCode = `public TaskPageResponse findAll(TaskStatus status, int page, int size) {
    var pageable = PageRequest.of(page, size, Sort.by("id").ascending());
    Page<Task> tasks = status == null
            ? taskRepository.findAll(pageable)
            : taskRepository.findByStatus(status, pageable);

    return new TaskPageResponse(
            taskMapper.toDto(tasks.getContent()),
            tasks.getNumber(),
            tasks.getSize(),
            tasks.getTotalElements(),
            tasks.getTotalPages()
    );
}`;

const repositoryCode = `public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);
}`;

const mapperCode = `@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface TaskMapper {
    TaskResponse toDto(Task task);
    List<TaskResponse> toDto(List<Task> tasks);
}`;

// Values verified against the local GET response; live records can change.
const exampleResponse = {
  items: [
    { id: 1, title: 'REST sunumunu hazırla', description: 'HTTP isteğinin parçalarını örnekle.', status: 'OPEN' },
    { id: 3, title: 'Service iş kuralını tasarla', description: 'Tamamlanmış görev yeniden açılamasın.', status: 'OPEN' },
  ],
  page: 0, size: 5, totalElements: 2, totalPages: 1,
};

export function makeTaskListScenario(order) {
  return {
    id: 'list', label: 'GET · Liste', method: 'GET', status: 200, outcome: 'Kendi kodumuz: OPEN görevleri listele',
    description: 'Bu istek, çalışan TaskController.findAll metoduna gider. status, page ve size argümanları Service’e, filtreli repository sorgusuna ve TaskMapper’a kadar takip edilir.',
    scopeNote: 'HTTP gösterimi doğrudan localhost:8080 backend’i içindir. Frontend aynı yolu 5173 üzerinden Next.js rewrite ile çağırır. Kod parçaları projeden alınmıştır; yanıt önceki yerel GET kontrolünden kalan sabit bir anlatım örneğidir, canlı veriyi göstermez.',
    liveUrl: taskListUrl,
    codeFlow: [
      { step: 'controller', label: 'TaskController.findAll' },
      { step: 'service', label: 'TaskService.findAll' },
      { step: 'repository', label: 'TaskRepository.findByStatus' },
      { step: 'mapper', label: 'TaskMapper.toDto' },
    ],
    request: taskListRequest,
    response: `HTTP/1.1 200 OK\nContent-Type: application/json\n\n${JSON.stringify(exampleResponse, null, 2)}`,
    requestParts: [
      { label: 'Method / yol', value: 'GET /api/tasks', explanation: 'TaskController sınıfı + findAll @GetMapping eşlemesi.' },
      { label: 'Durum filtresi', value: 'status = OPEN', explanation: '@RequestParam → TaskStatus.OPEN' },
      { label: 'Sayfalama', value: 'page = 0 · size = 5', explanation: '@RequestParam → int; page ≥ 0 ve size 1–50.' },
      { label: 'Host', value: 'localhost:8080', explanation: 'Backend’in yerel adresi.' },
      { label: 'Accept', value: 'application/json, application/problem+json', explanation: 'Ortak Axios istemcimizde tanımlı yanıt türleri.' },
      { label: 'Body / kimlik', value: 'Body yok · Authorization yok', explanation: 'Bu GET yalnızca query kullanır; JWT P5 aşamasında eklenecek.' },
    ],
    order,
    stages: {
      browser: {
        note: 'Görev ekranındaki OPEN filtresi, services/taskService.js içindeki getAll metoduna page=0, size=5, status=OPEN gönderir.',
        code: `getAll({ page, size, status }, signal) {
  return request('/api/tasks', { params: { page, size, ...(status ? { status } : {}) }, signal });
}`,
        language: 'JavaScript · projedeki getAll metodu', file: 'frontend/services/taskService.js',
        breakpoint: 'TaskService.getAll; ortak services/api.js içindeki api.request.',
      },
      tomcat: {
        note: 'Backend GET /api/tasks isteğini alır. Query string ayrı tutulur; Spring MVC parametre çözümleyicileri status/page/size değerlerini buradan bağlar.',
      },
      filters: { note: 'İstek Servlet filtre zincirinden geçer. Bu projede henüz Security/JWT veya özel request logging filtresi yoktur; bu GET Authorization header’ı gerektirmez.' },
      dispatcher: { note: 'DispatcherServlet, GET /api/tasks isteği için handler seçimini ve çağrıyı koordine eder. Filtre veya sayfalama işini kendisi yürütmez.' },
      mapping: {
        note: 'TaskController üzerindeki @RequestMapping("/api/tasks") ve findAll üzerindeki @GetMapping bu isteği eşler. Aynı sınıftaki @GetMapping("/{id}") bu liste isteğinin handler’ı değildir.',
        code: controllerCode, language: 'Java · TaskController.findAll', file: controllerFile,
      },
      adapter: { note: 'RequestMappingHandlerAdapter, TaskController.findAll(TaskStatus status, int page, int size) çağrısını hazırlamak için argümanları çözer.' },
      binding: {
        note: 'status="OPEN" → TaskStatus.OPEN; page="0" → int 0; size="5" → int 5. Bu istekte path variable ve body yoktur. Controller özel header parametresi almaz; Accept yanıt dönüşümünde değerlendirilir.',
        input: 'Query: page=0&size=5&status=OPEN · Accept header’ı.',
        output: 'Controller argümanları: status=TaskStatus.OPEN, page=0, size=5.',
        code: controllerCode, language: 'Java · projedeki @RequestParam tanımları', file: controllerFile,
        pitfall: 'Bu GET’te @RequestBody veya @PathVariable çalışmaz. /api/tasks/{id} ayrı findById metodudur.',
      },
      validation: {
        note: 'Controller’daki @Min(0), @Min(1), @Max(50) sayfa girişlerini doğrular. OPEN geçerli TaskStatus değeridir. Bu GET’te body DTO doğrulaması yoktur.',
        code: controllerCode, language: 'Java · TaskController parametre kısıtları', file: controllerFile,
      },
      controller: {
        note: 'Projedeki findAll metodu doğrudan taskService.findAll(status, page, size) çağırır.',
        code: controllerCode, language: 'Java · projeden alınan kod', file: controllerFile,
        breakpoint: 'TaskController.findAll içindeki return satırı.',
      },
      transaction: {
        note: 'TaskService sınıfının @Transactional(readOnly = true) ayarı bu okuma için geçerlidir.',
        code: '@Service\n@Transactional(readOnly = true)\npublic class TaskService {',
        language: 'Java · TaskService sınıfının başlığı', file: serviceFile,
      },
      service: {
        note: 'status OPEN olduğu için findByStatus dalı seçilir. Sıralama id ASC; sonuç ve sayfalama değerleri TaskPageResponse içinde birleştirilir.',
        code: serviceCode, language: 'Java · projedeki findAll metodu', file: serviceFile,
        breakpoint: 'TaskService.findAll: pageable oluşturma, sorgu dalı ve TaskPageResponse dönüşü.',
      },
      rules: { state: 'skipped', reason: 'Bu GET yalnızca liste okur; create veya validateStatusTransition çağrılmaz. DONE geçiş kuralı PUT/PATCH içindir.' },
      repository: {
        note: 'Service, OPEN filtresiyle gerçek TaskRepository.findByStatus metodunu çağırır. Spring Data uygulamayı üretir; modeldeki tasks tablosu sorgulanır.',
        input: 'TaskStatus.OPEN ve PageRequest(page=0, size=5, sort=id ASC).',
        output: 'Page<Task>; filtreli kayıtlar ve toplamlar.',
        code: repositoryCode, language: 'Java · TaskRepository.java', file: repositoryFile,
      },
      mapper: {
        note: 'Service’te taskMapper.toDto(tasks.getContent()) çağrılır. MapStruct, List<Task> listesini List<TaskResponse> listesine çevirir.',
        code: mapperCode, language: 'Java · TaskMapper.java', file: mapperFile,
        input: 'Repository sayfasındaki Task entity’leri.', output: 'List<TaskResponse>.',
      },
      commit: { note: 'Okuma transaction’ı tamamlanır. Bu istek görev oluşturmaz, güncellemez veya silmez.' },
      exception: { state: 'skipped', reason: 'Geçerli filtre ve sayfa girişleriyle başarılı GET akışında exception handler çağrılmaz.' },
      response: {
        note: 'TaskController.findAll doğrudan TaskPageResponse döndürür; normal başarı status’u 200’dür. POST’taki 201/Location veya DELETE’teki 204 yolu çalışmaz.',
        code: controllerCode, language: 'Java · TaskController.findAll dönüşü', file: controllerFile,
      },
      serialization: {
        note: 'TaskPageResponse getter’ları JSON alanlarına dönüşür: items, page, size, totalElements, totalPages. JSON yazımını Jackson yapar.',
        input: 'TaskPageResponse; içinde List<TaskResponse> ve sayfa toplamları.', output: 'Content-Type: application/json ve sayfalı JSON yanıtı.',
        code: JSON.stringify(exampleResponse, null, 2), language: 'JSON · yerelde doğrulanmış örnek yanıt',
        file: `${javaRoot}/dto/TaskPageResponse.java`,
      },
      unwind: { note: 'Backend HTTP 200 ve sayfalı JSON yanıtını gönderir. Görev ekranında aynı çağrı ortak Axios istemcisinden geçerek HTTP geçmişine kaydedilir.' },
    },
  };
}
