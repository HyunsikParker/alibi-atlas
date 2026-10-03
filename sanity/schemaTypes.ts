import {defineField, defineType} from 'sanity';
const minute = (name: string, title: string) => defineField({name, title, type: 'number', validation: rule => rule.required().integer().min(0).max(1440), description: 'Minutes after midnight. For example, 18:20 is 1100.'});
const reference = (name: string, title: string, type: string) => defineField({name, title, type: 'reference', to: [{type}], validation: rule => rule.required()});
const references = (name: string, title: string, type: string) => defineField({name, title, type: 'array', of: [{type: 'reference', to: [{type}]}], validation: rule => rule.required().min(1).unique()});
export const schemaTypes = [
  defineType({name: 'character', title: 'Character', type: 'document', fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'occupation', title: 'Role in the story', type: 'string', validation: rule => rule.required()}),
  ], preview: {select: {title: 'name', subtitle: 'occupation'}}}),
  defineType({name: 'place', title: 'Place', type: 'document', fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'x', title: 'Diagram position: x', type: 'number', validation: rule => rule.required().min(0).max(100)}),
    defineField({name: 'y', title: 'Diagram position: y', type: 'number', validation: rule => rule.required().min(0).max(100)}),
  ], preview: {select: {title: 'name'}}}),
  defineType({name: 'journey', title: 'Journey', type: 'document', fields: [
    reference('from', 'From', 'place'), reference('to', 'To', 'place'),
    defineField({name: 'minutes', title: 'Minimum travel time', type: 'number', validation: rule => rule.required().integer().min(0).max(1440), description: 'An authored constraint, in minutes. This route works in both directions.'}),
  ], preview: {select: {from: 'from.name', to: 'to.name', minutes: 'minutes'}, prepare: ({from, to, minutes}) => ({title: from + ' ↔ ' + to, subtitle: String(minutes) + ' minutes'})}}),
  defineType({name: 'storyEvent', title: 'Story event', type: 'document', fields: [
    defineField({name: 'title', title: 'What happens', type: 'string', validation: rule => rule.required()}),
    reference('character', 'Character', 'character'), reference('place', 'Place', 'place'),
    minute('start', 'Starts'), minute('end', 'Ends'),
    defineField({name: 'certainty', title: 'What is established?', type: 'string', options: {list: [{title: 'This happens in the story', value: 'established'}, {title: 'A character says it happened', value: 'reported'}], layout: 'radio'}, validation: rule => rule.required()}),
    defineField({name: 'source', title: 'Author’s source note', type: 'text', rows: 3, validation: rule => rule.required(), description: 'Record the scene note or dialogue. A reported account does not become a physical fact automatically.'}),
  ], validation: rule => rule.custom((event) => !event || typeof event.start !== 'number' || typeof event.end !== 'number' || event.start < event.end ? true : 'The event must start before it ends.'), preview: {select: {title: 'title', name: 'character.name', certainty: 'certainty'}, prepare: ({title, name, certainty}) => ({title, subtitle: name + ' · ' + certainty})}}),
  defineType({name: 'caseFile', title: 'Case', type: 'document', fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'description', title: 'Story premise', type: 'text', rows: 3, validation: rule => rule.required()}),
    minute('windowStart', 'Timeline starts'), minute('windowEnd', 'Timeline ends'),
    references('characters', 'Characters', 'character'), references('places', 'Places', 'place'),
    references('journeys', 'Journeys', 'journey'), references('events', 'Events', 'storyEvent'),
  ], validation: rule => rule.custom(file => !file || typeof file.windowStart !== 'number' || typeof file.windowEnd !== 'number' || file.windowStart < file.windowEnd ? true : 'The timeline must start before it ends.'), preview: {select: {title: 'title', subtitle: 'description'}}}),
];
