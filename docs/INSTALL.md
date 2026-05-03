# Install

FITFO is private today, so local development uses `npm link`.

## Local Install

From the repository root:

```bash
npm link
fitfo doctor
fitfo example.com
```

If the command does not refresh after edits:

```bash
npm unlink -g fitfo
npm link
```

## Firecrawl Research

`--search` uses `FIRECRAWL_API_KEY` when present. Without an environment key, FITFO falls back to the authenticated Firecrawl CLI.

```bash
firecrawl login
firecrawl --status
fitfo brief example.com --deep --search --location "City, ST"
```

## Reports And Exports

Save a Markdown note into an Obsidian vault/folder:

```bash
fitfo brief example.com --deep --search --location "City, ST" --obsidian --vault ~/Obsidian/Clients
```

Advanced export for planning tables:

```bash
fitfo plan example.com --deep --search --location "City, ST" --export-tables fitfo-exports
```

Generated folders are ignored by git:

- `fitfo-reports/`
- `fitfo-exports/`
- `reports/`
- `.firecrawl/`

## Package Dry Run

Before opening the project or publishing a package:

```bash
npm run check
npm test
npm run pack:dry-run
```

Publishing is intentionally blocked while `"private": true` remains in `package.json`.
