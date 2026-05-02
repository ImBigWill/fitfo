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
    -> unknowns blocking work
    -> call-one workflow
    -> why FITFO thinks this
    -> go-get-these-logins checklist
    -> do-not-touch warnings
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
      -> citation / NAP baseline
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
    -> architectural state map
    -> citation / NAP baseline
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

Markdown and Obsidian brief/plan exports lead with infrastructure snapshot, unknown blockers, call-one workflow, confidence explanations, login checklist, and do-not-touch warning tables so the client call starts with registrar, DNS, Cloudflare, hosting, CMS, email, access ownership, owner assignment, and safety risks. They also include raw evidence tables for URL/redirect inventory, lead capture inventory, tracking/tool footprint, keyword evidence, action report, proof assets, content inventory, keyword clusters, top local competitors, competitor research, reputation summary, competitor-informed structure, service/location recommendations, confirmation script, and keyword-to-page map so they can be scanned quickly or moved into a client workspace.

## Evidence Labels

FITFO should make the source of each recommendation obvious:

- **Observed**: found in DNS, HTTP, sitemap/page crawl, headers, visible markup, or other public site signals.
- **Research**: found through Firecrawl-backed web/search results.
- **Inferred**: a reasonable planning hypothesis from public signals that still needs validation.
- **Ask Client**: something FITFO should not pretend to know; confirm with the client or previous developer.

Action-plan items and kickoff research sections should use these labels consistently so the first call separates facts from assumptions.

## Citation / NAP Baseline

The Citation / NAP baseline is part of phase-zero onboarding. It should identify the best public candidate for:

- business name
- address or service-area signal
- public phone number
- directory, review, social, and map/profile rows surfaced in research

FITFO should label this as a candidate, not truth. The client must confirm the official business name, public phone, address/service-area policy, Google Business Profile owner, and whether tracking numbers are intentionally used in citations. FITFO should generate a cleanup queue; it should not manage or modify listings.

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

## Call-One Workflow

The call-one workflow is the practical operating table for the first client call:

- **Found**: what the public scan observed or inferred.
- **Need**: the access, confirmation, or document required.
- **Risk**: what can break or block work if the item is not resolved.
- **Ask**: the exact question to ask the client or previous developer.
- **Owner**: Client, Previous Developer, Us, or a shared owner.
- **Audience**: Client-facing or Internal.

This table should be treated as the bridge between reconnaissance and project management. It is intentionally more workflow-oriented than the raw DNS/HTTP evidence.

`--export-tables <dir>` writes those same planning tables as CSV sidecars plus a combined JSON bundle. This is intentionally a sidecar export so the terminal report, Obsidian note, and spreadsheet workflow do not compete with each other.

This keeps the default scan focused on access and infrastructure while giving deeper research its own lane.

## Architectural State Map

The architectural state map is the redesign/rebuild bridge between discovery and implementation.

It should answer:

- **Current state:** what URLs, redirects, subdomains, canonical hosts, page types, forms, tracking tools, and technical dependencies exist now?
- **Architectural decision:** what should stay, be reworked, be deprecated, be redirected, or be confirmed before a build decision?
- **Redesign phase:** what content, navigation, internal links, forms, proof assets, service/location pages, and tracking requirements should be handled while building?
- **Launch / post-launch:** what redirects, host canonicalization, sitemap/Search Console work, analytics verification, form QA, and post-launch cleanup need to happen?

The current redirect matrix and URL inventory are the first inputs. Deep crawl content inventory, keyword-to-page map, service/location recommendations, subdomain findings, lead capture inventory, and tracking/tool footprint should feed the same model over time.

The report should avoid implying that FITFO knows the final future state from public data alone. It should label architectural recommendations as observed, inferred, or ask-client and keep redirect decisions tied to explicit current-state evidence.

## Future Report Modules

Likely next modules:

- `brief/seo`
- `brief/content`
- `brief/conversion`
- `brief/local`
- `brief/competitors`
- `plan/site-structure`
- `plan/architecture-state-map`
- `plan/launch-checklist`
- `exports/obsidian`

Do not add a plugin system until these report types have real use.
