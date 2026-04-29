# Security

FITFO works with public domain, DNS, and website signals. It should not collect or store secrets.

## Supported Versions

FITFO is pre-release. Security handling applies to the current `master` branch.

## Reporting Issues

While the repository is private, report issues directly to the maintainer.

When the project becomes public, this section should be updated with a preferred security contact.

## Data Rules

Do not commit:

- `.env` files
- API keys
- access tokens
- passwords
- client reports
- saved scan output
- private onboarding notes

Generated report folders are ignored by default:

- `fitfo-reports/`
- `fitfo-exports/`
- `reports/`
- `.firecrawl/`

## Scanner Boundaries

FITFO should remain passive by default.

- DNS and RDAP/WHOIS lookups are acceptable.
- Fetching the public website homepage is acceptable.
- Checking a small list of common subdomains is acceptable.
- Aggressive crawling, brute-force subdomain enumeration, credential checks, exploit checks, or vulnerability scanning do not belong in the default scanner.

If those capabilities are ever explored, they should be opt-in and clearly documented.
