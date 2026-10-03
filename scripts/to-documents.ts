import type {CaseFile} from '../src/domain/model.ts';
const ref = (id: string) => ({_type: 'reference', _ref: id, _key: id});
export function toDocuments(file: CaseFile): Array<{_id: string; _type: string; [key: string]: unknown}> {
  return [
    ...file.characters.map(character => ({...character, _type: 'character'})),
    ...file.places.map(place => ({...place, _type: 'place'})),
    ...file.journeys.map(({fromId, toId, ...journey}) => ({...journey, _type: 'journey', from: ref(fromId), to: ref(toId)})),
    ...file.events.map(({characterId, placeId, ...event}) => ({...event, _type: 'storyEvent', character: ref(characterId), place: ref(placeId)})),
    {_id: file._id, _type: 'caseFile', title: file.title, description: file.description,
      windowStart: file.windowStart, windowEnd: file.windowEnd,
      characters: file.characters.map(x => ref(x._id)), places: file.places.map(x => ref(x._id)),
      journeys: file.journeys.map(x => ref(x._id)), events: file.events.map(x => ref(x._id))},
  ];
}
