# Build notes

Alibi Atlas was built in Codex on October 3, 2026. This is a record of the AI-assisted implementation, not a claim of hand-written code or a verbatim prompt transcript.

## Working brief, paraphrased

Build a fiction-continuity workbench backed by real Sanity content. Model characters, places, journeys and events as linked documents. Keep a character's reported account separate from an established scene. Let a reader try a correction without writing to the author's dataset. Use authored constraints, not guessed distances or an AI verdict.

That separation determines the interface: physical conflicts on the left, a timeline and place graph in the middle, and a selected-event editor. A portable JSON report contains the preview and its findings.

## Where the first attempts failed

- An initial-value resolver tried to read `context.documentId`. TypeScript rejected that API. Fixed document IDs and explicit initial-value templates replaced it. The starter tool then created the linked documents through the authenticated Studio client and read them back.
- The first architecture placed Studio inside the Next.js app. It was separated so the reader could be a static export while authoring kept its authenticated Sanity session.
- The initial all-clear wording said the timeline fit even when routes could be missing. It now limits the claim to detected constraints and keeps unknown journeys as review items.
- Browser testing exposed a stale validation message after reset. Reset now starts a fresh event-editor instance without remounting it on every input change.

## Verification boundaries

The domain tests and static build passed locally. The initial cloud readback found 18 published documents, two physical conflicts and one reported account. Native browser input verified both corrections, reported-versus-established handling, invalid-time rejection and reset. A 390px layout check measured no page-wide overflow; the timeline intentionally scrolls inside its own container.

The browser automation changed time-input DOM values without updating React until native key input was used. That was recorded as a test-input issue. A later local static-preview request also returned `net::ERR_CONNECTION_RESET`; it was recorded separately from application and Sanity failures.

The download observer did not confirm a saved file, so the interface says an export was requested, not that a download completed. A copyable JSON path was added. No download-completion claim is made from a button click alone.
