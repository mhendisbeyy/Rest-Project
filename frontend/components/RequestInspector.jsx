'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { selectExchange } from '../store/slices/httpSlice';

export default function RequestInspector() {
  const [tab, setTab] = useState('response');
  const { exchanges, selectedId } = useSelector(state => state.http);
  const dispatch = useDispatch();
  const exchange = exchanges.find(item => item.id === selectedId) || exchanges.at(-1);
  const options = [...exchanges].reverse().map(item => ({ label: `${item.method} ${item.url} · ${item.status ?? 'Yanıt yok'}`, value: item.id }));
  return <aside className="surface-card inspector" aria-label="HTTP istekleri ve yanıtları">
    <div className="section-heading"><h2>HTTP trafiği</h2><span className="live-label"><i />CANLI</span></div>
    <p className="inspector-intro">Son 10 çağrı. Yazma yanıtı, liste yenilendiğinde de seçili kalır.</p>
    {exchange ? <>
      <div className="field"><label htmlFor="http-history">İstek geçmişi</label><Dropdown inputId="http-history" optionLabel="label" optionValue="value" aria-label="İstek geçmişi" value={exchange.id} options={options} onChange={event => dispatch(selectExchange(event.value))} className="history-dropdown" /></div>
      <div className="request-url"><Tag value={exchange.method} severity="info" /><code>{exchange.url}</code></div>
      <div className="response-summary"><Tag value={exchange.status === null ? 'Yanıt yok' : `${exchange.status} ${exchange.statusText}`} severity={exchange.status !== null && exchange.status < 400 ? 'success' : 'danger'} /><span>{exchange.durationMs} ms · istemci</span></div>
      <div className="inspector-tabs" role="group" aria-label="HTTP görünümü"><Button label="Yanıt" text={tab !== 'response'} size="small" onClick={() => setTab('response')} /><Button label="İstek" text={tab !== 'request'} size="small" onClick={() => setTab('request')} /></div>
      {tab === 'response' ? <div className="code-panel"><span className="code-label">RESPONSE BODY</span>
        {exchange.status === 204 ? <p className="no-body">204 No Content — yanıt gövdesi yok.</p> : <pre>{exchange.status === null ? 'HTTP yanıtı alınamadı.' : JSON.stringify(exchange.responseBody, null, 2)}</pre>}
        <details><summary>Response headers</summary><pre>{JSON.stringify(exchange.responseHeaders, null, 2)}</pre></details></div> :
        <div className="code-panel"><span className="code-label">REQUEST HEADERS</span><pre>{JSON.stringify(exchange.requestHeaders, null, 2)}</pre><span className="code-label">REQUEST BODY</span>
          {exchange.requestBody === null ? <p className="no-body">Bu {exchange.method} isteğinin body’si yok.</p> : <pre>{JSON.stringify(exchange.requestBody, null, 2)}</pre>}</div>}
    </> : <div className="inspector-empty"><i className="pi pi-code" /><p>İlk isteğin yanıtı burada görünecek.</p></div>}
    <div className="inspector-note">Gerçek API yanıtı · Hassas header değerleri maskelenir.</div>
  </aside>;
}
