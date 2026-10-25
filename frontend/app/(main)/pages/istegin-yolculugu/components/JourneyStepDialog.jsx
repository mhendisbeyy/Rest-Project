'use client';

import { useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { phases } from './journeyContent';
import JourneyExampleCards from './JourneyExampleCards';

export default function JourneyStepDialog({ visible, selected, scenario, index, total, onHide, onPrevious, onNext }) {
  const dialog = useRef(null);
  const phase = phases.find(item => item.id === selected.phase);
  const skipped = selected.state === 'skipped';
  const stop = selected.state === 'stop';

  useEffect(() => {
    const content = dialog.current?.getContent();
    if (content) content.scrollTop = 0;
  }, [selected.id]);

  return <Dialog ref={dialog} id="journey-step-detail" header={selected.title} visible={visible} onHide={onHide}
    modal blockScroll closeOnEscape draggable={false} resizable={false} className="journey-step-dialog"
    style={{ width: '56rem', maxWidth: '94vw' }} breakpoints={{ '700px': '96vw' }}
    aria-describedby="journey-detail-summary" footer={<div className="journey-dialog-footer"><span>Esc ile kapatabilirsin.</span><Button label="Kapat" outlined onClick={onHide} /></div>}>
    <div className="journey-detail-toolbar"><span>İncelenen adım <strong>{index + 1} / {total}</strong></span>
      <div><Button icon="pi pi-arrow-left" text rounded size="small" aria-label="Önceki adım" disabled={index === 0} onClick={onPrevious} />
        <Button icon="pi pi-arrow-right" text rounded size="small" aria-label="Sonraki adım" disabled={index === total - 1} onClick={onNext} /></div>
   </div>
    <progress className="journey-position" max={total} value={index + 1} aria-label="İnceleme konumu" />
    <div className="journey-detail-body">
      <div className="journey-detail-phase"><span><i className={`pi ${phase.icon}`} aria-hidden="true" />{phase.label}</span>
        <Tag value={skipped ? 'Bu senaryoda atlanır' : stop ? `Hata noktası · ${scenario.status}` : 'Akışta'} severity={skipped ? 'secondary' : stop ? 'danger' : 'info'} />
      </div>
      <div className="journey-detail-caption"><i className={`journey-detail-icon pi ${selected.icon}`} aria-hidden="true" /><span>{selected.subtitle}</span></div>
      <p className="journey-detail-summary" id="journey-detail-summary">{selected.summary}</p>
      <div className={`journey-scenario-note ${skipped ? 'note-skipped' : stop ? 'note-stop' : ''}`}>
        <h3><i className={`pi ${skipped ? 'pi-minus-circle' : stop ? 'pi-exclamation-circle' : 'pi-bolt'}`} aria-hidden="true" />{skipped ? 'Bu adım neden atlanır?' : `${scenario.label} senaryosunda`}</h3>
        <p>{selected.reason || selected.note || `Bu istek, ${selected.title} aşamasından geçerek sonraki durağa ilerler.`}</p>
      </div>
      <div className="journey-explanation"><h3>Bu aşamada ne olur?</h3>{selected.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <div className="journey-io"><div><h3><i className="pi pi-sign-in" aria-hidden="true" />Girdi</h3><p>{selected.input}</p></div><div><h3><i className="pi pi-sign-out" aria-hidden="true" />Çıktı</h3><p>{selected.output}</p></div></div>
      <div className="journey-code" role="region" aria-label="Seçili senaryonun kod örneği"><div><h3>{skipped ? 'Genel kod / akış örneği' : 'Kod / akış örneği'}</h3><span>{selected.language}</span></div><pre><code>{selected.code}</code></pre></div>
      <JourneyExampleCards title={selected.title} examples={selected.examples} skipped={skipped} />
      {selected.details?.length > 0 && <section className="journey-layer-details" aria-labelledby="layer-details-heading">
        <h3 id="layer-details-heading">Bu bölümün ayrıntıları</h3><p>{selected.detailsIntro}</p>
        {selected.details.map(part => <details key={`${selected.id}-${part.id}`} open={selected.id === 'response'}>
          <summary>{part.title}<Tag value={part.state === 'stop' ? 'Hata noktası' : part.state === 'skipped' ? 'Atlanır' : 'Ayrıntı'} severity={part.state === 'stop' ? 'danger' : part.state === 'skipped' ? 'secondary' : 'info'} /></summary>
          <div className="journey-layer-detail-body">
            <p>{part.reason || part.note || part.summary}</p>
            <div className="journey-explanation">{part.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
            <div className="journey-code"><div><h3>{part.state === 'skipped' ? 'Genel örnek · bu senaryoda çağrılmaz' : 'Kod / akış örneği'}</h3><span>{part.language}</span></div><pre><code>{part.code}</code></pre></div>
            <JourneyExampleCards title={part.title} examples={part.examples} skipped={part.state === 'skipped'} />
            <p className="journey-detail-reminder">{part.pitfall}</p>
            <code className="journey-detail-file">{part.file}</code>
            {part.source && <a className="journey-source" href={part.source.url} target="_blank" rel="noreferrer">{part.source.label}<i className="pi pi-external-link" aria-hidden="true" /></a>}
          </div>
        </details>)}
      </section>}
      <div className="journey-caution"><i className="pi pi-lightbulb" aria-hidden="true" /><div><h3>Anlatırken vurgula</h3><p>{selected.pitfall}</p></div></div>
      <div className="journey-code-location"><h3><i className="pi pi-search" aria-hidden="true" />Kodda nerede görürüm?</h3><code>{selected.file}</code><p>{selected.breakpoint}</p></div>
      {selected.source && <a className="journey-source" href={selected.source.url} target="_blank" rel="noreferrer">{selected.source.label}<i className="pi pi-external-link" aria-hidden="true" /></a>}
    </div>
  </Dialog>;
}
