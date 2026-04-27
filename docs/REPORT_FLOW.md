# Report Flow

FITFO should feel organized from the first domain prompt to the first client call.

## Current Flow

```text
domain input
  -> scan
    -> domain / RDAP
    -> DNS / email / subdomains
    -> HTTP / redirects / TLS / CMS / marketing tags
  -> scan report
    -> verdict
    -> plain English
    -> track-this-down checklist
    -> raw records
    -> previous developer request
  -> brief report
    -> first-call confirmations
    -> research queue
    -> opportunities to inspect
    -> client questions
```

## Report Modules

- `src/report.js` is the public report export surface.
- `src/report/scan.js` renders the technical onboarding scan in terminal text and Markdown.
- `src/brief.js` renders the first-call prep brief in terminal text and Markdown.

This keeps the default scan focused on access and infrastructure while giving deeper research its own lane.

## Future Report Modules

Likely next modules:

- `brief/seo`
- `brief/content`
- `brief/conversion`
- `brief/local`
- `brief/competitors`
- `exports/obsidian`

Do not add a plugin system until these report types have real use.
