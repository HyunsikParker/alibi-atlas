import type {CaseFile, Finding} from '../domain/model.ts';
export function Findings({file, findings, selectedId, select}: {file: CaseFile; findings: Finding[]; selectedId: string; select: (id: string) => void}) {
  const conflicts = findings.filter(x => x.severity === 'conflict'), reviews = findings.filter(x => x.severity === 'review');
  return <aside className="findings" aria-label="Continuity findings">
    <h2>Check the story</h2>
    <p className="section-note">{conflicts.length ? conflicts.length + ' continuity conflict' + (conflicts.length === 1 ? '' : 's') : 'No physical conflicts detected'}</p>
    {!conflicts.length && <div className="resolved"><strong>{reviews.some(finding => finding.kind === 'unmapped') ? 'Some journeys still need review.' : 'No conflicts in the authored constraints.'}</strong><p>This checks only the events and routes in this case, not every possible plot hole.</p></div>}
    {conflicts.map((finding, index) => <article className="finding" key={finding.id}>
      <div className="finding-title"><span className="finding-number">{index + 1}</span><h3>{finding.title}</h3></div>
      <p>{finding.explanation}</p>
      <div className="event-links">{finding.eventIds.map(id => <button className={id === selectedId ? 'event-link chosen' : 'event-link'} key={id} onClick={() => select(id)}>{file.events.find(x => x._id === id)?.title}<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button>)}</div>
    </article>)}
    {!!reviews.length && <div className="review-section"><h3>Keep separate</h3>{reviews.map(finding => <article className="review" key={finding.id}><button onClick={() => select(finding.eventIds[0])}>{finding.title}</button><p>{finding.explanation}</p></article>)}</div>}
  </aside>;
}
