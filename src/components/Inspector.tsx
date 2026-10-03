import {useEffect, useState} from 'react';
import {clock, parseClock} from '../domain/model.ts';
import type {CaseFile, EventPatch, StoryEvent} from '../domain/model.ts';
export function Inspector({file, event, apply, dirty}: {file: CaseFile; event: StoryEvent; apply: (patch: EventPatch) => string | null; dirty: boolean}) {
  const [start, setStart] = useState(clock(event.start)), [end, setEnd] = useState(clock(event.end));
  const [placeId, setPlaceId] = useState(event.placeId), [certainty, setCertainty] = useState(event.certainty);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  useEffect(() => {setStart(clock(event.start));setEnd(clock(event.end));setPlaceId(event.placeId);setCertainty(event.certainty);}, [event.start,event.end,event.placeId,event.certainty]);
  const character = file.characters.find(x => x._id === event.characterId)!;
  function submit(e: React.FormEvent) {
    e.preventDefault();setMessage('');
    const a = parseClock(start), b = parseClock(end);
    if (a === null || b === null || a < file.windowStart || b > file.windowEnd || a >= b) {setError('Use a start before the end, within ' + clock(file.windowStart) + '–' + clock(file.windowEnd) + '.');return;}
    const failure = apply({start: a, end: b, placeId, certainty});
    if (failure) {setError(failure);return;}
    setError('');setMessage('Preview updated. The Sanity story is unchanged.');
  }
  return <aside className="inspector" aria-label="Selected event"><div className="inspector-top"><h2>Edit an event</h2>{dirty && <span className="preview-mark">Preview edit</span>}</div>
    <p className="person-label">{character.name} · {character.occupation}</p><h3 className="selected-event-title">{event.title}</h3>
    <form onSubmit={submit}>
      <div className="time-fields"><label>Starts<input type="time" step={60} value={start} onChange={e => {setStart(e.target.value);setMessage('');}} required/></label><label>Ends<input type="time" step={60} value={end} onChange={e => {setEnd(e.target.value);setMessage('');}} required/></label></div>
      <label>Place<select value={placeId} onChange={e => {setPlaceId(e.target.value);setMessage('');}}>{file.places.map(place => <option key={place._id} value={place._id}>{place.name}</option>)}</select></label>
      <label>What is established?<select value={certainty} onChange={e => {setCertainty(e.target.value as StoryEvent['certainty']);setMessage('');}}><option value="established">This happens in the story</option><option value="reported">A character says it happened</option></select></label>
      <button className="primary" type="submit">Apply to preview<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg></button>
      {error && <p className="field-error" role="alert">{error}</p>}{message && <p className="field-success" role="status">{message}</p>}
    </form>
    <section className="source-note"><h3>Author’s source note</h3><p>{event.source}</p></section>
    <p className="preview-explainer">Try a correction here. These edits stay in this browser. The author changes the published story in Studio.</p>
  </aside>;
}
