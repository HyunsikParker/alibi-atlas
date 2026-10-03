import {createClient} from '@sanity/client';
import {seed} from '../domain/seed.ts';
import {validateCase} from '../domain/validation.ts';
import type {CaseResponse} from '../domain/model.ts';

export const caseId = 'atlas-case-lantern';
export const caseQuery = `*[_type == "caseFile" && _id == $id][0] {
  _id, _rev, title, description, windowStart, windowEnd,
  "characters": characters[]->{_id, name, occupation},
  "places": places[]->{_id, name, x, y},
  "journeys": journeys[]->{_id, "fromId": from._ref, "toId": to._ref, minutes},
  "events": events[]->{_id, title, "characterId": character._ref, "placeId": place._ref, start, end, certainty, source}
}`;
export async function loadCase(): Promise<CaseResponse> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const fetchedAt = new Date().toISOString();
  if (!projectId) return {caseFile: structuredClone(seed), source: {kind: 'local', fetchedAt}};
  if (!/^[a-z0-9]+$/.test(projectId) || !/^[a-z0-9_-]+$/.test(dataset)) throw new Error('Sanity configuration is invalid.');
  const client = createClient({projectId, dataset, apiVersion: '2026-10-01', useCdn: false, perspective: 'published', timeout: 12000});
  const data = await client.fetch(caseQuery, {id: caseId}, {cache: 'no-store'});
  // A connected backend failure is never hidden by a local fixture.
  return {caseFile: validateCase(data), source: {kind: 'sanity', projectId, dataset, fetchedAt, revision: data._rev}};
}
