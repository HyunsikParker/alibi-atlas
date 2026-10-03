import {clock} from './model.ts';
import type {CaseFile, Finding, StoryEvent} from './model.ts';

export function journeyMinutes(file: CaseFile, from: string, to: string): number | null {
  if (from === to) return 0;
  const remaining = new Set(file.places.map(place => place._id));
  if (!remaining.has(from) || !remaining.has(to)) return null;
  const distance = new Map<string, number>([[from, 0]]);
  while (remaining.size) {
    let nearest: string | undefined;
    let cost = Infinity;
    for (const id of remaining) {
      if ((distance.get(id) ?? Infinity) < cost) {nearest = id; cost = distance.get(id)!;}
    }
    if (nearest === undefined) break;
    if (nearest === to) return cost;
    remaining.delete(nearest);
    for (const route of file.journeys) {
      const next = route.fromId === nearest ? route.toId : route.toId === nearest ? route.fromId : undefined;
      if (next && remaining.has(next)) distance.set(next, Math.min(distance.get(next) ?? Infinity, cost + route.minutes));
    }
  }
  return null;
}

export function analyze(file: CaseFile): Finding[] {
  const findings: Finding[] = [];
  const placeName = (id: string) => file.places.find(place => place._id === id)?.name ?? 'Unknown place';
  for (const character of file.characters) {
    const all = file.events.filter(event => event.characterId === character._id);
    const established = all.filter(event => event.certainty === 'established').sort((a, b) => a.start - b.start || a.end - b.end || a._id.localeCompare(b._id));
    for (const event of all.filter(event => event.certainty === 'reported')) {
      findings.push({id: 'reported:' + event._id, kind: 'reported', severity: 'review', characterId: character._id, eventIds: [event._id], title: character.name + '’s account needs a decision', explanation: 'This is a character’s statement, not an established event. Keep it as dialogue, or establish it in the story before testing it as a physical fact.'});
    }
    // Test every pair: a long scene may overlap more than its immediate neighbor.
    for (let i = 0; i < established.length; i++) {
      for (let j = i + 1; j < established.length; j++) {
        const a = established[i], b = established[j];
        if (a.placeId === b.placeId) continue;
        if (Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
          findings.push({id: 'overlap:' + a._id + ':' + b._id, kind: 'overlap', severity: 'conflict', characterId: character._id, eventIds: [a._id, b._id], title: character.name + ' is in two places', explanation: placeName(a.placeId) + ' and ' + placeName(b.placeId) + ' overlap between ' + clock(Math.max(a.start, b.start)) + ' and ' + clock(Math.min(a.end, b.end)) + '.'});
        }
      }
    }
    // A route constraint matters for consecutive established appearances.
    for (let i = 1; i < established.length; i++) {
      const a: StoryEvent = established[i - 1], b: StoryEvent = established[i];
      if (a.end > b.start || a.placeId === b.placeId) continue;
      const required = journeyMinutes(file, a.placeId, b.placeId);
      const gap = b.start - a.end;
      if (required === null) findings.push({id: 'unmapped:' + a._id + ':' + b._id, kind: 'unmapped', severity: 'review', characterId: character._id, eventIds: [a._id, b._id], title: 'No route is defined for ' + character.name, explanation: 'There is no authored route between ' + placeName(a.placeId) + ' and ' + placeName(b.placeId) + '. The journey is unknown, not proven impossible.'});
      else if (gap < required) findings.push({id: 'travel:' + a._id + ':' + b._id, kind: 'travel', severity: 'conflict', characterId: character._id, eventIds: [a._id, b._id], gap, required, title: character.name + ' cannot make that journey', explanation: 'There are ' + gap + ' minutes between ' + placeName(a.placeId) + ' and ' + placeName(b.placeId) + '. The shortest authored route takes ' + required + ' minutes.'});
    }
  }
  return findings.sort((a, b) => Number(a.severity === 'review') - Number(b.severity === 'review') || a.id.localeCompare(b.id));
}
