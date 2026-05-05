# Changelog

All notable changes to FITFO will be documented here.

This project uses semantic versioning while it is pre-1.0:

- patch versions for scanner fixes and small CLI polish
- minor versions for new commands or meaningful new scanner capabilities
- 1.0 once the default scan output and install path are stable enough for public use

## 0.1.0 - Public preview

Initial public-preview version.

### Added

- `fitfo <domain>` scanner command.
- `fitfo brief <domain>` first-call prep scaffold.
- `fitfo plan <domain>` client build plan command for priorities, site structure, workstreams, and confirmation questions.
- `fitfo onboard <domain>` one-command full-intake preset for deep scan, search-backed client planning, Obsidian action-plan export, and CSV/JSON table exports.
- Interactive `fitfo onboard <domain>` prompts for missing location and Obsidian vault/folder before scanning.
- `fitfo onboard <domain> --preview` dry run summary and `--no-save` terminal-only mode.
- Evidence labels in plan/action output and action-item table exports.
- Example output docs, provider fixture guidance, and issue templates.
- Provider fixtures for DreamHost, Flywheel, Liquid Web, Birdeye, NiceJob, and Service Fusion handoff patterns.
- Client handoff summary table in scan exports.
- Infrastructure snapshot and login/access checklist tables at the top of brief, plan, and onboard Markdown/Obsidian exports.
- Evidence explanation, direct login request, and do-not-touch warning sections at the top of scan, brief, plan, and onboard reports.
- Unknowns-blocking-work and call-one workflow sections with Found / Need / Risk / Ask / Owner / Audience structure.
- End-of-run recap showing saved report path, table export path, Cloudflare status, top unknowns, and next step.
- Top local competitor prompts in brief/plan reports from search/local/review-style research signals.
- Table exports for infrastructure snapshot, login checklist, unknown blockers, call-one workflow, hosting evidence, and top local competitors.
- Integration boundary documentation that separates free core scanning from optional enrichment providers.
- `--wayback` Internet Archive snapshot checks for recent homepage version comparison, plus Wayback sections in brief/plan/onboard Markdown.
- Wayback CSV/JSON table exports for archived versions and change flags.
- Richer deep-crawl extraction for canonical tags, meta robots/noindex, form actions/methods/fields, submit labels, script hosts, and crawl-level tool fingerprints.
- Raw Markdown evidence sections for URL/redirect inventory, lead capture inventory, tracking/tool footprint, and keyword evidence in brief/plan/onboard reports.
- Likely registrar inference from nameserver patterns when RDAP registrar data is missing.
- `fitfo brief <domain> --deep` crawl mode for sitemap pages, metadata, headings, CTAs, forms, schema, and suggested site structure.
- `fitfo brief <domain> --search` optional Firecrawl-backed web research for market, review, and service SERP signals.
- Kickoff research brief sections for current site read, market snapshot, keyword/page opportunities, positioning hypotheses, and first-call agenda.
- `fitfo plan` kickoff research game plan that carries market, keyword, and positioning prompts into build planning.
- Keyword and competitor intelligence v1 with keyword clusters, competitor/directory/review classification, keyword-to-page mapping, proof-asset requests, content inventory, and prioritized action items.
- Table-formatted Markdown/Obsidian sections for action reports, keyword clusters, competitor research, proof assets, content inventory, and keyword-to-page maps.
- Competitor-informed structure, review/reputation summary, and kickoff confirmation script sections in brief and plan reports.
- Service/location page recommendations tied to keyword intent, existing pages, and client validation.
- Plan-mode launch checklist for canonical host, redirects, DNS, hosting, CMS, email safety, tracking/CRM, and post-launch QA.
- `--export-tables <dir>` sidecar exports for action items, proof assets, content inventory, competitor structure, service/location recommendations, reputation summary, launch checklist, confirmation script, keyword clusters, competitors, keyword-to-page maps, raw research results, and a combined JSON bundle.
- Broader Firecrawl research queries that include inferred service category and local competitor/search intent when a location is provided.
- Authenticated Firecrawl CLI fallback when `FIRECRAWL_API_KEY` is not set.
- Interactive `fitfo` prompt.
- Guided interactive wizard for quick scan, client handoff, kickoff research brief, and client build plan presets.
- Post-scan save prompt for interactive terminal runs without an explicit output path.
- Destination-first post-scan save prompt with Desktop Markdown as the findable default, plus Obsidian vault/folder and custom path options.
- Simple domain-based filenames for prompted saves, such as `example.com.md`.
- Styled terminal report with hot pink, black, and electric blue direction.
- Dedicated interactive startup screen with launch-frame styling and scan/map/brief flow.
- Command Code-inspired terminal polish with a larger FITFO wordmark, quieter metadata, and a sharper startup handoff card.
- `--json`, `--no-color`, `--save`, and `--out` options.
- `--format markdown`, `--markdown`, and `--obsidian` report exports.
- `--quiet` mode for saving reports without printing the full output.
- `--vault` and `fitfo config set vault` support for stable Obsidian note paths.
- `fitfo config` command for safe defaults like vault, location, country, format, deep/search, and crawl/search limits.
- `--version`, `version`, and `doctor` commands.
- `help` command alias and clean argument-error handling.
- RDAP lookup with selected TLD fallback endpoints.
- Classic WHOIS fallback for selected cases where RDAP is unavailable.
- DNS lookup for NS, SOA, A, AAAA, CNAME, MX, TXT, CAA, and DS records.
- DNS resolver fallback across Cloudflare and Google DNS-over-HTTPS.
- Free live DNS enrichment for reverse DNS/PTR and public ASN/network-owner hints to improve hosting evidence without paid APIs.
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
- Client handoff packet that summarizes what FITFO found, what access is needed, what to ask the previous developer, and what to verify before launch.
- Access checklist and previous developer request output.
- Dev pre-launch checklist for canonical host, redirects, DNS, hosting, CMS, email, tracking, CRM, and QA.
- Obsidian-ready Markdown reports with YAML frontmatter, tags, checklists, and first-call questions.
- Node built-in tests for domain normalization, analysis inference, provider fixtures, and Markdown report rendering.
- Provider fixtures for GoDaddy, Cloudflare, Hostinger, Shopify, Webflow, Wix, Squarespace, Vercel, Netlify, SiteGround, Bluehost, IONOS, and DigitalOcean patterns.
- GitHub Actions workflow for syntax checks and tests on `master` and pull requests.
- Package metadata for eventual public npm/open-source release.
- Public-ready project docs for contributing, security, provider fixtures, install, and examples.

### Known Limitations

- Hosting detection is best-effort and can be hidden by CDNs/proxies.
- Previous developer contact is not publicly discoverable in most cases.
- Subdomain discovery is intentionally small and passive.
- RDAP/WHOIS responses vary by registry and registrar.
