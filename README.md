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

FITFO has multiple report modes:

- `snapshot`: a light first-call walkthrough for site positioning, what is working, what is holding the site back, and how an agency can help.
- `brief`: a deeper first-call prep packet with research queues, evidence, client confirmations, and opportunity areas.
- `plan`: a build-planning report with structure, workstreams, launch checks, keyword/page mapping, and an architectural state map for redesign decisions.
- `onboard`: the full intake path with saved planning notes and table exports.

Optional add-ons:

- `fitfo plan example.com --deep --agent-ready`: adds a launch-readiness layer for robots/sitemap clarity, canonical host, readable public content, noindex checks, AI crawler policy, and parked emerging protocol/commerce signals.

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

Package metadata also declares `GPL-2.0-or-later` so GitHub, npm, and automated scanners can read the license consistently.

## Data Hygiene

Do not commit scan output, client reports, secrets, API keys, credentials, or `.env` files.

Generated reports are ignored by default through `fitfo-reports/` and `reports/`.

## Project Docs

- [Project state](docs/PROJECT_STATE.md)
- [Install](docs/INSTALL.md)
- [Interactive onboarding](docs/INTERACTIVE.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Examples](docs/EXAMPLES.md)
- [Report flow](docs/REPORT_FLOW.md)
- [Roadmap](docs/ROADMAP.md)
- [One-page website brief](docs/website/FITFO_ONE_PAGE_WEBSITE_BRIEF.md)
- [WordPress one-page build plan](docs/website/FITFO_WORDPRESS_BUILD_PLAN.md)
- [Agent-ready add-on plan](docs/website/FITFO_AGENT_READINESS_ADDON_PLAN.md)
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
- recent Wayback homepage snapshot comparison through the Internet Archive
- raw evidence sections for URL/redirect inventory, lead capture, tracking/tool footprint, keyword evidence, competitors, service/location, reputation, launch, and action planning
- Citation / NAP baseline for public name, address/service-area, phone, and directory/profile consistency checks
- Obsidian-ready action-plan note
- CSV/JSON table exports for planning workflows

The exported report leads with an infrastructure snapshot and login checklist: registrar/domain provider, DNS/nameservers, very plain Cloudflare status, hosting, CMS, email, and exactly what the client needs to provide or confirm from day one.

It also adds a plain evidence layer near the top:

- **Unknowns Blocking Work**: the blockers that must be assigned before build or launch work.
- **Call One Workflow**: a Found / Need / Risk / Ask / Owner / Audience table for the first client call.
- **Why FITFO Thinks This**: the public signal behind each finding, plus what to confirm with the client.
- **Go Get These Logins**: a direct list of the accounts/access the client needs to track down.
- **Do Not Touch Until Confirmed**: DNS, email, Cloudflare/CDN, redirects, lead tracking, hosting, and subdomain warnings before launch work.
- **Citation / NAP Baseline**: the canonical NAP candidate from public signals, plus directory/profile rows that may be consistent, partial, missing, or conflicting.

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
- FitFo Snapshot
- kickoff research brief
- client build plan

Fast technical scan:

```bash
fitfo example.com
```

Light first-call site walkthrough:

```bash
fitfo snapshot example.com --deep --search --location "Richmond, VA"
```

`fitfo snapshot` is built for a sales or discovery conversation. It keeps the output focused on access signals, first-call readiness, what the site is doing right, what may be holding it back, opportunity angles, how an agency can help, a simple walkthrough flow, talk track, and questions to ask. It is intentionally less deep than `brief` or `plan`.

Use `--client-safe` when you want a cleaner client-facing version that hides account, tool, and subdomain evidence:

```bash
fitfo snapshot example.com --client-safe
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

Expanded passive subdomain checks:

```bash
fitfo plan example.com --subdomains
```

Use this before redesign or launch when staging, portal, app, shop, booking, CRM, mail, admin, or legacy hosts may exist.

Export a redirect/current-to-future URL matrix:

```bash
fitfo plan example.com --deep --subdomains --export-tables fitfo-exports
```

This creates `example.com-redirect-matrix.csv` for launch planning.

Add the optional agent-readiness layer to a build plan:

```bash
fitfo plan example.com --deep --agent-ready
```

Export the same add-on as a planning table:

```bash
fitfo plan example.com --deep --agent-ready --export-tables fitfo-exports
```

Plumber/home-services planning lens:

```bash
fitfo plan example-plumbing.test --deep --search --location "Richmond, VA" --vertical plumbing
```

`--vertical plumbing` keeps the core scan intact, then adds plumber-aware research queries and plan sections for homeowner emergency UX, plumbing proof assets, service priorities, and role-specific kickoff questions. FITFO may also detect a plumbing lens from public site/search signals, but explicit `--vertical plumbing` is the safest way to force that context.

Architectural redesign planning:

```bash
fitfo plan example.com --deep --search --wayback --location "Richmond, VA"
```

`fitfo plan` now treats a redesign as a current-state to future-state architecture problem. It starts from the current domain structure, redirect matrix, canonical host, subdomains, crawled URLs, keyword/page map, and launch checklist. The plan labels items as keep, rework, create, redirect, or confirm so the build can preserve what matters, flag what needs redesign work, and define what must happen before launch, at launch, and after launch.

FITFO uses `FIRECRAWL_API_KEY` when it is set. If no key is present, it falls back to the authenticated Firecrawl CLI, so `firecrawl login` and `firecrawl --status` are enough for local use.

Recent site-change check:

```bash
fitfo brief example.com --deep --wayback
```

`--wayback` checks a small number of recent Internet Archive homepage captures and compares title, H1, meta description, word count, forms, phone numbers, CTAs, robots/noindex, and visible tracking/tool signals. Use this when you suspect the site changed hands and something important disappeared.

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
- architectural state map for current URLs, redirect/canonical behavior, subdomains, future-state decisions, and launch/post-launch handling
- redirect/current-to-future matrix for launch worksheets and redesign URL handling
- Wayback recent-version evidence for spotting homepage copy, lead-capture, phone, and tracking changes across recent archived versions
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

This writes sidecar files for infrastructure snapshot, login checklist, unknown blockers, call-one workflow, hosting evidence, Wayback versions/changes, action items, proof assets, content inventory, competitor structure, top local competitors, service/location recommendations, reputation summary, launch checklist, confirmation script, keyword clusters, competitors, keyword-to-page maps, raw research results, and a combined `example.com-research-tables.json` bundle.

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

Save a FitFo Snapshot:

```bash
fitfo snapshot example.com --obsidian --out ~/Obsidian/Clients/example.com-snapshot.md
```

Save into an Obsidian vault folder with a stable filename:

```bash
fitfo brief example.com --obsidian --vault ~/Obsidian/Clients
```

For snapshots, the stable vault filename is `example.com-snapshot.md`:

```bash
fitfo snapshot example.com --obsidian --vault ~/Obsidian/Clients
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
- optional Internet Archive Wayback recent-version comparison for homepage changes
- Cloudflare or Cloudflare-like CDN signals
- hosting fingerprints from DNS, reverse DNS, ASN/network owner, headers, and page data
- WordPress and common CMS/page-builder signals
- analytics and marketing tags, including GA4/GTM/Meta/HubSpot/CallRail/Klaviyo/Mailchimp/Calendly/form clues
- common subdomains like `www`, `staging`, `dev`, `app`, `portal`, `shop`, `blog`, `booking`, `mail`, `webmail`, `crm`, and `admin`
- optional expanded passive subdomain checks with `--subdomains`, including staging/legacy, portal/app, commerce/billing, email, technical-admin, and content-delivery classifications

## What FITFO Produces

The report is designed for onboarding, not just technical trivia.

Key sections:

- **Verdict**: registrar, DNS provider, Cloudflare status, hosting, CMS, email, and services.
- **Infrastructure Snapshot**: registrar/domain provider, DNS, very plain Cloudflare status, hosting, CMS, email, confidence, and client needs.
- **Unknowns Blocking Work**: ranked ownership and dependency blockers with severity, owner, evidence, and ask.
- **Call One Workflow**: the main onboarding table: found, need, risk, ask, owner, and audience for each critical area.
- **Why FITFO Thinks This**: confidence explanations for registrar, DNS, Cloudflare, hosting, launch URL, CMS, email, and previous developer visibility.
- **Login / Access Checklist**: day-one accounts to track down, including registrar, DNS, Cloudflare if indicated, hosting, CMS, email, analytics, CRM, and previous developer contact.
- **Go Get These Logins**: a client-facing access request list suitable for turning into kickoff tasks.
- **Do Not Touch Until Confirmed**: practical warnings for DNS, email, Cloudflare/CDN, canonical host, lead tracking, hosting origin, subdomains, and archived site-change risks.
- **Track This Down**: the practical access errands for the client or previous developer.
- **Client Handoff Summary**: a client-facing table of public findings, confidence, and what access or confirmation is needed.
- **DNS Records**: nameservers, IPs, email records, and safety records.
- **Email Safety**: mail provider, SPF/DMARC status, sender clues, and DNS cutover checklist.
- **Common Subdomains**: likely hidden properties to verify before DNS or hosting changes.
- **Website Fingerprint**: reachability, final URL, redirects, TLS certificate, title, generator, and selected headers.
- **Access Needed**: registrar, DNS, hosting, WordPress, email, analytics, and previous developer access.
- **Handoff Packet**: what FITFO found, what access is needed, what to ask the previous developer, and what to verify before launch.
- **Previous Developer Request**: a starter message and specific request list clients can send to whoever currently controls the setup.
- **Site Intelligence**: when `--deep` is used, sitemap pages, headings, metadata, canonical tags, meta robots/noindex, CTAs, form actions/fields, schema, phones, script hosts, tool signals, and suggested structure.
- **URL / Redirect Inventory**: canonical host, robots.txt, XML sitemap, canonical tags, noindex pages, and crawled URLs to preserve, improve, redirect, or remove.
- **Wayback Recent Versions**: when `--wayback` is used, recent archived homepage versions, visible change flags, and risk notes for forms, phone visibility, tracking/tool signals, titles, H1s, and meta robots.
- **Lead Capture Inventory**: forms, form actions, visible fields, submit labels, phone numbers, email addresses, and CTA labels that need routing/tracking confirmation.
- **Tracking / Tool Footprint**: marketing tags, CRM/booking signals, crawl-level tool fingerprints, and third-party script hosts to confirm with the client.
- **FitFo Snapshot**: when using snapshot mode, a light walkthrough with positioning read, what is working, friction points, opportunity angles, agency help areas, talk track, and client questions.
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

The main mode split is:

```bash
fitfo snapshot clientdomain.com
fitfo brief clientdomain.com
```

`fitfo snapshot` is the lighter first-call walkthrough mode. It is designed for a quick website and positioning conversation without overwhelming the client.

`fitfo brief` is the deeper first-call prep mode. It scaffolds public-signal observations, research queues, opportunity areas, and questions for the client to confirm or correct. Deeper crawling, keyword ideas, copy notes, and local SEO checks build on this command.

Snapshot, brief, and plan reports also include client-call intelligence prompts that translate scan facts into follow-up decisions: lead flow, CRM/booking ownership, canonical launch host, priority services/markets, analytics/Search Console access, and previous developer handoff.

For a light first-call walkthrough, run:

```bash
fitfo snapshot clientdomain.com --deep --search --location "City, ST" --obsidian
```

For deeper kickoff prep, run:

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
