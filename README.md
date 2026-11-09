# The Garden

A library for the curious. A responsive web app based on the Library Explorer PRD: walk a warm library aisle, enter one of six shelves, read a finite collection of sourced ideas, and keep private notes.

## Run locally

Requires Node.js 24 and Python 3. The app itself has no runtime dependencies.

```sh
npm ci
npm run check
npm start
```

Open http://localhost:3000. Serve over HTTP; opening `index.html` as a file cannot fetch the content snapshot.

## Included

- Three scroll/drag-driven aisle positions, six clickable topic shelves, a mini-map, list view, search, and random discovery.
- African History, Geopolitics, Economics for Beginners, World News, Finance & Investment, and Wars & Famines.
- Source-attributed cards, original links, retrieval dates, full source excerpts, likes, saves, sharing, and finite-feed endings.
- Browser-local private notes with editing, deletion, search, grouping, and Markdown export. No account required. Notes are **device-local, not encrypted storage**; clearing site data deletes them.
- Keyboard focus, semantic navigation, small-screen layout, reduced-motion preference, and retry/empty states.
- Actual Wikipedia REST extracts and Guardian RSS excerpts collected at build time. FRED ingestion is implemented but its endpoint was unavailable during initial collection; finance displays sourced educational concepts instead of fabricated market figures.
- Allowlisted HTTPS sources, exact excerpt matching, bounded summaries, failed-source omission, and validation tests.

## Refresh content

```sh
npm run ingest
npm run check
```

In a managed environment using proxy variables, run ingestion with `NODE_USE_ENV_PROXY=1` on Node 24. The browser checks for a newly published `content.json` every five minutes and preserves the current feed position when a snapshot changes.

The GitHub Actions workflow refreshes the source snapshot every six hours and on manual dispatch. **It commits to GitHub but does not automatically republish the separately hosted Sites app.** Redeploy the updated source to update that app. Continuous live delivery requires a server-side cache and scheduled deployment/ingestion integration; the interface labels data as snapshots instead of claiming real-time freshness. This initial release is a working prototype, not the full production ingestion service described by the PRD.

## Source policy and remaining production work

The current allowlist and shelf definitions live in `scripts/ingest.mjs`. Wikipedia text is CC BY-SA 4.0, attributed to Wikipedia contributors with original article links. Images retain their respective original licences. Guardian material is a headline and short RSS excerpt with a full-story link; confirm feed reuse terms before wider launch. Library photograph: https://images.unsplash.com/photo-1507842217343-583bb7270b66 (asset served locally). FRED observations preserve original numbers and dates; they are historical, not live quotes or financial advice.

Before calling this a production MVP: confirm the approved-source list and reuse terms; enable durable server-side ingestion, retention and freshness policies; replace the unavailable FRED endpoint or connect an authorised provider; add automatic production delivery, monitoring and privacy-preserving metrics; and conduct the PRD's user testing. Optional account sync is intentionally outside this prototype.

## Deployment

`dist/` is a portable static site. `.openai/hosting.json` identifies its private Sites deployment. No secrets or API keys are required or committed. GitHub source visibility is independent of the hosted app's visitor access. The frontend's fonts are served by Google Fonts; remote thumbnails come from the attributed providers.

## Tests

`npm run check` runs JavaScript syntax checks, source-policy tests, and DOM interaction tests. These verify shelf navigation, list mode, saved-card persistence, safe note rendering, note editing/deletion, and snapshot failure handling. DOM tests do not replace real-browser visual QA.
