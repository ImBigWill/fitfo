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
    -> client handoff summary
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
      -> review/reputation summary
      -> competitor-informed structure
      -> service/location recommendations
      -> keyword-to-page map
      -> kickoff confirmation script
      -> optional CSV/JSON table exports
    -> research queue
    -> opportunities to inspect
    -> client questions
  -> plan report
    -> evidence labels
    -> focus priorities
    -> recommended structure
    -> service/location recommendations
    -> build workstreams
    -> launch checklist
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

Markdown and Obsidian brief/plan exports lead with infrastructure snapshot and login checklist tables so the client call starts with registrar, DNS, Cloudflare, hosting, CMS, email, and access ownership. They also include raw evidence tables for URL/redirect inventory, lead capture inventory, tracking/tool footprint, keyword evidence, action report, proof assets, content inventory, keyword clusters, top local competitors, competitor research, reputation summary, competitor-informed structure, service/location recommendations, confirmation script, and keyword-to-page map so they can be scanned quickly or moved into a client workspace.

## Evidence Labels

FITFO should make the source of each recommendation obvious:

- **Observed**: found in DNS, HTTP, sitemap/page crawl, headers, visible markup, or other public site signals.
- **Research**: found through Firecrawl-backed web/search results.
- **Inferred**: a reasonable planning hypothesis from public signals that still needs validation.
- **Ask Client**: something FITFO should not pretend to know; confirm with the client or previous developer.

Action-plan items and kickoff research sections should use these labels consistently so the first call separates facts from assumptions.

## Client Handoff Summary

The scan report should answer the client handoff question before it dives into raw records:

- where the domain/registrar appears to live
- who appears to control DNS/nameservers
- where hosting or the origin may live
- what CMS/admin access is needed
- what email records exist and what must be preserved
- which analytics, CRM, booking, marketing, or DNS services were found
- which subdomains may represent hidden tools or staging sites

Each row should state the public signal, confidence level, and what the client needs to provide or confirm. If FITFO only inferred a provider from nameservers, the report should say so and require manual confirmation.

`--export-tables <dir>` writes those same planning tables as CSV sidecars plus a combined JSON bundle. This is intentionally a sidecar export so the terminal report, Obsidian note, and spreadsheet workflow do not compete with each other.

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
