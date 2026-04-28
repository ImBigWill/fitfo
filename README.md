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
- [Report flow](docs/REPORT_FLOW.md)
- [Roadmap](docs/ROADMAP.md)
- [Release notes](docs/RELEASE.md)
- [Feature requests](docs/FEATURE_REQUESTS.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)

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

Then run FITFO from anywhere:

```bash
fitfo clientdomain.com
```

Interactive mode:

```bash
fitfo
```

Use this when you want FITFO to ask what to make:

- quick domain scan
- client onboarding handoff
- kickoff research brief
- client build plan

Fast path when you already know the command:

```bash
fitfo clientdomain.com
fitfo brief clientdomain.com --deep --search --location "City, ST"
fitfo plan clientdomain.com --deep --search --location "City, ST"
```

Environment check:

```bash
fitfo doctor
```

## Usage

Styled terminal report:

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
- competitor, directory, review, social, owned, and other result classification
- keyword-to-page mapping for existing pages or suggested new pages
- prioritized action items with owner labels for client/us follow-up
- proof-asset requests for reviews, photos, credentials, case studies, offers, and lead-routing evidence
- content inventory tables for crawled pages, page type, issues, and recommended action

Client build plan:

```bash
fitfo plan example.com --deep --search --location "Richmond, VA"
```

Save defaults:

```bash
fitfo config set vault ~/Obsidian/Clients
fitfo config set location "Richmond, VA"
fitfo config set format obsidian
fitfo config set deep true
fitfo config set search true
```

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
- MX records and email provider hints
- SPF, DMARC, DMARC policy, DNSSEC, and CAA
- email safety risk from missing SPF/DMARC and sender-platform clues
- TLS certificate trust, issuer, and expiration
- HTTP/HTTPS redirect behavior
- Cloudflare or Cloudflare-like CDN signals
- hosting fingerprints from DNS, headers, and page data
- WordPress and common CMS/page-builder signals
- analytics and marketing tags, including GA4/GTM/Meta/HubSpot/CallRail/Klaviyo/Mailchimp/Calendly/form clues
- common subdomains like `www`, `staging`, `dev`, `app`, `portal`, `shop`, `blog`, `booking`, `mail`, `webmail`, `crm`, and `admin`

## What FITFO Produces

The report is designed for onboarding, not just technical trivia.

Key sections:

- **Verdict**: registrar, DNS provider, Cloudflare status, hosting, CMS, email, and services.
- **Track This Down**: the practical access errands for the client or previous developer.
- **DNS Records**: nameservers, IPs, email records, and safety records.
- **Email Safety**: mail provider, SPF/DMARC status, sender clues, and DNS cutover checklist.
- **Common Subdomains**: likely hidden properties to verify before DNS or hosting changes.
- **Website Fingerprint**: reachability, final URL, redirects, TLS certificate, title, generator, and selected headers.
- **Access Needed**: registrar, DNS, hosting, WordPress, email, analytics, and previous developer access.
- **Handoff Packet**: what FITFO found, what access is needed, what to ask the previous developer, and what to verify before launch.
- **Previous Developer Request**: a starter message clients can send to whoever currently controls the setup.
- **Site Intelligence**: when `--deep` is used, sitemap pages, headings, metadata, CTAs, forms, schema, phones, and suggested structure.
- **Kickoff Research Brief**: when using brief mode, current site read, market snapshot, keyword/page opportunities, positioning hypotheses, and kickoff call agenda.
- **Kickoff Research Game Plan**: when using plan mode, carries market, keyword, and positioning prompts into build planning.
- **Detailed Action Report**: prioritized next steps, proof-asset requests, content inventory, keyword clusters, competitor research, and keyword-to-page mapping for kickoff and build planning.

Markdown and Obsidian exports also include YAML frontmatter, tags, client-call questions, checklist items, and table-formatted action, keyword, competitor, content, and page-map sections.

## Important Limits

FITFO is best-effort public reconnaissance.

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
