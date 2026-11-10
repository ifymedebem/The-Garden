# The-Garden

A library for the curious.

A responsive web app based on the Library Explorer PRD: walk a warm library aisle, enter one of six shelves, read a finite collection of sourced ideas, and keep private notes.

## Run locally

Requires Node.js 24 and Python 3. The app itself has no runtime dependencies.

```sh
npm ci
npm run check
npm start
```

Open http://localhost:3000. Serve over HTTP; opening `index.html` as a file cannot fetch the content snapshot.

## Included

- A real-time, first-person garden library rendered with Canvas 2D perspective geometry: continuous movement, turning, shelf boundaries, position tracking, clickable shelves, automatic walking to destinations, and an expanded room view. No WebGL or external game engine is needed.
- A reference-inspired palette of cloud peach, water blue, pond green, ivory, terracotta, and gold throughout the app.
- Six topic shelves, an accessible list view, search, and random discovery. An open-air garden replaces the indoor room: a winding central bookcase, retained vertical shelves on both sides, grass, stepping stones, flowers, trees, trailing plants, warm hanging bulbs, and a garden bench. Butterflies and foliage animate in world space; reduced motion freezes ambient animation.
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

## Garden, navigation, and sound

The sidebar starts hidden. Its full-size logo scrolls with the header; opening the sidebar hides that header logo to avoid duplicate branding. A small, invisible corner shortcut remains available while scrolling. Hover over the top-left Garden icon or click it to reveal navigation; close with Escape, the close button, the icon, or a click outside. Touch users tap the icon. Hidden navigation is inert and not keyboard focusable. The central winding bookcase has collision boundaries; automatic walking routes around it.

Use the explicit **Garden sounds On/Off** switch beside the volume slider to enable locally synthesised flowing water and intermittent birdsong. Audio is off by default, never autoplays, and stops when you leave the garden. No microphone, external audio files, or sound-service requests are used.

## Local day and night lighting

The optional **Local day/night** switch follows the visitor’s device clock. Daylight runs from 07:00 to 18:00, golden-hour lighting from 06:00 to 07:00 and 18:00 to 20:00, and evening lighting overnight. Manual Daylight and Evening presets let visitors preview either atmosphere at any time. Switching the feature off restores daylight. The preference is saved in the browser and checked each minute while enabled; nighttime darkens scene colours and adds stronger warm lamp halos. This is a local-time visual effect, not live weather or location-based sunrise/sunset data, and requires no API key or location permission.

## Moving through the library

Click or tap the room to focus it. Use **W / S** or **up / down arrows** to move forward/back, **A / D** to step sideways, and **left / right arrows** or **Q / E** to turn. Drag horizontally to look around. Mobile has press-and-hold movement and turn controls. Hover or keyboard-focus a shelf to reveal one section preview at a time; clicking the shelf opens its reading feed. On touch screens, the first tap reveals the preview and its Explore button (a second tap also opens the feed). Press **Enter** when a shelf is nearby to read it. The default garden no longer includes the card grid; choose **Shelf view** or search for a responsive card list. Read and note counts use singular wording when the count is one.

“Take me to” and “Surprise me” walk the camera through the room; manual movement stops automatic walking. The map follows your real position. Expand the room with the top-right button; Escape closes it. Your position is retained while entering and leaving reading feeds during a visit. Reduced-motion preferences disable automatic camera travel; Shelf view remains available, and browsers without Canvas get direct shelf buttons.

## Source policy and remaining production work

The current allowlist and shelf definitions live in `scripts/ingest.mjs`. Wikipedia text is CC BY-SA 4.0, attributed to Wikipedia contributors with original article links. Images retain their respective original licences. Guardian material is a headline and short RSS excerpt with a full-story link; confirm feed reuse terms before wider launch. The interactive room is generated geometry; it does not rely on the earlier library photograph. FRED observations preserve original numbers and dates; they are historical, not live quotes or financial advice.

Before calling this a production MVP: confirm the approved-source list and reuse terms; enable durable server-side ingestion, retention and freshness policies; replace the unavailable FRED endpoint or connect an authorised provider; add automatic production delivery, monitoring and privacy-preserving metrics; and conduct the PRD's user testing. Optional account sync is intentionally outside this prototype.

## Deployment

`dist/` is a portable static site. `.openai/hosting.json` identifies its Sites deployment. No secrets or API keys are required or committed. GitHub source visibility is independent of the hosted app's visitor access. The frontend's fonts are served by Google Fonts; remote thumbnails come from the attributed providers.

## Tests

`npm run check` runs JavaScript syntax checks, source-policy tests, and DOM interaction tests. These verify world movement and turning, wall boundaries, destination navigation, near-plane clipping, canvas drawing commands, mini-map updates, expanded/reset controls, shelf navigation, list mode, saved-card persistence, safe note rendering, note editing/deletion, and snapshot failure handling. DOM tests do not replace real-browser visual QA.
