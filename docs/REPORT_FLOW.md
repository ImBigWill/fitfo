# Report Flow

FITFO should feel organized from the first domain prompt to the first client call.

## Current Flow

```text
domain input
  -> scan
    -> domain / RDAP
    -> DNS / email / subdomains
    -> HTTP / redirects / TLS / CMS / marketing tags
  -> scan report
    -> verdict
    -> plain English
    -> track-this-down checklist
    -> handoff packet
    -> raw records
    -> previous developer request
  -> brief report
    -> first-call confirmations
    -> site intelligence
    -> market research
    -> kickoff research brief
      -> current site read
      -> market snapshot
      -> keyword/page opportunities
      -> positioning hypotheses
      -> kickoff call agenda
    -> detailed action report
      -> priority actions
      -> proof assets needed
      -> content inventory
      -> keyword clusters
      -> competitor research
      -> keyword-to-page map
    -> research queue
    -> opportunities to inspect
    -> client questions
  -> plan report
    -> focus priorities
    -> recommended structure
    -> build workstreams
    -> kickoff research game plan
    -> prioritized action report
    -> keyword page map
    -> confirmation questions
```

## Report Modules

- `src/report.js` is the public report export surface.
- `src/report/scan.js` renders the technical onboarding scan in terminal text and Markdown.
- `src/brief.js` renders the first-call prep brief in terminal text and Markdown.
- `src/plan.js` renders the client build plan in terminal text and Markdown.
- `src/lib/site.js` handles local deep crawl/site intelligence extraction.
- `src/lib/research.js` handles optional Firecrawl-backed market/search research.

Markdown and Obsidian brief exports put the action report, proof assets, content inventory, keyword clusters, competitor research, and keyword-to-page map into tables so they can be scanned quickly or moved into a client workspace.

This keeps the default scan focused on access and infrastructure while giving deeper research its own lane.

## Future Report Modules

Likely next modules:

- `brief/seo`
- `brief/content`
- `brief/conversion`
- `brief/local`
- `brief/competitors`
- `plan/site-structure`
- `plan/launch-checklist`
- `exports/obsidian`

Do not add a plugin system until these report types have real use.
