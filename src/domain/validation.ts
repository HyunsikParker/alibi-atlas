import type {CaseFile} from './model.ts';
export function validateCase(value: unknown): CaseFile {
  if (!value || typeof value !== 'object') throw new Error('Case data is missing.');
  const file = value as CaseFile;
  if (typeof file._id !== 'string' || typeof file.title !== 'string' || typeof file.description !== 'string') throw new Error('Case metadata is incomplete.');
  if (!Number.isInteger(file.windowStart) || !Number.isInteger(file.windowEnd) || file.windowStart < 0 || file.windowEnd > 1440 || file.windowStart >= file.windowEnd) throw new Error('Case time window is invalid.');
  for (const field of ['characters','places','journeys','events'] as const) if (!Array.isArray(file[field])) throw new Error('Case ' + field + ' are missing.');
  const unique = (ids: string[], group: string) => {
    if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) throw new Error('Duplicate or missing ' + group + ' IDs.');
  };
  unique(file.characters.map(x => x._id), 'character');
  unique(file.places.map(x => x._id), 'place');
  unique(file.events.map(x => x._id), 'event');
  unique(file.journeys.map(x => x._id), 'journey');
  const characters = new Set(file.characters.map(x => x._id)), places = new Set(file.places.map(x => x._id));
  for (const character of file.characters) if (typeof character.name !== 'string' || typeof character.occupation !== 'string') throw new Error('Character data is incomplete.');
  for (const place of file.places) if (typeof place.name !== 'string' || !Number.isFinite(place.x) || !Number.isFinite(place.y) || place.x < 0 || place.x > 100 || place.y < 0 || place.y > 100) throw new Error('Place data is invalid.');
  for (const route of file.journeys) if (!places.has(route.fromId) || !places.has(route.toId) || !Number.isInteger(route.minutes) || route.minutes < 0 || route.minutes > 1440) throw new Error('Journey data or references are invalid.');
  for (const event of file.events) {
    if (!characters.has(event.characterId) || !places.has(event.placeId)) throw new Error('An event has a broken character or place reference.');
    if (!Number.isInteger(event.start) || !Number.isInteger(event.end) || event.start < file.windowStart || event.end > file.windowEnd || event.start >= event.end) throw new Error('An event falls outside the case time window.');
    if (!['established','reported'].includes(event.certainty) || typeof event.title !== 'string' || typeof event.source !== 'string') throw new Error('Event text or certainty is invalid.');
  }
  return file;
}
