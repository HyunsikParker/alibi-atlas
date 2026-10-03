# Alibi Atlas

A continuity workbench for fiction. Check whether a character can be where a scene puts them, without treating their dialogue as established fact.

[Demo](https://hyunsikparker.github.io/alibi-atlas/) · [Build notes](docs/build-notes.md) · MIT

## Try the case

The missing lantern has three characters, four places and six events. Two continuity errors are planted in the published story.

1. Mira is at the archive until 18:25, but her dock scene starts at 18:20. Select **Checks the departing boat**, change its time to **18:34–18:44**, and apply it to the preview.
2. Theo has four minutes to make a ten-minute journey. Select **Delivers to the keeper** and try **18:30–18:38**.
3. Jules’s dock visit is a reported account. Changing it to **This happens in the story** introduces a new overlap with the tower scene.

Preview changes stay in the browser. **Reset preview** restores the loaded story; **Copy report JSON** and **Export preview report** carry the case, changed events, findings and source metadata. Refreshing reads the published Sanity content again.

## Run locally

Use Node.js 22.12 or later.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:5278`. The example configuration reads the project's public Sanity dataset without a token. If the project ID is unset, the app clearly labels its local fixture. A failed connected query shows an error instead of silently switching to that fixture.

To serve the static build, with Python 3 installed:

```sh
npm run build
npm start
```

GitHub Pages builds use `NEXT_PUBLIC_BASE_PATH=/alibi-atlas`. The public viewer does not embed the authoring Studio or a write credential.

## Author with Sanity

```sh
npm run studio:dev
```

The standalone Studio runs at `http://localhost:3338`. Sign in with an account that has access to the configured project. The public demo is read-only; running Studio does not give a visitor permission to edit its dataset.

For your own case, create a dedicated public Sanity project containing fictional demonstration content. Set its ID and dataset in both `NEXT_PUBLIC_SANITY_*` and `SANITY_STUDIO_*` variables. Add your reader origin without credentials and your local Studio origin with credentials. **Starter case** creates the 18 linked starter documents through the authenticated Studio client; existing documents are not overwritten. Edit and publish from **Structure**.

The frontend listens for published changes. It shows a notice without replacing an in-progress preview. The reader chooses when to refresh.

### Content model

| Document | Starter count | Purpose |
| --- | ---: | --- |
| Character | 3 | Name and role |
| Place | 4 | Name and diagram coordinates |
| Journey | 4 | Two place references and an authored minimum time |
| Story event | 6 | Character, place, interval, certainty and source note |
| Case | 1 | Timeline window and references to the other documents |

The demo uses project `0k0a3q37`, dataset `production`. GROQ dereferences the case into a validated graph. The analysis reports overlapping appearances at different places and insufficient travel gaps. It finds the shortest connected, undirected route. Missing routes remain unknown; they are review items, not proof of impossibility.

## Checks

```sh
npm test
npm run typecheck
npm run build
npm run verify:cloud
```

The 12 domain tests cover planted conflicts, corrections, nested overlaps, route choice, reported accounts, missing routes and invalid references or intervals. `verify:cloud` reads the public starter case and checks its 18 published documents.

The October 3 production-dependency audit reported no findings. The full development tree still had transitive Studio-tooling advisories; that is not an all-dependencies-clean claim.

## Limits and AI assistance

This prototype loads one case and one authored time window. It does not infer travel times, decide whether a statement is truthful, or check every kind of plot hole. There is no runtime AI call.

Codex generated and revised the code, fictional demo content and documentation. The build notes distinguish observed checks from unverified behavior. The implementation uses Next.js, React and the Sanity client and Studio; it does not use the App SDK or paid Sanity AI features.
