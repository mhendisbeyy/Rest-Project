export const filterSources = {
  servlet: 'https://jakarta.ee/specifications/servlet/6.1/jakarta-servlet-spec-6.1.html',
  boot: 'https://docs.spring.io/spring-boot/reference/web/servlet.html',
  once: 'https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/OncePerRequestFilter.html',
  security: 'https://docs.spring.io/spring-security/reference/servlet/architecture.html',
};

// Spring Boot startup debug output, verified on 2026-10-25 with the existing WAR.
// Seed data and DDL were disabled; no API writes were sent.
export const observedFilters = [
  { name: 'characterEncodingFilter', order: '-2147483648', role: 'İstek/yanıt karakter kodlamasını ayarlar.' },
  { name: 'formContentFilter', order: '-9900', role: 'PUT/PATCH/DELETE form body alanlarını Servlet parametresi olarak erişilebilir yapar. JSON body’yi DTO’ya çevirmez.' },
  { name: 'requestContextFilter', order: '-105', role: 'Request/locale bağlamını işleyen thread’e açar; işlem sonunda temizler. Kullanıcı oturumu oluşturmak anlamına gelmez.' },
];

export const filterSimulation = [
  {
    id: 'pass', label: 'Zincire devam',
    summary: 'Her iki filtre devam eder; MVC çalışır ve kontrol ters sırayla geri döner.',
    trace: ['A · önce', 'B · önce', 'MVC · isteği işle', 'B · sonra', 'A · finally'],
    note: 'MVC’nin Advice ile ele aldığı bir 400/409 da normal bir yanıt olarak bu zincirden dönebilir; her hata işlenmemiş exception değildir.',
  },
  {
    id: 'block', label: 'Filtrede durdur',
    summary: 'B örnek bir koşulu reddeder ve 400 döndürür. chain.doFilter çağrılmadığı için MVC çağrılmaz.',
    trace: ['A · önce', 'B · önce', 'B · 400 yaz ve return', 'A · finally'],
    note: 'Bu bağımsız modeldeki 400, timeline’ın POST validation senaryosu değildir. Yanıtı B filtresi oluşturur; MVC Advice çalışmaz.',
  },
  {
    id: 'throw', label: 'İşlenmemiş hata',
    summary: 'MVC’den çözümlenmeden taşan exception B’nin normal sonrası kodunu atlar; A’nın finally bloğu yine çalışır.',
    trace: ['A · önce', 'B · önce', 'MVC · çözülmemiş exception', 'A · finally'],
    note: 'B’de finally yoktur; “B · sonra” çalışmaz. Container ERROR dispatch başlatabilir; bu model ERROR zincirini çizmez. O andaki response status’u nihai hata status’u olmayabilir.',
  },
];

export const filterModelCode = `// Bağımsız eğitim modeli; projede kayıtlı A/B filtresi yok.
// A filtresi:
log("A · önce");
try {
    chain.doFilter(request, response);
} finally {
    log("A · finally");
}

// B filtresi:
log("B · önce");
if (ornekKosulReddedildi) {
    response.setStatus(400);
    return; // MVC'ye geçme
}
chain.doFilter(request, response);
log("B · sonra");`;

export const filterRegistrationCode = `// Kavramsal örnek; backend'e eklenmedi.
// RequestTraceFilter bu örnekte @Component değildir.
@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<RequestTraceFilter> traceFilter() {
        var registration = new FilterRegistrationBean<>(new RequestTraceFilter());
        registration.setName("requestTraceFilter");
        registration.addUrlPatterns("/api/*");
        registration.setDispatcherTypes(DispatcherType.REQUEST);
        registration.setOrder(10);
        return registration;
    }
}`;

export const onceFilterCode = `// Kavramsal sınıf; ayrı dosyada, gerekli import'larla kullanılır.
public class RequestTraceFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RequestTraceFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long baslangic = System.nanoTime(); // Her çağrının kendi yerel değişkeni
        try {
            chain.doFilter(request, response);
        } finally {
            log.debug("Senkron zincir süresi: {} ns", System.nanoTime() - baslangic);
        }
    }
}`;

export const optionalFilters = [
  ['CorsFilter', 'Origin/preflight ve CORS yanıt bilgileri; ayrıca yapılandırılır.'],
  ['ForwardedHeaderFilter', 'Proxy üzerinden gelen adres/şema bilgileri; güvenilen proxy düzeniyle yapılandırılır.'],
  ['DelegatingFilterProxy → FilterChainProxy', 'Spring Security köprüsü; P5 konusu, mevcut projede yok.'],
  ['Özel logging / request ID filtresi', 'Korelasyon ve ölçüm; P6 konusu, mevcut projede yok.'],
];
