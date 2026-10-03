'use client';
import {useEffect, useMemo, useState} from 'react';
import {createClient} from '@sanity/client';
import {analyze} from '../domain/analyze.ts';
import {clock, patchEvent} from '../domain/model.ts';
import {validateCase} from '../domain/validation.ts';
import type {CaseFile, CaseResponse, EventPatch, SourceInfo} from '../domain/model.ts';
import {Timeline} from './Timeline.tsx';
import {Findings} from './Findings.tsx';
import {Places} from './Places.tsx';
import {Inspector} from './Inspector.tsx';
import {loadCase} from '../lib/sanity.ts';

export function Atlas() {
  const [original, setOriginal] = useState<CaseFile | null>(null), [file, setFile] = useState<CaseFile | null>(null);
  const [source, setSource] = useState<SourceInfo | null>(null), [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [showReported, setShowReported] = useState(true);
  const [externalUpdate, setExternalUpdate] = useState(false), [notice, setNotice] = useState('');
  const [previewEpoch, setPreviewEpoch] = useState(0);
  async function refresh() {
    setLoading(true);setError('');
    try {
      const result: CaseResponse = await loadCase();
      const checked = validateCase(result.caseFile);
      setOriginal(checked);setFile(structuredClone(checked));setSource(result.source);
      setSelectedId(checked.events[1]?._id || checked.events[0]?._id || '');
      setExternalUpdate(false);setNotice('');
      setPreviewEpoch(value => value + 1);
    } catch (e) {setError(e instanceof Error ? e.message : 'The story could not be loaded.');}
    finally {setLoading(false);}
  }
  useEffect(() => {void refresh();}, []);
  useEffect(() => {
    if (source?.kind !== 'sanity' || !source.projectId || !source.dataset) return;
    const client = createClient({projectId: source.projectId, dataset: source.dataset, apiVersion: '2026-10-01', useCdn: false});
    const subscription = client.listen('*[_id match "atlas-*"]', {}, {includeResult: false, visibility: 'query', events: ['mutation']}).subscribe({next: () => setExternalUpdate(true), error: () => setNotice('Live updates are unavailable. Refresh still works.')});
    return () => subscription.unsubscribe();
  }, [source?.kind, source?.projectId, source?.dataset]);
  const findings = useMemo(() => file ? analyze(file) : [], [file]);
  const dirtyEvents = useMemo(() => file && original ? file.events.filter(event => JSON.stringify(event) !== JSON.stringify(original.events.find(x => x._id === event._id))) : [], [file, original]);
  const selected = file?.events.find(event => event._id === selectedId);
  const conflicts = findings.filter(finding => finding.severity === 'conflict');
  function apply(patch: EventPatch): string | null {
    if (!file || !selected) return 'Choose an event first.';
    try {const next = validateCase(patchEvent(file, selected._id, patch));setFile(next);return null;}
    catch (e) {return e instanceof Error ? e.message : 'This change is invalid.';}
  }
  function reset() {if (original) {setFile(structuredClone(original));setPreviewEpoch(value => value + 1);setNotice('Preview reset to the loaded story.');}}
  function previewReport() {
    return JSON.stringify({format: 'alibi-atlas-preview-v1', source, caseFile: file, changes: dirtyEvents.map(event => ({eventId: event._id, event})), findings}, null, 2);
  }
  async function copyPreview() {
    if (!file) return;
    try {await navigator.clipboard.writeText(previewReport());setNotice('Preview report copied. Nothing was written to Sanity.');}
    catch {setNotice('Copy is unavailable in this browser. Use Export preview report instead.');}
  }
  function exportPreview() {
    if (!file) return;
    const blob = new Blob([previewReport()], {type: 'application/json'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');link.href = url;link.download = 'alibi-atlas-preview.json';link.click();URL.revokeObjectURL(url);
    setNotice('Preview report export requested. Nothing was written to Sanity.');
  }
  return <div className="app-shell">
    <header className="app-header"><a href={(process.env.NEXT_PUBLIC_BASE_PATH || '') + '/'} className="brand">Alibi Atlas<span className="brand-symbol" aria-hidden="true"><svg viewBox="0 0 20 20" width="20" height="20"><path d="M3 4h14M3 10h14M3 16h14M6 2v16M14 2v16" fill="none" stroke="currentColor" strokeWidth="1.3"/></svg></span></a><div className="header-context">A continuity workbench for fiction</div>{process.env.NEXT_PUBLIC_SANITY_STUDIO_URL && <a className="studio-link" href={process.env.NEXT_PUBLIC_SANITY_STUDIO_URL} target="_blank" rel="noopener noreferrer">Author’s Studio<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4 12 12 4M4 4h8v8" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></a>}</header>
    <main>
      {loading && !file && <div className="empty-state" role="status"><h1>Loading the story…</h1><p>Reading the events, places and routes.</p></div>}
      {error && <div className="load-error" role="alert"><h1>The story did not load</h1><p>{error}</p><button className="primary" onClick={() => void refresh()}>Retry</button></div>}
      {file && !error && <>
        <section className="case-heading"><div><h1>{file.title}</h1><p>{file.description}</p></div><div className="case-source"><span className={source?.kind === 'sanity' ? 'source-online' : 'source-local'}>{source?.kind === 'sanity' ? 'Sanity · Published story' : 'Local story · Not connected'}</span><button onClick={() => {if (!dirtyEvents.length || window.confirm('Discard your preview changes and reload the published story?')) void refresh();}} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh story'}</button></div></section>
        {externalUpdate && <div className="update-banner" role="status">The published story changed. Refresh when you are ready; your preview edits have been kept.</div>}
        <div className="workbench">
          <Findings file={file} findings={findings} selectedId={selectedId} select={setSelectedId}/>
          <section className="canvas"><div className="canvas-heading"><div><h2>Follow the timeline</h2><p>{file.characters.length} characters · {file.events.length} events · {clock(file.windowStart)}–{clock(file.windowEnd)}</p></div><label className="checkbox"><input type="checkbox" checked={showReported} onChange={e => setShowReported(e.target.checked)}/>Show reported accounts</label></div>
            <Timeline file={file} findings={findings} selectedId={selectedId} select={setSelectedId} showReported={showReported}/>
            <div className="places-heading"><h2>Can they get there?</h2><p>Minimum journey times between places</p></div><Places file={file}/>
          </section>
          {selected ? <Inspector key={selected._id + ':' + previewEpoch} file={file} event={selected} apply={apply} dirty={dirtyEvents.some(x => x._id === selected._id)}/> : <aside className="inspector"><h2>Choose an event</h2><p>The timeline has no events to edit.</p></aside>}
        </div>
        <section className="preview-bar"><div><strong>{dirtyEvents.length ? dirtyEvents.length + ' preview edit' + (dirtyEvents.length === 1 ? '' : 's') : 'No preview edits'}</strong><span>{conflicts.length ? conflicts.length + ' continuity conflict' + (conflicts.length === 1 ? ' remains' : 's remain') : 'No continuity conflicts detected'}</span></div><div className="preview-actions"><button onClick={reset} disabled={!dirtyEvents.length}>Reset preview</button><button onClick={() => void copyPreview()}>Copy report JSON</button><button onClick={exportPreview}>Export preview report</button></div></section>
        {notice && <p className="notice" role="status">{notice}</p>}
        <footer className="app-footer"><p>Alibi Atlas checks authored time and place constraints. A reported account is not proof, and a consistent timeline is not a complete story review.</p><span>{source?.kind === 'sanity' ? 'Content Lake · ' + source.dataset : 'Connect Sanity before using this as a challenge entry'}</span></footer>
      </>}
    </main>
  </div>;
}
