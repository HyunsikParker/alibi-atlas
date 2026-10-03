export type Character = {_id: string; name: string; occupation: string};
export type Place = {_id: string; name: string; x: number; y: number};
export type Journey = {_id: string; fromId: string; toId: string; minutes: number};
export type Certainty = 'established' | 'reported';
export type StoryEvent = {
  _id: string; title: string; characterId: string; placeId: string;
  start: number; end: number; certainty: Certainty; source: string;
};
export type CaseFile = {
  _id: string; _rev?: string; title: string; description: string;
  windowStart: number; windowEnd: number; characters: Character[];
  places: Place[]; journeys: Journey[]; events: StoryEvent[];
};
export type Finding = {
  id: string; kind: 'overlap' | 'travel' | 'unmapped' | 'reported';
  severity: 'conflict' | 'review'; characterId: string;
  eventIds: string[]; title: string; explanation: string;
  gap?: number; required?: number;
};
export type SourceInfo = {
  kind: 'sanity' | 'local'; projectId?: string; dataset?: string;
  fetchedAt: string; revision?: string;
};
export type CaseResponse = {caseFile: CaseFile; source: SourceInfo};
export type EventPatch = Partial<Pick<StoryEvent, 'title' | 'placeId' | 'start' | 'end' | 'certainty' | 'source'>>;
export function clock(minute: number): string {
  const hour = Math.floor(minute / 60);
  const min = minute % 60;
  return String(hour).padStart(2, '0') + ':' + String(min).padStart(2, '0');
}
export function parseClock(value: string): number | null {
  if (!/^\d{2}:\d{2}$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}
export function patchEvent(file: CaseFile, id: string, patch: EventPatch): CaseFile {
  return {...file, events: file.events.map(event => event._id === id ? {...event, ...patch} : event)};
}
