# Project State

Last updated: 2026-05-03, after the v1 product-surface cleanup.

## Current State

FITFO is a private, GPL-2.0-or-later CLI tool.

It can:

- scan a domain from the terminal
- generate a `fitfo brief` first-call prep scaffold from scan signals
- generate a `fitfo brief --deep` site intelligence report from sitemap/robots/pages
- generate optional Firecrawl-backed market research with `fitfo brief --search`
- generate a kickoff research brief with observed site facts, search-backed market signals, inferred page/positioning opportunities, and first-call agenda prompts
- compare recent Internet Archive/Wayback homepage captures for title, H1, meta, lead-capture, phone, CTA, tracking, and robots/noindex changes
- generate keyword clusters, keyword evidence, URL/redirect inventory, lead capture inventory, tracking/tool footprint, competitor/review/directory classification, top local competitor prompts, keyword-to-page maps, service/location recommendations, proof-asset requests, content inventory, competitor-informed structure, reputation summaries, confirmation scripts, and prioritized action items
- generate a Citation / NAP baseline in brief/plan/onboard reports, including canonical NAP candidates, directory/profile rows, mismatch risk, and cleanup actions
- use either `FIRECRAWL_API_KEY` or an authenticated local Firecrawl CLI for market research
- generate a `fitfo plan` client build plan from scan, crawl, and research signals
- treat redesign planning as a current-state to future-state architecture problem, starting with redirect/canonical checks and growing toward URL/subdomain/page handling decisions
- keep vertical intelligence parked internally until the core onboarding/brief/plan workflow is more polished
- run `fitfo onboard` as a one-command full-intake preset that deep-scans, searches, and saves a Markdown action-plan note
- prompt for missing `fitfo onboard` location and vault/folder details when running interactively
- render a styled onboarding report
- render plain output for copying/saving
- output JSON
- output Markdown
- optionally export kickoff action/research tables, infrastructure snapshots, login checklists, unknown blockers, call-one workflow, hosting evidence, Wayback evidence, and top local competitors to CSV files plus a combined JSON bundle with `--export-tables`
- save Markdown notes with frontmatter, tags, checklists, and client-call questions
- save stable Markdown notes into an Obsidian vault/folder with `--vault` or `FITFO_OBSIDIAN_DIR`
- prompt to save findings after normal interactive terminal scans, defaulting to Desktop Markdown with vault/folder and custom path choices
- save safe CLI defaults with `fitfo config`
- save reports when explicitly requested
- run a guided wizard from plain `fitfo` for scan, handoff, kickoff brief, or build plan presets
- print the current version
- run a local `doctor` environment check
- run fast dependency-free tests with `npm test`
- run fixture coverage for common registrar, DNS, hosting, hosted-builder, email, and CRM/service-business patterns
- document fixture-driven provider improvements in [Provider fixtures](PROVIDER_FIXTURES.md)
- run GitHub Actions checks on `master` and pull requests
- document release readiness in [Release notes](RELEASE.md)
- infer registrar, DNS, hosting, Cloudflare/CDN, CMS, email, analytics, and common subdomain clues
- infer likely registrar from strong nameserver patterns when RDAP does not expose the registrar, while requiring manual confirmation
- export a client handoff summary that states public findings, confidence, and what the client needs to provide or confirm
- generate unknown-blocker and call-one workflow sections using Found / Need / Risk / Ask / Owner / Audience
- generate direct "go get these logins" and "do not touch until confirmed" sections
- generate specific previous-developer request items based on what the scan found
- analyze email safety from MX, SPF, DMARC, DMARC policy, and sender-platform clues before DNS cutover
- inspect TLS certificate metadata and HTTP/HTTPS redirect behavior
- inspect apex vs `www` URL structure and recommend the likely primary launch host
- inspect page metadata, headings, CTAs, forms, phone/email signals, schema types, and suggested site structure when deep mode is enabled
- detect common CRM, booking, and field-service platform clues
- generate a practical access checklist
- generate a handoff packet for found facts, needed access, previous-developer asks, and pre-launch verification
- generate a dev pre-launch checklist
- generate a starter previous-developer request

Report organization is documented in [Report flow](REPORT_FLOW.md).

## Current Branch

Default branch:

```text
master
```

## Current Repository Posture

- Private GitHub repository first.
- Intended to become open source later.
- GPL-2.0-or-later license from the beginning.
- No client reports or scan outputs should be committed.
- Generated report folders are ignored.

## What Belongs In Core

Core should focus on fast onboarding discovery:

- domain records
- DNS records, SOA, reverse DNS/PTR, and public ASN/network-owner clues
- hosting/CMS/email clues with public hosting evidence
- email safety and DNS cutover risk
- apex vs `www` launch URL guidance
- architectural state mapping for current URLs, redirects, subdomains, canonical host, keep/rework/deprecate/redirect decisions, and launch/post-launch handling
- unresolved-domain checks for typos, unregistered domains, or dead DNS
- common passive subdomain checks
- analytics/tag clues
- CRM, booking, call tracking, and field-service clues
- light site intelligence for first-call prep
- optional market/search research when Firecrawl is configured by env key or CLI login
- optional Wayback evidence for recent site-change checks
- unknown blockers and call-one workflow rows that can become tasks
- kickoff research sections that clearly label observed facts, research signals, inferred hypotheses, and client-confirmation prompts
- keyword and competitor intelligence that remains deterministic and client-call oriented
- citation / NAP baseline checks for name, address/service-area, phone, directory/profile consistency, and cleanup queues
- proof-asset and content-inventory output for kickoff planning
- service/location page recommendations for kickoff and build planning
- competitor-informed structure, review/reputation summary, and kickoff confirmation-script output
- plan-mode launch checklist output
- optional table sidecar exports for worksheet and client planning workflows
- access checklist
- previous developer/client handoff questions

## What Probably Does Not Belong In Core

These may become separate commands or modules:

- richer multi-page crawling
- deeper keyword research
- competitor comparison matrices
- positioning strategy drafts
- crawling many pages
- aggressive subdomain enumeration
- vulnerability scanning
- credential testing

## Next Sensible Commit Candidates

- Polish the `onboard`, `brief`, and `plan` Markdown report hierarchy now that those are the core v1 workflows.
- Run more real client-domain passes and add fixtures for any missed registrar, DNS, hosting, CRM, or email patterns.
- Validate the call-one workflow table against real client reports and tune owner/audience labels where they feel awkward.
- Refine Markdown templates after more real scans, especially saved onboard notes.
- Improve service/location sitemap heuristics after testing more real client sites.
- Refine keyword clustering and competitor classification with more Firecrawl result sets.
- Add more provider fixtures for messy GoDaddy, SiteGround, WP Engine, Cloudflare, Hostinger, Namecheap, ServiceTitan, Housecall Pro, Jobber, CallRail, and Google Workspace combinations.
- Keep tightening the default terminal report so the CLI feels polished while staying copy/paste friendly.

## Morning Pickup

Recommended next session:

1. Pull latest `master` and confirm `fitfo doctor`, `npm test`, and `npm run check` pass.
2. Run 3-5 real domains through:

   ```bash
   fitfo clientdomain.com
   fitfo brief clientdomain.com --deep --search --wayback --location "City, ST"
   fitfo plan clientdomain.com --deep --search --wayback --location "City, ST"
   fitfo onboard clientdomain.com
   ```

3. Review whether Unknowns Blocking Work and Call One Workflow answer the call-one question cleanly.
4. Save one report to Desktop and one to the Obsidian vault to confirm the save prompts feel obvious.
5. Turn any missed provider or CRM detection into a focused fixture in `test/fixtures/provider-patterns.js`.
6. Pick one UX polish task for the opening screen or save flow and commit it separately.
