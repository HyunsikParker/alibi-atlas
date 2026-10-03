import {clock} from '../domain/model.ts';
import type {CaseFile, Finding} from '../domain/model.ts';
export function Timeline({file, findings, selectedId, select, showReported}: {file: CaseFile; findings: Finding[]; selectedId: string; select: (id: string) => void; showReported: boolean}) {
  const span = file.windowEnd - file.windowStart;
  const conflictIds = new Set(findings.filter(x => x.severity === 'conflict').flatMap(x => x.eventIds));
  const tickMinutes = Array.from({length: 7}, (_, i) => file.windowStart + Math.round(span * i / 6));
  return <div className="timeline-scroll" role="region" aria-label="Story timeline" tabIndex={0}>
    <div className="timeline">
      <div className="time-axis"><span className="axis-name">Character</span><div className="ticks">{tickMinutes.map((time, i) => <span key={time} style={{left: i * 100 / 6 + '%'}}>{clock(time)}</span>)}</div></div>
      {file.characters.map(character => <div className="timeline-row" key={character._id}>
        <div className="character"><strong>{character.name}</strong><span>{character.occupation}</span></div>
        <div className="track">
          {tickMinutes.map((minute, i) => <span key={minute} className="gridline" style={{left: i * 100 / 6 + '%'}}/>)}
          {file.events.filter(event => event.characterId === character._id && (showReported || event.certainty === 'established')).map(event => {
            const place = file.places.find(x => x._id === event.placeId)!;
            const y = event.certainty === 'reported' ? 47 : 10;
            const error = conflictIds.has(event._id);
            return <button key={event._id} className={'event ' + (error ? 'event-conflict ' : '') + (event.certainty === 'reported' ? 'event-reported ' : '') + (event._id === selectedId ? 'event-selected' : '')} style={{left: (event.start - file.windowStart) / span * 100 + '%', width: (event.end - event.start) / span * 100 + '%', top: y}} onClick={() => select(event._id)} aria-pressed={event._id === selectedId} aria-label={character.name + ': ' + event.title + ', ' + place.name + ', ' + clock(event.start) + ' to ' + clock(event.end) + ', ' + event.certainty}>
              <span>{place.name}</span>
            </button>;
          })}
        </div>
      </div>)}
      <div className="timeline-key"><span><i className="key-event"/>Established event</span><span><i className="key-conflict"/>Continuity conflict</span><span><i className="key-reported"/>Reported account</span></div>
    </div>
  </div>;
}
