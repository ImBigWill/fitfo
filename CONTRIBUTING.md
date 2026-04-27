# Contributing

FITFO is private for now, but this file documents the standards we want before opening it up.

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
```

Run a scan:

```bash
fitfo example.com
```

Run syntax checks:

```bash
npm run check
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

Avoid mixing unrelated scanner logic, docs, and styling changes in the same commit once the project is public.

## Scanner Rules

- Prefer passive public signals.
- Do not add aggressive subdomain enumeration by default.
- Do not store credentials.
- Do not commit scan outputs or client reports.
- Label uncertain findings as inferred, likely, or manual.
- Keep `--no-color` readable for copy/paste and saved reports.

## CLI Style Rules

- Primary palette: black surface, hot pink `#FF00AA`, electric blue accents.
- No purple.
- Keep the verdict and action plan near the top.
- Raw records should support the onboarding decision, not bury it.
- Use client-action language over network-admin jargon.

## Licensing

FITFO is GPL-2.0-or-later.
