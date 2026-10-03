import type {CaseFile} from './model.ts';
export const seed: CaseFile = {
  _id: 'atlas-case-lantern',
  title: 'The missing lantern',
  description: 'A lantern vanishes from the harbor archive at dusk. Three characters give accounts that do not quite fit. This is an original fictional case for testing a story, not investigating people.',
  windowStart: 18 * 60,
  windowEnd: 19 * 60,
  characters: [
    {_id: 'atlas-character-mira', name: 'Mira', occupation: 'Archivist'},
    {_id: 'atlas-character-theo', name: 'Theo', occupation: 'Courier'},
    {_id: 'atlas-character-jules', name: 'Jules', occupation: 'Keeper'},
  ],
  places: [
    {_id: 'atlas-place-archive', name: 'Archive', x: 18, y: 30},
    {_id: 'atlas-place-dock', name: 'North dock', x: 72, y: 25},
    {_id: 'atlas-place-arcade', name: 'Arcade', x: 25, y: 78},
    {_id: 'atlas-place-tower', name: 'Bell tower', x: 80, y: 76},
  ],
  journeys: [
    {_id: 'atlas-journey-archive-dock', fromId: 'atlas-place-archive', toId: 'atlas-place-dock', minutes: 8},
    {_id: 'atlas-journey-archive-arcade', fromId: 'atlas-place-archive', toId: 'atlas-place-arcade', minutes: 6},
    {_id: 'atlas-journey-dock-tower', fromId: 'atlas-place-dock', toId: 'atlas-place-tower', minutes: 7},
    {_id: 'atlas-journey-arcade-tower', fromId: 'atlas-place-arcade', toId: 'atlas-place-tower', minutes: 10},
  ],
  events: [
    {_id: 'atlas-event-mira-ledger', title: 'Signs the archive ledger', characterId: 'atlas-character-mira', placeId: 'atlas-place-archive', start: 1085, end: 1105, certainty: 'established', source: 'Author’s scene note: Mira stays at the desk until 18:25.'},
    {_id: 'atlas-event-mira-dock', title: 'Checks the departing boat', characterId: 'atlas-character-mira', placeId: 'atlas-place-dock', start: 1100, end: 1110, certainty: 'established', source: 'Author’s scene note: the dock check begins at 18:20.'},
    {_id: 'atlas-event-theo-package', title: 'Collects a sealed package', characterId: 'atlas-character-theo', placeId: 'atlas-place-arcade', start: 1095, end: 1100, certainty: 'established', source: 'Author’s scene note: Theo leaves the arcade at 18:20.'},
    {_id: 'atlas-event-theo-bell', title: 'Delivers to the keeper', characterId: 'atlas-character-theo', placeId: 'atlas-place-tower', start: 1104, end: 1110, certainty: 'established', source: 'Author’s scene note: delivery is at the bell tower at 18:24.'},
    {_id: 'atlas-event-jules-tower', title: 'Waits for the courier', characterId: 'atlas-character-jules', placeId: 'atlas-place-tower', start: 1080, end: 1115, certainty: 'established', source: 'Author’s scene note: Jules is at the tower throughout the first half hour.'},
    {_id: 'atlas-event-jules-account', title: 'Says they visited the dock', characterId: 'atlas-character-jules', placeId: 'atlas-place-dock', start: 1100, end: 1105, certainty: 'reported', source: 'Dialogue note: “I checked the boat at twenty past.” A character’s claim is not an established event.'},
  ],
};
