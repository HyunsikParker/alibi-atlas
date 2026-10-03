import type {StructureResolver} from 'sanity/structure';
import {starterDocuments} from './starterDocuments.ts';
export const structure: StructureResolver = S => S.list().title('Alibi Atlas').items([
  S.listItem().title('The missing lantern').child(S.editor().schemaType('caseFile').documentId('atlas-case-lantern')),
  ...S.documentTypeListItems(),
  S.divider(),
  S.listItem().title('Set up the starter case').child(S.list().title('Starter documents').items(
    starterDocuments.map(document => S.listItem().id(document._id).title(
      String(document.name || document.title || (document._type === 'journey' ? document._id.replace('atlas-journey-', '').replaceAll('-', ' ') : document._id))
    ).child(S.editor().schemaType(document._type).documentId(document._id).initialValueTemplate('atlas-starter-' + document._id)))
  )),
]);
