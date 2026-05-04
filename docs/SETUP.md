# Setup

FITFO core needs very little setup.

## Requirements

- Node.js `>=20`
- Git
- Network access for public DNS, RDAP, HTTP, and optional research checks

There are no npm runtime dependencies today.

## Local Development Install

From the repository root:

```bash
npm link
fitfo doctor
fitfo example.com
```

If the linked command does not refresh after edits:

```bash
npm unlink -g fitfo
npm link
```

## Required Keys

No keys are required for core FITFO.

The default scan and most planning output work from public records and public website signals.

## Optional Keys And Accounts

### Firecrawl Research

`--search` uses Firecrawl for market/search research.

Use either:

```bash
export FIRECRAWL_API_KEY="..."
```

or an authenticated local Firecrawl CLI:

```bash
firecrawl login
firecrawl --status
```

Without either one, FITFO still works. It will report that live web research is unavailable for that section.

### Internet Archive / Wayback

No key is required.

`--wayback` uses the public Internet Archive CDX API.

### Obsidian Or Local Report Folder

No key is required.

Pass a folder when saving Markdown notes:

```bash
fitfo onboard example.com --vault ~/Obsidian/Clients
```

or save a default:

```bash
fitfo config set vault ~/Obsidian/Clients
```

### Local Defaults

FITFO can save local defaults in:

```text
~/.config/fitfo/config.json
```

Supported config keys:

- `vault`
- `location`
- `country`
- `format`
- `deep`
- `search`
- `crawlLimit`
- `searchLimit`
- `quiet`

Example:

```bash
fitfo config set location "Fort Myers, FL"
fitfo config set deep true
fitfo config set search false
fitfo config
```

Do not store API keys in FITFO config. Use environment variables or provider CLI auth.

## Common Commands

```bash
fitfo doctor
fitfo example.com
fitfo snapshot example.com
fitfo brief example.com --deep
fitfo brief example.com --deep --search --location "City, ST"
fitfo plan example.com --deep --search --location "City, ST"
fitfo onboard example.com
```

## Verification

Before opening, packaging, or publishing:

```bash
npm run check
npm test
npm run pack:dry-run
git status
```

## Public Release Setup Notes

For a first public GitHub release:

- keep `"private": true` in `package.json` unless npm publishing is intentionally part of the release
- do not commit `.env`, generated reports, table exports, Firecrawl state, real client notes, screenshots, or API keys
- use fake domains and fake report output in docs/examples
- make sure `fitfo doctor`, `npm run check`, and `npm test` pass

For npm publishing later:

- remove `"private": true`
- confirm the `files` allowlist contains the package contents
- run `npm run pack:dry-run`
- run `npm whoami`
- publish intentionally with `npm publish --access public`
