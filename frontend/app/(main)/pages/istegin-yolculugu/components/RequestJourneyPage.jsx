'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { getPipelineStepId, getScenarioSteps, phases, scenarios } from './journeyContent';
import JourneyStepDialog from './JourneyStepDialog';
import HttpRequestExample from './HttpRequestExample';

export default function RequestJourneyPage() {
  const [scenarioId, setScenarioId] = useState('list');
  const [selectedId, setSelectedId] = useState('browser');
  const [detailOpen, setDetailOpen] = useState(false);
  const [columns, setColumns] = useState(5);
  const timelineViewport = useRef(null);
  const revealSelection = useRef(false);
  const stepButtons = useRef({});
  const scenario = scenarios.find(item => item.id === scenarioId);
  const timeline = getScenarioSteps(scenario);
  const index = timeline.findIndex(item => item.id === selectedId);
  const selected = timeline[index];
  useEffect(() => {
    const viewport = timelineViewport.current;
    function fitToWidth(width) {
      if (width > 0) setColumns(width >= 1080 ? 6 : width >= 860 ? 5 : width >= 650 ? 4 : width >= 460 ? 3 : 2);
    }
    fitToWidth(viewport.clientWidth);
    const observer = new ResizeObserver(entries => fitToWidth(entries[0]?.contentRect.width || 0));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!revealSelection.current || detailOpen) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stepButtons.current[selectedId]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    revealSelection.current = false;
  }, [selectedId, scenarioId, detailOpen]);

  function chooseStep(id, { open = false, focus = false } = {}) {
    const stepId = getPipelineStepId(id);
    revealSelection.current = true;
    setSelectedId(stepId);
    if (open) setDetailOpen(true);
    if (focus) stepButtons.current[stepId]?.focus();
  }

  function chooseScenario(value) {
    setScenarioId(value.id);
    setSelectedId(getPipelineStepId(value.stop || value.focus || 'browser'));
    revealSelection.current = true;
    setDetailOpen(false);
  }

  function moveWithKeyboard(event, position) {
    const row = Math.floor(position / columns);
    const offset = position % columns;
    const column = row % 2 ? columns - 1 - offset : offset;
    const direction = row % 2 ? -1 : 1;
    function adjacentRow(delta) {
      const targetRow = row + delta;
      const target = targetRow * columns + (targetRow % 2 ? columns - 1 - column : column);
      return targetRow >= 0 && target < timeline.length ? target : position;
    }
    const next = {
      ArrowRight: position + direction, ArrowLeft: position - direction,
      ArrowDown: adjacentRow(1), ArrowUp: adjacentRow(-1), Home: 0, End: timeline.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = timeline[Math.max(0, Math.min(timeline.length - 1, next))];
    chooseStep(target.id, { focus: true });
  }

  return <div className="request-journey">
    <header className="journey-heading">
      <div><span className="eyebrow">HTTP YAŞAM DÖNGÜSÜ · ETKİLEŞİMLİ ANLATIM</span>
        <h1>Bir isteğin <span>yolculuğu.</span></h1>
        <p>Frontend tek adımda isteği gönderir. Backend’in HTTP mesajını nasıl karşıladığını, işlediğini ve yanıtladığını takip et.</p>
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
      <HttpRequestExample scenario={scenario} onOpenStep={id => chooseStep(id, { open: true })} />
    </section>

    <section className="journey-rail surface-card" aria-labelledby="timeline-heading">
        <div className="journey-rail-heading"><div><h2 id="timeline-heading">İsteğin zaman çizelgesi</h2><p>Controller → Service → Repository. Ara ayrıntıları ilgili katmanın dialogunda incele.</p></div>
          <div className="journey-rail-controls"><span>{index + 1} / {timeline.length}</span>
            <Button icon="pi pi-arrow-left" outlined rounded size="small" aria-label="Önceki durağa git" disabled={index === 0} onClick={() => chooseStep(timeline[index - 1].id, { focus: true })} />
            <Button icon="pi pi-arrow-right" outlined rounded size="small" aria-label="Sonraki durağa git" disabled={index === timeline.length - 1} onClick={() => chooseStep(timeline[index + 1].id, { focus: true })} />
          </div>
        </div>
        <div className="journey-phase-jumps" role="group" aria-label="Aşamalara hızlı geçiş">
          {phases.map((phase, phaseIndex) => <button key={phase.id} type="button" aria-label={`${phase.label} aşamasına git`}
            className={`journey-phase-jump phase-${phase.id} ${selected.phase === phase.id ? 'is-current' : ''}`}
            onClick={() => chooseStep(timeline.find(step => step.phase === phase.id).id, { focus: true })}>
            <span>{String(phaseIndex + 1).padStart(2, '0')}</span><i className={`pi ${phase.icon}`} aria-hidden="true" />{phase.label}
          </button>)}
        </div>
        <details className="journey-reading-note"><summary>Bu şemayı nasıl okumalıyım?</summary><p>Bu, katmanları anlatan sade bir akıştır. HandlerMapping, HandlerAdapter, bağlama, validation ve yanıt dönüşümü iç içe çalışır. Controller → Service → Repository giriş sırasıdır; kontrol geri dönerken Service içinde DTO hazırlanır ve transaction tamamlanır. Hata ve karşılaştırma örnekleri ayrı koşulları gösterir; şema canlı tracing değildir.</p></details>
        <nav ref={timelineViewport} aria-label="İstek yaşam döngüsü adımları">
          <ol className="journey-timeline" style={{ '--timeline-columns': columns }}>
            {timeline.map((step, position) => {
              const row = Math.floor(position / columns);
              const reverse = row % 2 === 1;
              const rowEnd = (position + 1) % columns === 0;
              const last = position === timeline.length - 1;
              return <li key={step.id} className={`phase-${step.phase}`} data-direction={reverse ? 'reverse' : 'forward'}
                data-connect={last ? 'end' : rowEnd ? 'turn' : 'straight'}
                style={{ gridRow: row + 1, gridColumn: reverse ? columns - (position % columns) : (position % columns) + 1 }}>
                <button type="button" ref={node => { stepButtons.current[step.id] = node; }}
                  className={`journey-stop ${step.id === selectedId ? 'is-selected' : ''} ${step.state === 'skipped' ? 'is-skipped' : ''} ${step.state === 'stop' ? 'is-stop' : ''}`}
                  aria-current={step.id === selectedId ? 'step' : undefined} aria-controls={detailOpen ? 'journey-step-detail' : undefined}
                  aria-haspopup="dialog" aria-describedby={`step-summary-${step.id}`}
                  aria-label={`${position + 1}. ${step.title}${step.state === 'skipped' ? ' — bu senaryoda atlanır' : step.state === 'stop' ? ' — hata burada oluşur' : ''}`}
                  onKeyDown={event => moveWithKeyboard(event, position)} onClick={() => chooseStep(step.id, { open: true })}>
                  <span className="journey-node">{String(position + 1).padStart(2, '0')}</span>
                  <span className="journey-stop-text"><strong>{step.title}</strong>
                    <span className="journey-short-description" id={`step-summary-${step.id}`}>{step.brief}</span>
                    {step.state !== 'included' && <span className="journey-stop-state">{step.state === 'skipped' ? 'Atlanır' : 'Hata noktası'}</span>}
                  </span>
                </button>
              </li>;
            })}
          </ol>
        </nav>
        <div className="journey-rail-bottom"><div className="journey-legend"><span><i className="legend-included" />Akışta</span><span><i className="legend-skipped" />Atlanır</span><span><i className="legend-stop" />Hata noktası</span></div><p>Ok tuşlarıyla gezin · Enter ile detayları aç</p></div>
    </section>

    <JourneyStepDialog visible={detailOpen} selected={selected} scenario={scenario} index={index} total={timeline.length}
      onHide={() => setDetailOpen(false)} onPrevious={() => chooseStep(timeline[index - 1].id, { open: true })}
      onNext={() => chooseStep(timeline[index + 1].id, { open: true })} />

    <section className="journey-next-lessons" aria-labelledby="future-heading"><span className="pi pi-info-circle" aria-hidden="true" /><div><h2 id="future-heading">Güvenlik ve izleme bu akışın neresine gelecek?</h2>
      <p><strong>P5:</strong> Spring Security ve JWT doğrulaması, MVC’den önce filtre zincirinde yer alacak. <strong>P6:</strong> request ID ve logging filtresi eklenecek. Bu özellikler henüz uygulanmadı. Timeline öğretim amaçlıdır; canlı tracing veya süre ölçümü göstermez.</p>
      <Link href="/pages/gorevler">Görev ekranında gerçek istekleri incele <i className="pi pi-arrow-right" aria-hidden="true" /></Link>
    </div></section>
  </div>;
}
