import {useState} from 'react';
import {useClient} from 'sanity';
import {starterDocuments} from './starterDocuments.ts';

export function StarterTool() {
  const client = useClient({apiVersion: '2026-10-01'});
  const [busy, setBusy] = useState(false), [status, setStatus] = useState('');
  const {projectId, dataset} = client.config();
  async function initialize() {
    setBusy(true);setStatus('');
    try {
      let transaction = client.transaction();
      for (const document of starterDocuments) transaction = transaction.createIfNotExists(document);
      await transaction.commit();
      const count = await client.fetch<number>('count(*[_id in $ids])', {ids: starterDocuments.map(document => document._id)});
      if (count !== starterDocuments.length) throw new Error('Readback mismatch');
      setStatus('Verified ' + count + ' starter documents in Content Lake. Existing documents were not overwritten. Open Structure to edit the story.');
    } catch {
      setStatus('The starter case did not verify. Check your authenticated project access and try again. No existing documents were overwritten.');
    } finally {setBusy(false);}
  }
  return <main style={{maxWidth:680,padding:40,lineHeight:1.7}}>
    <h1>Set up the starter case</h1>
    <p>The missing lantern is an original fictional story. This action creates 18 connected documents: three characters, four places, four journeys, six events and one case.</p>
    <p>They are published to this dataset. Use a dedicated public project containing only fictional demonstration content. Existing documents are left unchanged.</p>
    <p><strong>Project:</strong> {projectId} · <strong>Dataset:</strong> {dataset}</p>
    <button type="button" onClick={() => void initialize()} disabled={busy} style={{font:'inherit',padding:'10px 16px',cursor:busy?'default':'pointer'}}>{busy ? 'Creating and verifying…' : 'Create starter documents'}</button>
    {status && <p role="status">{status}</p>}
  </main>;
}
