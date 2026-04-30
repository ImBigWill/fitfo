# FITFO

[![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-FF00AA.svg)](LICENSE)
![Node >=20](https://img.shields.io/badge/node-%3E%3D20-00DCFF.svg)
![Dependencies: none](https://img.shields.io/badge/dependencies-none-111111.svg)
![Status: private first](https://img.shields.io/badge/status-private%20first-FF00AA.svg)
![Checks: npm test](https://img.shields.io/badge/checks-npm%20test-00DCFF.svg)

**Figure It The Fuck Out for clients.**

Client-safe meaning: **Find Infrastructure, Tech & Footprint Overview**.

FITFO is a command-line onboarding scanner for figuring out the first layer of a client website handoff: who controls the domain, where DNS lives, what hosting/CMS/email clues are public, what subdomains might exist, and what access the client needs to track down.

Motto: **Kickstarting onboarding.**

## Quick Start

From this folder:

```bash
npm link
fitfo onboard clientdomain.com
```

That is the main command. It runs the full client intake, creates the action plan, and saves planning exports unless you pass `--no-save`.

## Status

Private repo for now. The goal is to open source this later once the scanner and CLI experience settle.

## Licensing

FITFO is licensed as **GPL-2.0-or-later**.

The repository can still start private. The GPL matters when the project is distributed or opened up. This keeps the project aligned with the WordPress ecosystem from the beginning.

## Data Hygiene

Do not commit scan output, client reports, secrets, API keys, credentials, or `.env` files.

Generated reports are ignored by default through `fitfo-reports/` and `reports/`.

## Project Docs

- [Project state](docs/PROJECT_STATE.md)
- [Install](docs/INSTALL.md)
- [Interactive onboarding](docs/INTERACTIVE.md)
- [Examples](docs/EXAMPLES.md)
- [Report flow](docs/REPORT_FLOW.md)
- [Roadmap](docs/ROADMAP.md)
- [Release notes](docs/RELEASE.md)
- [Public release checklist](docs/PUBLIC_RELEASE_CHECKLIST.md)
- [Provider fixtures](docs/PROVIDER_FIXTURES.md)
- [Feature requests](docs/FEATURE_REQUESTS.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)

For the next-session handoff, start with [Morning Pickup](docs/PROJECT_STATE.md#morning-pickup).

Social badge can be added later once the preferred handle is confirmed.

## CLI Style Direction

FITFO should feel like a practical operator console, not a generic script.

Style principles:

- primary palette: black surface, hot pink `#FF00AA`, electric blue accents
- no purple
- compact, sharp, terminal-native panels
- clear verdict first, raw records second
- client-action language over network-admin jargon
- `--no-color` output must stay clean for copying, saving, and debugging

## Install Locally

From this folder:

```bash
npm link
```

## Run The Full Onboarding

Use `onboard` when you want FITFO to run the complete intake and produce the starting action plan:

```bash
fitfo onboard example.com
```

`fitfo onboard` runs the full intake path:

- domain, registrar, DNS, nameserver, hosting, Cloudflare/CDN, email, CMS, analytics, CRM, booking, call tracking, and subdomain checks
- deep website crawl when the site is reachable
- Firecrawl-backed market/search research when Firecrawl is configured
- raw evidence sections for URL/redirect inventory, lead capture, tracking/tool footprint, keyword evidence, competitors, service/location, reputation, launch, and action planning
- Obsidian-ready action-plan note
- CSV/JSON table exports for planning workflows

The exported report leads with an infrastructure snapshot and login checklist: registrar/domain provider, DNS/nameservers, very plain Cloudflare status, hosting, CMS, email, and exactly what the client needs to provide or confirm from day one.

When run in an interactive terminal, `fitfo onboard` asks for missing full-intake details before scanning:

- market/location, if no location is configured or passed
- Obsidian vault/folder, if no vault or output path is configured

If a vault is configured, the note is saved as:

```text
example.com-onboard.md
```

Preview the run without scanning:

```bash
fitfo onboard example.com --preview
```

Run terminal-only without saving the Obsidian note or CSV/JSON table exports:

```bash
fitfo onboard example.com --no-save
```

Save to a specific vault:

```bash
fitfo onboard example.com --location "Richmond, VA" --vault ~/Obsidian/Clients
```

Set useful defaults once:

```bash
fitfo config set vault ~/Obsidian/Clients
fitfo config set location "Richmond, VA"
```

Then the daily command stays short:

```bash
fitfo onboard example.com
```

## Other Commands

Guided interactive mode:

```bash
fitfo
```

Use this when you want FITFO to ask what to make:

- quick domain scan
- client onboarding handoff
- kickoff research brief
- client build plan

Fast technical scan:

```bash
fitfo example.com
```

First-call prep brief:

```bash
fitfo brief example.com
```

Deep site intelligence brief:

```bash
fitfo brief example.com --deep --crawl-limit 12
```

Firecrawl-backed market research:

```bash
fitfo brief example.com --deep --search --location "Richmond, VA"
```

FITFO uses `FIRECRAWL_API_KEY` when it is set. If no key is present, it falls back to the authenticated Firecrawl CLI, so `firecrawl login` and `firecrawl --status` are enough for local use.

The research brief separates:

- **Observed**: found on the current site, DNS, or public page crawl
- **Research**: found from Firecrawl-backed web search
- **Inferred**: a reasonable hypothesis to validate
- **Ask Client**: something FITFO should not pretend to know

It also generates:

- keyword clusters by service, emergency/high-intent, local, informational, and proof/trust themes
- keyword evidence tables tying terms back to crawl/search signals and mapped pages
- competitor, directory, review, social, owned, and other result classification
- top-three local competitor prompts from search/local/review-style research results
- keyword-to-page mapping for existing pages or suggested new pages
- prioritized action items with owner labels for client/us follow-up
- proof-asset requests for reviews, photos, credentials, case studies, offers, and lead-routing evidence
- URL/redirect inventory for canonical host, robots.txt, XML sitemap, canonical tags, noindex pages, and crawled URLs
- lead capture inventory for forms, form actions, visible fields, submit labels, phone numbers, email addresses, and CTA labels
- tracking/tool footprint for visible marketing, CRM, script hosts, and third-party widgets detected across crawled pages
- content inventory tables for crawled pages, page type, issues, and recommended action
- competitor-informed structure recommendations for service, review, location, FAQ, and trust pages
- service and location page recommendations tied to keyword intent, existing pages, and client validation
- review/reputation summaries across directories, review profiles, social profiles, owned proof, and market patterns
- a kickoff confirmation script for validating assumptions with the client
- a plan-mode launch checklist for canonical host, redirects, DNS, hosting, CMS, email, tracking, CRM, and QA

Export the kickoff tables as CSV files plus a JSON bundle:

```bash
fitfo brief example.com --deep --search --location "Richmond, VA" --export-tables fitfo-exports
```

This writes sidecar files for infrastructure snapshot, login checklist, action items, proof assets, content inventory, competitor structure, top local competitors, service/location recommendations, reputation summary, launch checklist, confirmation script, keyword clusters, competitors, keyword-to-page maps, raw research results, and a combined `example.com-research-tables.json` bundle.

Client build plan:

```bash
fitfo plan example.com --deep --search --location "Richmond, VA"
```

Environment check:

```bash
fitfo doctor
```

## Output Options

Show defaults:

```bash
fitfo config
```

Plain output:

```bash
fitfo example.com --no-color
```

JSON output:

```bash
fitfo example.com --json
```

Markdown output:

```bash
fitfo example.com --format markdown
```

Obsidian-ready note:

```bash
fitfo example.com --obsidian
```

Version:

```bash
fitfo --version
```

Save a timestamped report:

```bash
fitfo example.com --save
```

Save to a specific file:

```bash
fitfo example.com --out reports/example.txt
```

Save Markdown to a specific file:

```bash
fitfo example.com --format markdown --out reports/example.md
```

Save an Obsidian-ready note to a vault folder:

```bash
fitfo example.com --obsidian --out ~/Obsidian/Clients/example.com.md
```

Save a first-call brief:

```bash
fitfo brief example.com --obsidian --out ~/Obsidian/Clients/example.com-brief.md
```

Save into an Obsidian vault folder with a stable filename:

```bash
fitfo brief example.com --obsidian --vault ~/Obsidian/Clients
```

Or set a default vault folder:

```bash
export FITFO_OBSIDIAN_DIR=~/Obsidian/Clients
fitfo brief example.com --obsidian
```

Save without printing the full report:

```bash
fitfo brief example.com --obsidian --out ~/Obsidian/Clients/example.com-brief.md --quiet
```

## What FITFO Checks

- WHOIS-style domain records through RDAP, with selected WHOIS fallback support
- registrar
- registration and expiration dates
- domain status codes
- nameservers
- DNS provider hints
- A / AAAA / CNAME records
- SOA records, reverse DNS/PTR, and public ASN/network owner hints for live hosting evidence
- MX records and email provider hints
- SPF, DMARC, DMARC policy, DNSSEC, and CAA
- email safety risk from missing SPF/DMARC and sender-platform clues
- TLS certificate trust, issuer, and expiration
- HTTP/HTTPS redirect behavior
- Cloudflare or Cloudflare-like CDN signals
- hosting fingerprints from DNS, reverse DNS, ASN/network owner, headers, and page data
- WordPress and common CMS/page-builder signals
- analytics and marketing tags, including GA4/GTM/Meta/HubSpot/CallRail/Klaviyo/Mailchimp/Calendly/form clues
- common subdomains like `www`, `staging`, `dev`, `app`, `portal`, `shop`, `blog`, `booking`, `mail`, `webmail`, `crm`, and `admin`

## What FITFO Produces

The report is designed for onboarding, not just technical trivia.

Key sections:

- **Verdict**: registrar, DNS provider, Cloudflare status, hosting, CMS, email, and services.
- **Infrastructure Snapshot**: registrar/domain provider, DNS, very plain Cloudflare status, hosting, CMS, email, confidence, and client needs.
- **Login / Access Checklist**: day-one accounts to track down, including registrar, DNS, Cloudflare if indicated, hosting, CMS, email, analytics, CRM, and previous developer contact.
- **Track This Down**: the practical access errands for the client or previous developer.
- **Client Handoff Summary**: a client-facing table of public findings, confidence, and what access or confirmation is needed.
- **DNS Records**: nameservers, IPs, email records, and safety records.
- **Email Safety**: mail provider, SPF/DMARC status, sender clues, and DNS cutover checklist.
- **Common Subdomains**: likely hidden properties to verify before DNS or hosting changes.
- **Website Fingerprint**: reachability, final URL, redirects, TLS certificate, title, generator, and selected headers.
- **Access Needed**: registrar, DNS, hosting, WordPress, email, analytics, and previous developer access.
- **Handoff Packet**: what FITFO found, what access is needed, what to ask the previous developer, and what to verify before launch.
- **Previous Developer Request**: a starter message clients can send to whoever currently controls the setup.
- **Site Intelligence**: when `--deep` is used, sitemap pages, headings, metadata, canonical tags, meta robots/noindex, CTAs, form actions/fields, schema, phones, script hosts, tool signals, and suggested structure.
- **URL / Redirect Inventory**: canonical host, robots.txt, XML sitemap, canonical tags, noindex pages, and crawled URLs to preserve, improve, redirect, or remove.
- **Lead Capture Inventory**: forms, form actions, visible fields, submit labels, phone numbers, email addresses, and CTA labels that need routing/tracking confirmation.
- **Tracking / Tool Footprint**: marketing tags, CRM/booking signals, crawl-level tool fingerprints, and third-party script hosts to confirm with the client.
- **Kickoff Research Brief**: when using brief mode, current site read, market snapshot, keyword/page opportunities, positioning hypotheses, and kickoff call agenda.
- **Kickoff Research Game Plan**: when using plan mode, carries market, keyword, and positioning prompts into build planning.
- **Detailed Action Report**: prioritized next steps, proof-asset requests, content inventory, keyword clusters, keyword evidence, competitor research, top local competitors, reputation summary, competitor-informed structure, service/location recommendations, confirmation script, and keyword-to-page mapping for kickoff and build planning.
- **Launch Checklist**: in plan mode, grouped launch checks for canonical host, redirects, DNS, hosting, CMS, email, tracking/CRM, and QA.
- **Table Exports**: with `--export-tables <dir>`, CSV/JSON sidecars for moving research into Sheets, Obsidian, or client planning docs.

Markdown and Obsidian exports also include YAML frontmatter, tags, client-call questions, checklist items, and table-formatted infrastructure, login, action, keyword, competitor, reputation, structure, content, and page-map sections.

## Important Limits

FITFO is best-effort public reconnaissance.

- Hosting attribution is strongest when CNAME, HTTP headers, reverse DNS/PTR, ASN/network owner, and page signals agree.
- Hosting can be hidden behind Cloudflare, WP Engine edge, or another CDN/proxy.
- Previous developer contact usually cannot be discovered from public records.
- DNS records can be incomplete or intentionally hidden.
- RDAP coverage varies by TLD; classic WHOIS fallback is only implemented for selected cases.
- Subdomain discovery is intentionally small and passive. It checks common names, not an aggressive enumeration list.

## Current TLD Fallbacks

FITFO tries the official IANA RDAP bootstrap first, then selected fallback endpoints, then `rdap.org`.

Practical fallback coverage includes common and client-facing TLDs such as:

```text
.com, .net, .org, .us, .ai, .co, .io, .me, .ca, .uk,
.tv, .cc, .ly, .app, .dev, .page, .xyz, .online,
.site, .tech, .store, .shop, .agency, .digital,
.marketing, .media, .design, .studio, .solutions,
.business, .info, .biz, .pro, .cloud, .software,
.website, .one, .live, .plumbing, .contractors,
.construction, .repair, .services, .af
```

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/FEATURE_REQUESTS.md](docs/FEATURE_REQUESTS.md).

The important future split is:

```bash
fitfo brief clientdomain.com
```

`fitfo brief` is the first-call prep mode. Today it scaffolds public-signal observations, research queues, opportunity areas, and questions for the client to confirm or correct. Deeper crawling, keyword ideas, copy notes, and local SEO checks can build on this command.

Brief and plan reports also include client-call intelligence prompts that translate scan facts into follow-up decisions: lead flow, CRM/booking ownership, canonical launch host, priority services/markets, analytics/Search Console access, and previous developer handoff.

For kickoff prep, run:

```bash
fitfo brief clientdomain.com --deep --search --location "City, ST" --obsidian
```

That produces a structured call packet: what FITFO observed, what search suggested, what it inferred, and what the client needs to confirm.

## Development

Run directly:

```bash
node ./bin/fitfo.js example.com
```

Syntax check:

```bash
npm run check
```

Tests:

```bash
npm test
```

The project currently has no npm dependencies.
