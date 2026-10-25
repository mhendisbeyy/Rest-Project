export default function JourneyExampleCards({ title, examples, skipped }) {
  if (!examples?.length) return null;
  return <section className="journey-practical-examples" aria-label={`${title} açıklayıcı örnekleri`}>
    <h3>Örnekle görelim</h3>
    <p className="journey-example-intro">{skipped ? 'Bu adım seçili senaryoda çalışmaz. Aşağıdaki örnekler konuyu karşılaştırmak içindir.' : 'Her örneğin kendi isteği ve koşulu vardır; bunlar ayrı karşılaştırma örnekleridir.'}</p>
    {examples.map(example => <article key={example.title}>
      <h4>{example.title}</h4>
      <div className="journey-example-comparison"><div><span>Girdi / koşul</span><pre>{example.input}</pre></div><div><span>Beklenen sonuç</span><pre>{example.result}</pre></div></div>
      <p>{example.explanation}</p>
    </article>)}
  </section>;
}
