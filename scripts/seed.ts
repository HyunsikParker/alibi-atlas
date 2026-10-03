import {createClient} from '@sanity/client';
import {seed} from '../src/domain/seed.ts';
import {validateCase} from '../src/domain/validation.ts';
import {toDocuments} from './to-documents.ts';
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) {console.error('A project ID and an in-memory SANITY_API_TOKEN are required. No credentials are printed or written by this script.');process.exit(1);}
validateCase(seed);
const client = createClient({projectId, dataset, token, apiVersion: '2026-10-01', useCdn: false});
try {
  const documents = toDocuments(seed);
  let transaction = client.transaction();
  // Create missing demo documents only. Never overwrite an author’s existing edits.
  for (const document of documents) transaction = transaction.createIfNotExists(document);
  await transaction.commit();
  const count = await client.fetch<number>('count(*[_id in $ids])', {ids: documents.map(x => x._id)});
  if (count !== documents.length) throw new Error('Document readback count mismatch.');
  console.log(JSON.stringify({projectId, dataset, documentsVerified: count, expected: documents.length, overwroteExistingContent: false}));
} catch {console.error('Seeding did not verify successfully. Inspect permissions and references without exposing the token.');process.exit(1);}
