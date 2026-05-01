# Public Release Checklist

FITFO can stay private while this checklist hardens the project for a later public release.

## Before Opening The Repository

- [ ] Run `fitfo onboard` against 10-20 real domains and convert misses into fixtures.
- [ ] Review all docs for client names, private paths, screenshots, report output, or local-only details.
- [ ] Confirm `.gitignore` excludes generated reports, table exports, `.env`, Firecrawl local state, and Obsidian/client notes.
- [ ] Add fake/demo examples only.
- [ ] Confirm `npm test`, `npm run check`, `npm run pack:dry-run`, and GitHub Actions pass.
- [ ] Decide whether the first public version is still `0.1.0` or a new `0.2.0`.
- [ ] Confirm `private` package.json posture before any npm release.
- [ ] Add a clear README warning that FITFO is best-effort public reconnaissance, not proof of ownership.

## Public Project Readiness

- [x] Issue templates exist for bug reports, provider misses, and feature requests.
- [x] Security policy tells users not to send credentials or private client reports.
- [x] Contributing guide explains fixture-driven provider improvements.
- [ ] Changelog explains the initial public feature set.
- [ ] Example output uses fake domains and fake client data.

## Good First Public Issues

- Add provider fixtures for missed real-world DNS/hosting patterns.
- Improve `fitfo onboard` save-flow wording.
- Add more hosted-builder and CRM detection fixtures.
- Improve local SEO/service-area recommendations from real scans.
- Add compact terminal report mode.
