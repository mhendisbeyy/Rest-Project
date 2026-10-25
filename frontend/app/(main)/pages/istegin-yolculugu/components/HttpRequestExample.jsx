export default function HttpRequestExample({ scenario, onOpenStep }) {
  return <section className="journey-request-example" aria-labelledby="backend-request-heading">
    <h3 id="backend-request-heading">Backend’e gelen HTTP isteği</h3>
    <div className={`journey-request-grid ${scenario.requestParts ? 'has-parts' : ''}`}>
      <pre className="journey-wire-request" aria-label="Ham HTTP isteği"><code>{scenario.request}</code></pre>
      {scenario.requestParts && <dl className="journey-request-parts" aria-label="HTTP isteğinin parçaları">
        {scenario.requestParts.map(part => <div key={part.label}><dt>{part.label}</dt><dd><code>{part.value}</code><span>{part.explanation}</span></dd></div>)}
      </dl>}
    </div>
    <p className="journey-example-scope">{scenario.scopeNote || 'Bu ekran istek göndermez; aşağıdaki yanıt görev API’sinin temsili çıktısıdır. Kaynak ID’si örnektir.'}</p>
    {scenario.codeFlow && <div className="journey-source-flow" role="group" aria-label="Bu isteğin projedeki kod yolu">
      {scenario.codeFlow.map((source, index) => <span key={source.step}>{index > 0 && <i className="pi pi-angle-right" aria-hidden="true" />}<button type="button" onClick={() => onOpenStep(source.step)}>{source.label}</button></span>)}
    </div>}
    {scenario.liveUrl && <a className="journey-source" href={scenario.liveUrl} target="_blank" rel="noreferrer">Gerçek GET yanıtını aç <i className="pi pi-external-link" aria-hidden="true" /></a>}
    <details className="journey-http"><summary>Beklenen HTTP yanıtı <span className="pi pi-chevron-down" aria-hidden="true" /></summary><pre className="journey-example-response">{scenario.response}</pre></details>
  </section>;
}
