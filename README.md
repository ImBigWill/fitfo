# FITFO

[![License: GPL-2.0-or-later](https://img.shields.io/badge/license-GPL--2.0--or--later-FF00AA.svg)](LICENSE)
![Node >=20](https://img.shields.io/badge/node-%3E%3D20-00DCFF.svg)
![Dependencies: none](https://img.shields.io/badge/dependencies-none-111111.svg)
![Status: private first](https://img.shields.io/badge/status-private%20first-FF00AA.svg)

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
- [Roadmap](docs/ROADMAP.md)
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

Environment check:

```bash
fitfo doctor
```

## Usage

Styled terminal report:

```bash
fitfo example.com
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

## What FITFO Checks

- WHOIS-style domain records through RDAP, with selected WHOIS fallback support
- registrar
- registration and expiration dates
- domain status codes
- nameservers
- DNS provider hints
- A / AAAA / CNAME records
- MX records and email provider hints
- SPF, DMARC, DNSSEC, and CAA
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
- **Common Subdomains**: likely hidden properties to verify before DNS or hosting changes.
- **Website Fingerprint**: reachability, final URL, redirects, TLS certificate, title, generator, and selected headers.
- **Access Needed**: registrar, DNS, hosting, WordPress, email, analytics, and previous developer access.
- **Previous Developer Request**: a starter message clients can send to whoever currently controls the setup.

Markdown and Obsidian exports also include YAML frontmatter, tags, client-call questions, and checklist items.

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

`fitfo brief` should become the first-call prep mode: website observations, positioning hypotheses, keyword ideas, copy notes, local SEO checks, and questions for the client to confirm or correct.

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
