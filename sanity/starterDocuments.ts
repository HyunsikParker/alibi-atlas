import {seed} from '../src/domain/seed.ts';
import {toDocuments} from '../scripts/to-documents.ts';
export const starterDocuments = toDocuments(seed);
export function starterValue(documentId: string) {
  const document = starterDocuments.find(item => item._id === documentId.replace(/^drafts\./, ''));
  if (!document) return {};
  const {_id, _type, ...fields} = document;
  return structuredClone(fields);
}
