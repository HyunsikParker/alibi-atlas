import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {schemaTypes} from './sanity/schemaTypes.ts';
import {structure} from './sanity/structure.ts';
import {starterDocuments, starterValue} from './sanity/starterDocuments.ts';
import {StarterTool} from './sanity/StarterTool.tsx';
export default defineConfig({
  name: 'alibi-atlas', title: 'Alibi Atlas',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '0k0a3q37',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool({structure})],
  tools: previous => [...previous, {name: 'starter', title: 'Starter case', component: StarterTool}],
  schema: {types: schemaTypes, templates: previous => [...previous, ...starterDocuments.map(document => ({id: 'atlas-starter-' + document._id, title: 'Starter: ' + document._id, schemaType: document._type, value: starterValue(document._id)}))]},
});
