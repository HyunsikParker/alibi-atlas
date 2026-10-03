import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyze, journeyMinutes} from '../src/domain/analyze.ts';
import {seed} from '../src/domain/seed.ts';
import {parseClock, patchEvent} from '../src/domain/model.ts';
import {validateCase} from '../src/domain/validation.ts';
import {toDocuments} from '../scripts/to-documents.ts';
const fresh = () => structuredClone(seed);
test('original authored case has two physical conflicts and one uncorroborated account', () => {
  const findings = analyze(seed);
  assert.deepEqual(findings.filter(x => x.severity === 'conflict').map(x => x.kind).sort(), ['overlap','travel']);
  assert.equal(findings.filter(x => x.kind === 'reported').length, 1);
});
test('a reported account does not count as an established appearance', () => {
  assert.equal(analyze(seed).filter(x => x.characterId === 'atlas-character-jules' && x.severity === 'conflict').length, 0);
  const file = patchEvent(fresh(), 'atlas-event-jules-account', {certainty: 'established'});
  assert.equal(analyze(file).filter(x => x.characterId === 'atlas-character-jules' && x.kind === 'overlap').length, 1);
});
test('the minimum travel time uses the shortest connected route, in either direction', () => {
  assert.equal(journeyMinutes(seed, 'atlas-place-archive', 'atlas-place-tower'), 15);
  assert.equal(journeyMinutes(seed, 'atlas-place-tower', 'atlas-place-archive'), 15);
  assert.equal(journeyMinutes(seed, 'atlas-place-archive', 'atlas-place-archive'), 0);
});
test('an absent route is unknown, not a proven physical conflict', () => {
  const file = fresh();file.journeys = [];
  const findings = analyze(file);
  assert.equal(findings.filter(x => x.kind === 'travel').length, 0);
  assert.equal(findings.filter(x => x.kind === 'unmapped').length, 1);
});
test('two real interval corrections remove both physical conflicts without silently deleting the account', () => {
  let file = patchEvent(fresh(), 'atlas-event-mira-dock', {start: 1114, end: 1124});
  file = patchEvent(file, 'atlas-event-theo-bell', {start: 1110, end: 1118});
  validateCase(file);
  assert.equal(analyze(file).filter(x => x.severity === 'conflict').length, 0);
  assert.equal(analyze(file).filter(x => x.kind === 'reported').length, 1);
  assert.equal(seed.events[1].start, 1100);
});
test('arriving exactly at the authored minimum is allowed; one minute early is not', () => {
  const repaired = patchEvent(fresh(), 'atlas-event-theo-bell', {start: 1110, end: 1118});
  assert.equal(analyze(repaired).filter(x => x.kind === 'travel').length, 0);
  const early = patchEvent(repaired, 'atlas-event-theo-bell', {start: 1109});
  assert.equal(analyze(early).filter(x => x.kind === 'travel').length, 1);
});
test('overlap checking includes nonadjacent appearances', () => {
  const file = fresh();file.events = [
    {...seed.events[0], _id: 'long', start: 1080, end: 1130},
    {...seed.events[0], _id: 'inside', start: 1090, end: 1100},
    {...seed.events[1], _id: 'later', start: 1105, end: 1115},
  ];
  assert.equal(analyze(file).filter(x => x.kind === 'overlap').length, 1);
});
test('simultaneous established events at the same place do not create a two-place conflict', () => {
  const file = fresh();file.events = [seed.events[0], {...seed.events[0], _id: 'second'}];
  assert.equal(analyze(file).length, 0);
});
test('a broken referenced place is rejected instead of disappearing from the graph', () => {
  const file = fresh();file.events[0].placeId = 'missing';
  assert.throws(() => validateCase(file), /broken/);
});
test('invalid times, duplicate identifiers and negative routes are rejected', () => {
  const reversed = fresh();reversed.events[0].end = reversed.events[0].start;assert.throws(() => validateCase(reversed), /time window/);
  const duplicate = fresh();duplicate.events.push({...duplicate.events[0]});assert.throws(() => validateCase(duplicate), /Duplicate/);
  const negative = fresh();negative.journeys[0].minutes = -1;assert.throws(() => validateCase(negative), /Journey/);
  const nullRefs = fresh();(nullRefs.places as unknown[])[0] = null;assert.throws(() => validateCase(nullRefs));
});
test('time input is strict, including midnight and 23:59', () => {
  assert.equal(parseClock('00:00'), 0);assert.equal(parseClock('23:59'), 1439);assert.equal(parseClock('24:00'), null);
  assert.equal(parseClock('18:60'), null);assert.equal(parseClock('6:30'), null);
});
test('Sanity payload is a connected graph of 18 original documents with valid strong references', () => {
  const docs = toDocuments(seed);assert.equal(docs.length, 18);
  const ids = new Set(docs.map(x => x._id));assert.equal(ids.size, docs.length);
  function walk(v: unknown) {if (Array.isArray(v)) v.forEach(walk);else if (v && typeof v === 'object') {const item = v as Record<string, unknown>;if (item._type === 'reference') assert.ok(ids.has(item._ref as string));Object.values(item).forEach(walk);}}
  docs.forEach(walk);
});
