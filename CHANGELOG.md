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
- `fitfo brief <domain> --deep` crawl mode for sitemap pages, metadata, headings, CTAs, forms, schema, and suggested site structure.
- Interactive `fitfo` prompt.
- Styled terminal report with hot pink, black, and electric blue direction.
- Dedicated interactive startup screen with launch-frame styling and scan/map/brief flow.
- `--json`, `--no-color`, `--save`, and `--out` options.
- `--format markdown`, `--markdown`, and `--obsidian` report exports.
- `--quiet` mode for saving reports without printing the full output.
- `--vault` and `FITFO_OBSIDIAN_DIR` support for stable Obsidian note paths.
- `--version`, `version`, and `doctor` commands.
- `help` command alias and clean argument-error handling.
- RDAP lookup with selected TLD fallback endpoints.
- Classic WHOIS fallback for selected cases where RDAP is unavailable.
- DNS lookup for NS, A, AAAA, CNAME, MX, TXT, CAA, and DS records.
- DNS resolver fallback across Cloudflare and Google DNS-over-HTTPS.
- TLS certificate and HTTP/HTTPS redirect checks.
- Registrar, DNS provider, Cloudflare/CDN, hosting, CMS, and email inference.
- WordPress detection from HTML and headers.
- Analytics and marketing tag detection for common platforms.
- Common subdomain checks for onboarding-relevant names.
- Access checklist and previous developer request output.
- Obsidian-ready Markdown reports with YAML frontmatter, tags, checklists, and first-call questions.
- Node built-in tests for domain normalization, analysis inference, and Markdown report rendering.
- GitHub Actions workflow for syntax checks and tests on `master` and pull requests.
- Package metadata and release checklist for eventual public npm/open-source release.
- Public-ready project docs for roadmap, feature requests, contributing, security, and project state.

### Known Limitations

- Hosting detection is best-effort and can be hidden by CDNs/proxies.
- Previous developer contact is not publicly discoverable in most cases.
- Subdomain discovery is intentionally small and passive.
- RDAP/WHOIS responses vary by registry and registrar.
