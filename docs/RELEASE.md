# Release Notes

FITFO is private today and intended to become public later.

## Current Release Posture

- Package version: `0.1.0`
- License: `GPL-2.0-or-later`
- npm publish blocked by `"private": true`
- Default branch: `master`
- CI: `npm run check` and `npm test` on Node 20 and 22

## Before First Public GitHub Release

- Confirm repo visibility can change from private to public.
- Review README language for client-safe phrasing.
- Review issue templates and security policy.
- Confirm no client report files, `.env` files, or scan outputs exist in git history.
- Run:

```bash
npm run check
npm test
git status
```

## Before First npm Release

- Remove `"private": true` only when ready to publish.
- Confirm the `files` allowlist contains everything needed:
  - `bin`
  - `src`
  - `README.md`
  - `LICENSE`
  - `CHANGELOG.md`
- Add a package access decision:

```bash
npm publish --access public
```

## Versioning

Before `1.0.0`:

- Patch: bug fixes, scanner fingerprints, copy polish, docs.
- Minor: new commands, new export formats, new scanner categories.
- Major: wait for stable public behavior.

## Release Checklist

- Update `CHANGELOG.md`.
- Bump `package.json` version.
- Run checks and tests.
- Tag release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

- Create GitHub release from the tag.
- Publish to npm only after the package is no longer private.
