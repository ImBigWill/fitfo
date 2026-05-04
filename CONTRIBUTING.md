# Contributing

Thanks for helping improve FITFO.

FITFO is a public-record onboarding scanner and first-call planning tool. Contributions should keep the default workflow safe, passive, and useful before a client handoff or redesign kickoff.

## Project Direction

FITFO should stay focused on client onboarding:

- figure out what public domain/DNS/site records reveal
- turn findings into access requests
- help the agency and client know what to track down
- avoid aggressive scanning or anything that feels hostile

## Development

Install locally:

```bash
npm link
fitfo doctor
```

Run a scan:

```bash
fitfo example.com
```

Run checks:

```bash
npm run check
npm test
```

Package dry run:

```bash
npm run pack:dry-run
```

## Good Contributions

- Provider detection fixtures for registrar, DNS, hosting, email, CMS, CRM, booking, analytics, and field-service patterns.
- Clearer report wording that separates observed facts from inferred findings.
- Safer launch, DNS, email, form, tracking, or handoff checks.
- Documentation improvements that use fake domains and fake output.
- Small CLI polish that preserves copy/paste-friendly output and `--no-color` readability.

## Provider Fixtures

Provider detection should usually start with a focused fixture.

Use fake domains, redacted public records, or synthetic examples. Do not include real client reports or private account screenshots.

Run:

```bash
npm test
```

## Local Install Notes

From the repository root:

```bash
npm link
```

If the linked command does not refresh after edits:

```bash
npm unlink -g fitfo
npm link
```

## Commit Style

Use small, meaningful commits.

Good examples:

```text
Add SSL certificate checks
Improve WP Engine hosting detection
Document install options
Add brief command scaffold
```

Avoid mixing unrelated scanner logic, docs, and styling changes in the same commit.

## Scanner Rules

- Prefer passive public signals.
- Do not add aggressive subdomain enumeration by default.
- Do not store credentials.
- Do not commit scan outputs or client reports.
- Label uncertain findings as observed, research, archived, inferred, enriched, or ask-client.
- Keep `--no-color` readable for copy/paste and saved reports.

## Data Safety

Do not include:

- `.env` files
- API keys
- access tokens
- passwords
- account IDs
- private client reports
- saved scan output
- screenshots of private dashboards
- copied private report content

Generated folders are ignored by default:

- `fitfo-reports/`
- `fitfo-exports/`
- `reports/`
- `.firecrawl/`

## Boundaries

The public core should stay no-account-required and useful without paid services.

Optional integrations and future add-ons are welcome as proposals, but default behavior should not become:

- aggressive crawling
- credential testing
- vulnerability scanning
- connected-account auditing
- paid-provider dependent
- final business strategy generation

## CLI Style Rules

- Primary palette: black surface, hot pink `#FF00AA`, electric blue accents.
- No purple.
- Keep the verdict and action plan near the top.
- Raw records should support the onboarding decision, not bury it.
- Use client-action language over network-admin jargon.

## Licensing

FITFO is GPL-2.0-or-later.
