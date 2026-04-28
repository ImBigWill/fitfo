# Changelog

All notable changes to FITFO will be documented here.

This project uses semantic versioning while it is pre-1.0:

- patch versions for scanner fixes and small CLI polish
- minor versions for new commands or meaningful new scanner capabilities
- 1.0 once the default scan output and install path are stable enough for public use

## 0.1.0 - Unreleased

Initial private version.

### Added

- `fitfo <domain>` scanner command.
- `fitfo brief <domain>` first-call prep scaffold.
- `fitfo plan <domain>` client build plan command for priorities, site structure, workstreams, and confirmation questions.
- `fitfo brief <domain> --deep` crawl mode for sitemap pages, metadata, headings, CTAs, forms, schema, and suggested site structure.
- `fitfo brief <domain> --search` optional Firecrawl-backed web research for market, review, and service SERP signals.
- Kickoff research brief sections for current site read, market snapshot, keyword/page opportunities, positioning hypotheses, and first-call agenda.
- `fitfo plan` kickoff research game plan that carries market, keyword, and positioning prompts into build planning.
- Authenticated Firecrawl CLI fallback when `FIRECRAWL_API_KEY` is not set.
- Interactive `fitfo` prompt.
- Guided interactive wizard for quick scan, client handoff, kickoff research brief, and client build plan presets.
- Post-scan save prompt for interactive terminal runs without an explicit output path.
- Destination-first post-scan save prompt with Desktop Markdown as the findable default, plus Obsidian vault/folder and custom path options.
- Simple domain-based filenames for prompted saves, such as `example.com.md`.
- Styled terminal report with hot pink, black, and electric blue direction.
- Dedicated interactive startup screen with launch-frame styling and scan/map/brief flow.
- `--json`, `--no-color`, `--save`, and `--out` options.
- `--format markdown`, `--markdown`, and `--obsidian` report exports.
- `--quiet` mode for saving reports without printing the full output.
- `--vault` and `FITFO_OBSIDIAN_DIR` support for stable Obsidian note paths.
- `fitfo config` command for safe defaults like vault, location, country, format, deep/search, and crawl/search limits.
- `--version`, `version`, and `doctor` commands.
- `help` command alias and clean argument-error handling.
- RDAP lookup with selected TLD fallback endpoints.
- Classic WHOIS fallback for selected cases where RDAP is unavailable.
- DNS lookup for NS, A, AAAA, CNAME, MX, TXT, CAA, and DS records.
- DNS resolver fallback across Cloudflare and Google DNS-over-HTTPS.
- TLS certificate and HTTP/HTTPS redirect checks.
- Registrar, DNS provider, Cloudflare/CDN, hosting, CMS, and email inference.
- Email safety analysis for MX/SPF/DMARC status, DMARC policy, sender-platform clues, and DNS cutover risk.
- Apex vs `www` URL structure checks with likely primary launch URL guidance.
- Clear unresolved-domain input check for likely typos, unregistered domains, or dead DNS.
- WordPress detection from HTML and headers.
- Hosted-builder detection for Shopify, Webflow, Wix, and Squarespace clues.
- Analytics and marketing tag detection for common platforms.
- CRM, booking, and field-service platform detection for common service-business tools.
- Common subdomain checks for onboarding-relevant names.
- Client-call intelligence prompts in `fitfo brief` and `fitfo plan` for lead flow, CRM/booking ownership, canonical launch host, service/market priorities, measurement access, and prior developer handoff.
- Access checklist and previous developer request output.
- Dev pre-launch checklist for canonical host, redirects, DNS, hosting, CMS, email, tracking, CRM, and QA.
- Obsidian-ready Markdown reports with YAML frontmatter, tags, checklists, and first-call questions.
- Node built-in tests for domain normalization, analysis inference, provider fixtures, and Markdown report rendering.
- GitHub Actions workflow for syntax checks and tests on `master` and pull requests.
- Package metadata and release checklist for eventual public npm/open-source release.
- Public-ready project docs for roadmap, feature requests, contributing, security, and project state.

### Known Limitations

- Hosting detection is best-effort and can be hidden by CDNs/proxies.
- Previous developer contact is not publicly discoverable in most cases.
- Subdomain discovery is intentionally small and passive.
- RDAP/WHOIS responses vary by registry and registrar.
