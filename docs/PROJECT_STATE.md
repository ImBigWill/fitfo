# Project State

Last updated after the first deep-brief and planning pass.

## Current State

FITFO is a private, GPL-2.0-or-later CLI tool.

It can:

- scan a domain from the terminal
- generate a `fitfo brief` first-call prep scaffold from scan signals
- generate a `fitfo brief --deep` site intelligence report from sitemap/robots/pages
- generate optional Firecrawl-backed market research with `fitfo brief --search`
- generate a kickoff research brief with observed site facts, search-backed market signals, inferred page/positioning opportunities, and first-call agenda prompts
- generate keyword clusters, competitor/review/directory classification, keyword-to-page maps, proof-asset requests, content inventory, and prioritized action items
- use either `FIRECRAWL_API_KEY` or an authenticated local Firecrawl CLI for market research
- generate a `fitfo plan` client build plan from scan, crawl, and research signals
- render a styled onboarding report
- render plain output for copying/saving
- output JSON
- output Markdown
- export kickoff action/research tables to CSV files plus a combined JSON bundle with `--export-tables`
- save Obsidian-ready Markdown notes with frontmatter, tags, checklists, and client-call questions
- save stable Obsidian vault notes with `--vault` or `FITFO_OBSIDIAN_DIR`
- prompt to save findings after normal interactive terminal scans, defaulting to Desktop Markdown with Obsidian vault/folder and custom path choices
- save safe CLI defaults with `fitfo config`
- save reports when explicitly requested
- run a guided wizard from plain `fitfo` for scan, handoff, kickoff brief, or build plan presets
- print the current version
- run a local `doctor` environment check
- run fast dependency-free tests with `npm test`
- run fixture coverage for common registrar, DNS, hosting, hosted-builder, email, and CRM/service-business patterns
- run GitHub Actions checks on `master` and pull requests
- document release readiness in [Release notes](RELEASE.md)
- infer registrar, DNS, hosting, Cloudflare/CDN, CMS, email, analytics, and common subdomain clues
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
- DNS records
- hosting/CMS/email clues
- email safety and DNS cutover risk
- apex vs `www` launch URL guidance
- unresolved-domain checks for typos, unregistered domains, or dead DNS
- common passive subdomain checks
- analytics/tag clues
- CRM, booking, call tracking, and field-service clues
- light site intelligence for first-call prep
- optional market/search research when Firecrawl is configured by env key or CLI login
- kickoff research sections that clearly label observed facts, research signals, inferred hypotheses, and client-confirmation prompts
- keyword and competitor intelligence that remains deterministic and client-call oriented
- proof-asset and content-inventory output for kickoff planning
- table sidecar exports for Sheets, Obsidian, and client planning workflows
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

- Refine Obsidian templates after more real scans.
- Add more provider fixture cases as real scans expose missed patterns.
- Improve `plan` with stronger service/location sitemap heuristics after testing real client sites.
- Refine keyword clustering and competitor classification with real Firecrawl result sets.
