# Core Scope

FITFO core is the free, no-account-required domain onboarding scanner and first-call planning layer.

The public core should answer four questions:

1. What is where?
2. Who likely controls it?
3. What could break if we touch it?
4. What should we ask the client or previous developer next?

## What Is In Core

Core includes checks that can run from public records, normal HTTP requests, and local analysis without paid API keys.

### Domain And DNS

- RDAP registrar lookup
- nameserver and DNS provider clues
- SOA, NS, A, AAAA, CNAME, MX, TXT, CAA, and DS lookups
- reverse DNS/PTR lookup
- public ASN/network-owner hints
- likely registrar inference from strong nameserver patterns when RDAP is incomplete
- unresolved, misspelled, or dead-domain handling
- common passive subdomain checks

### Website And Launch Safety

- HTTP/HTTPS reachability
- apex versus `www` behavior
- redirect behavior
- likely canonical launch host
- TLS certificate metadata
- robots.txt checks
- XML sitemap discovery
- canonical tag and meta robots extraction
- shallow/deep local crawl when enabled with `--deep`
- page metadata, headings, forms, phones, emails, CTAs, schema, scripts, and tool clues

### CMS, Hosting, Email, And Tools

- hosting clues from DNS, HTTP, headers, SOA, nameservers, and page evidence
- WordPress and common CMS clues
- analytics and tag clues such as GA4, GTM, and Search Console verification when visible
- CRM, booking, field-service, call tracking, and review/reputation tool clues when visible
- email provider clues from MX records
- email safety checks for SPF, DMARC, DMARC policy, and sender-platform clues

### Client Handoff And Planning

- infrastructure snapshot
- access checklist
- unknown blockers
- call-one workflow
- "go get these logins" list
- "do not touch until confirmed" warnings
- previous developer request list
- lead capture inventory
- tracking/tool footprint
- citation/NAP baseline
- proof asset request list
- recommended site structure
- service/location recommendations
- keyword-to-page map
- prioritized action report
- launch checklist
- kickoff confirmation script

## Core Commands

- `fitfo clientdomain.com`: default scan.
- `fitfo scan clientdomain.com`: explicit scan command.
- `fitfo snapshot clientdomain.com`: light first-call snapshot.
- `fitfo brief clientdomain.com`: first-call prep report.
- `fitfo plan clientdomain.com`: build-planning report.
- `fitfo onboard clientdomain.com`: full intake preset with saved Markdown planning note.
- `fitfo doctor`: local environment check.
- `fitfo config`: safe local defaults.
- `fitfo version`: current version.

## Optional But Still In The Public Package

These features are part of the package, but should stay opt-in because they add runtime, third-party calls, or strategy depth.

| Feature | Trigger | Requirement |
| --- | --- | --- |
| Deep crawl | `--deep` | No key. Uses public site pages. |
| Firecrawl research | `--search` | `FIRECRAWL_API_KEY` or authenticated Firecrawl CLI. |
| Wayback comparison | `--wayback`; included in `onboard` | No key. Uses Internet Archive public CDX API. |
| Table exports | `--export-tables <dir>` | No key. Writes local CSV/JSON sidecars. |
| Obsidian-style save | `--vault <dir>` or config | No key. Writes local Markdown files. |
| Agent-readiness add-on | `--agent-ready` on plan mode | No key. Secondary planning layer. |

## What Is Not Core

These may become future modules or separate commands, but they should not be required for the public core:

- paid provider enrichment
- deep competitor strategy
- final positioning strategy
- full copywriting briefs
- full technical SEO crawler
- credential testing
- vulnerability scanning
- aggressive subdomain enumeration
- connected-account analytics audits
- citation management
- CRM implementation
- public plugin architecture

## Evidence Labels

Reports should keep source boundaries clear:

- **Observed:** found in DNS, HTTP, crawl, headers, or visible markup.
- **Research:** found through Firecrawl/search result enrichment.
- **Archived:** found through Internet Archive/Wayback.
- **Inferred:** reasonable hypothesis from public signals.
- **Ask Client:** not knowable from public records.
- **Enriched:** future optional paid/API provider evidence.

## Public Positioning

FITFO is best-effort public reconnaissance for client onboarding and redesign planning.

It does not prove ownership, guarantee provider attribution, replace account access, or make final business strategy decisions.

The tool should help an agency start the right conversation faster.
