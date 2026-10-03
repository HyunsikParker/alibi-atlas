import type {CaseFile} from '../domain/model.ts';
export function Places({file}: {file: CaseFile}) {
  return <div className="places"><svg viewBox="0 0 480 215" role="img" aria-label="Authored place connections and minimum travel times">
    {file.journeys.map(route => {
      const a = file.places.find(x => x._id === route.fromId)!, b = file.places.find(x => x._id === route.toId)!;
      const ax = 35 + a.x * 4.1, ay = 10 + a.y * 1.9, bx = 35 + b.x * 4.1, by = 10 + b.y * 1.9;
      return <g key={route._id}><line x1={ax} y1={ay} x2={bx} y2={by} className="route-line"/><rect x={(ax + bx) / 2 - 20} y={(ay + by) / 2 - 11} width="40" height="22" rx="3" className="route-label-bg"/><text x={(ax + bx) / 2} y={(ay + by) / 2 + 4} textAnchor="middle" className="route-label">{route.minutes}m</text></g>;
    })}
    {file.places.map(place => {
      const x = 35 + place.x * 4.1, y = 10 + place.y * 1.9;
      return <g key={place._id}><circle cx={x} cy={y} r="5" className="place-node"/><text x={x} y={y + (place.y < 50 ? -17 : 25)} textAnchor="middle" className="place-label">{place.name}</text></g>;
    })}
  </svg><p>Travel times are authored constraints. The workbench uses the shortest connected route; an absent route stays unknown.</p></div>;
}
