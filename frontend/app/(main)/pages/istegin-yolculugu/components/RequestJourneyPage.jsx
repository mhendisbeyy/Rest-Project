'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { getScenarioSteps, phases, scenarios } from './journeyContent';

export default function RequestJourneyPage() {
  const [scenarioId, setScenarioId] = useState('list');
  const [selectedId, setSelectedId] = useState('browser');
  const detail = useRef(null);
  const stepButtons = useRef({});
  const scenario = scenarios.find(item => item.id === scenarioId);
  const timeline = getScenarioSteps(scenario);
  const index = timeline.findIndex(item => item.id === selectedId);
  const selected = timeline[index];
  const phase = phases.find(item => item.id === selected.phase);
  const skipped = selected.state === 'skipped';
  const stop = selected.state === 'stop';

  function chooseStep(id, scroll = false) {
    setSelectedId(id);
    if (scroll && window.matchMedia('(max-width: 1000px)').matches) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      detail.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function chooseScenario(value) {
    setScenarioId(value.id);
    setSelectedId(value.stop || value.focus || 'browser');
  }

  function moveWithKeyboard(event, position) {
    const next = { ArrowDown: position + 1, ArrowUp: position - 1, Home: 0, End: timeline.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = timeline[Math.max(0, Math.min(timeline.length - 1, next))];
    chooseStep(target.id);
    stepButtons.current[target.id]?.focus();
  }

  return <div className="request-journey">
    <header className="journey-heading">
      <div><span className="eyebrow">HTTP YAŞAM DÖNGÜSÜ · ETKİLEŞİMLİ ANLATIM</span>
        <h1>Bir isteğin <span>yolculuğu.</span></h1>
        <p>Tarayıcıdan PostgreSQL’e, Java nesnesinden JSON’a. Bir senaryo seç, her durağın içinde neler olduğunu keşfet.</p>
      </div>
      <span className="journey-heading-icon pi pi-sitemap" aria-hidden="true" />
    </header>

    <section className="surface-card journey-scenarios" aria-labelledby="scenario-heading">
      <div className="journey-section-label"><h2 id="scenario-heading">Hangi isteği izleyelim?</h2><span><i className="pi pi-book" aria-hidden="true" /> Örnek akış · API çağrısı göndermez</span></div>
      <div className="journey-scenario-options" role="group" aria-label="İstek senaryosu">
        {scenarios.map(item => <Button key={item.id} label={item.label} aria-pressed={item.id === scenarioId}
          outlined={item.id !== scenarioId} className="journey-scenario-button" size="small" onClick={() => chooseScenario(item)} />)}
      </div>
      <div className="journey-scenario-summary" aria-live="polite">
        <Tag value={`${scenario.status}`} severity={scenario.status >= 400 ? 'danger' : 'success'} />
        <div><h3>{scenario.outcome}</h3><p>{scenario.description}</p></div>
      </div>
      <details className="journey-http">
        <summary>Örnek HTTP isteği ve beklenen yanıt <span className="pi pi-chevron-down" aria-hidden="true" /></summary>
        <div className="journey-http-grid"><div><h4>İstek</h4><pre>{scenario.request}</pre></div><div><h4>Yanıt</h4><pre>{scenario.response}</pre></div></div>
        <p>42 numaralı kaynak ve yanıt verileri temsildir. Senaryolar, çalışan görev API’sinin sözleşmesini açıklar.</p>
      </details>
    </section>

    <div className="journey-grid">
      <aside className="journey-rail surface-card">
        <div className="journey-rail-heading"><h2>İsteğin zaman çizelgesi</h2><span>{timeline.length} durak</span></div>
        <p className="journey-rail-hint">Bir adıma tıkla. Klavyede ↑ ↓ ile de ilerleyebilirsin.</p>
        <nav aria-label="İstek yaşam döngüsü adımları">
          <ol className="journey-timeline">
            {timeline.map((step, position) => {
              const group = phases.find(item => item.id === step.phase);
              return <li key={step.id}>
                {timeline[position - 1]?.phase !== step.phase && <div className="journey-phase"><i className={`pi ${group.icon}`} aria-hidden="true" />{group.label}</div>}
                <button type="button" ref={node => { stepButtons.current[step.id] = node; }}
                  className={`journey-stop ${step.id === selectedId ? 'is-selected' : ''} ${step.state === 'skipped' ? 'is-skipped' : ''} ${step.state === 'stop' ? 'is-stop' : ''}`}
                  aria-current={step.id === selectedId ? 'step' : undefined} aria-controls="journey-step-detail"
                  aria-label={`${position + 1}. ${step.title}${step.state === 'skipped' ? ' — bu senaryoda atlanır' : step.state === 'stop' ? ' — hata burada oluşur' : ''}`}
                  onKeyDown={event => moveWithKeyboard(event, position)} onClick={() => chooseStep(step.id, true)}>
                  <span className="journey-node">{String(position + 1).padStart(2, '0')}</span>
                  <span className="journey-stop-text"><strong>{step.title}</strong><small>{step.subtitle}</small>
                    {step.state === 'skipped' && <span className="journey-stop-state">Atlanır</span>}
                    {step.state === 'stop' && <span className="journey-stop-state">Hata burada oluşur</span>}
                  </span>
                  {step.id === selectedId && <i className="pi pi-angle-right journey-selected-arrow" aria-hidden="true" />}
                </button>
              </li>;
            })}
          </ol>
        </nav>
        <div className="journey-legend"><span><i className="legend-included" />Akışta</span><span><i className="legend-skipped" />Atlanır</span><span><i className="legend-stop" />Hata noktası</span></div>
      </aside>

      <section id="journey-step-detail" ref={detail} className="journey-detail surface-card" aria-labelledby="step-heading">
        <div className="journey-detail-toolbar">
          <span>İncelenen adım <strong>{index + 1} / {timeline.length}</strong></span>
          <div><Button icon="pi pi-arrow-left" text rounded size="small" aria-label="Önceki adım" disabled={index === 0} onClick={() => chooseStep(timeline[index - 1].id)} />
            <Button icon="pi pi-arrow-right" text rounded size="small" aria-label="Sonraki adım" disabled={index === timeline.length - 1} onClick={() => chooseStep(timeline[index + 1].id)} /></div>
        </div>
        <progress className="journey-position" max={timeline.length} value={index + 1} aria-label="İnceleme konumu" />
        <div className="journey-detail-body">
          <div className="journey-detail-phase"><span><i className={`pi ${phase.icon}`} aria-hidden="true" />{phase.label}</span>
            <Tag value={skipped ? 'Bu senaryoda atlanır' : stop ? `Hata noktası · ${scenario.status}` : 'Akışta'} severity={skipped ? 'secondary' : stop ? 'danger' : 'info'} />
          </div>
          <div className="journey-detail-title"><span className={`journey-detail-icon pi ${selected.icon}`} aria-hidden="true" /><div><h2 id="step-heading" aria-live="polite">{selected.title}</h2><p>{selected.subtitle}</p></div></div>
          <p className="journey-detail-summary">{selected.summary}</p>

          <div className={`journey-scenario-note ${skipped ? 'note-skipped' : stop ? 'note-stop' : ''}`}>
            <h3><i className={`pi ${skipped ? 'pi-minus-circle' : stop ? 'pi-exclamation-circle' : 'pi-bolt'}`} aria-hidden="true" />{skipped ? 'Bu adım neden atlanır?' : `${scenario.label} senaryosunda`}</h3>
            <p>{selected.reason || selected.note || `Bu istek, ${selected.title} aşamasından geçerek sonraki durağa ilerler.`}</p>
          </div>

          <div className="journey-explanation"><h3>Bu aşamada ne olur?</h3>{selected.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>

          <div className="journey-io"><div><h3><i className="pi pi-sign-in" aria-hidden="true" />Girdi</h3><p>{selected.input}</p></div><div><h3><i className="pi pi-sign-out" aria-hidden="true" />Çıktı</h3><p>{selected.output}</p></div></div>

          <div className="journey-code"><div><h3>{skipped ? 'Genel kod / akış örneği' : 'Kod / akış örneği'}</h3><span>{selected.language}</span></div><pre><code>{selected.code}</code></pre></div>

          <div className="journey-caution"><i className="pi pi-lightbulb" aria-hidden="true" /><div><h3>Anlatırken vurgula</h3><p>{selected.pitfall}</p></div></div>
          <div className="journey-code-location"><h3><i className="pi pi-search" aria-hidden="true" />Kodda nerede görürüm?</h3><code>{selected.file}</code><p>{selected.breakpoint}</p></div>
          {selected.source && <a className="journey-source" href={selected.source.url} target="_blank" rel="noreferrer">{selected.source.label}<i className="pi pi-external-link" aria-hidden="true" /></a>}
        </div>
      </section>
    </div>

    <section className="journey-next-lessons" aria-labelledby="future-heading"><span className="pi pi-info-circle" aria-hidden="true" /><div><h2 id="future-heading">Güvenlik ve izleme bu akışın neresine gelecek?</h2>
      <p><strong>P5:</strong> Spring Security ve JWT doğrulaması, MVC’den önce filtre zincirinde yer alacak. <strong>P6:</strong> request ID ve logging filtresi eklenecek. Bu özellikler henüz uygulanmadı. Timeline öğretim amaçlıdır; canlı tracing veya süre ölçümü göstermez.</p>
      <Link href="/pages/gorevler">Görev ekranında gerçek istekleri incele <i className="pi pi-arrow-right" aria-hidden="true" /></Link>
    </div></section>
  </div>;
}
