# Security

FITFO works with public domain, DNS, and website signals. It should not collect or store secrets.

## Supported Versions

FITFO is pre-release. Security handling applies to the current `master` branch.

## Reporting Issues

Report security issues privately.

Preferred paths:

- Use GitHub private vulnerability reporting for this repository, if available.
- Otherwise email the maintainer at `officialwill@gmail.com`.

Please do not open a public issue for suspected secrets, credential exposure, account access, or abuse vectors.

Include:

- affected version or commit
- command used
- operating system and Node version
- concise reproduction steps
- impact and suggested mitigation, if known

Do not include real client reports, API keys, access tokens, passwords, or private account screenshots.

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

## Public Reconnaissance Notice

FITFO uses public records and public website signals. Findings are best-effort and should be confirmed with the client, registrar, host, DNS provider, email administrator, or previous developer before making changes.
