# Security Notes

## Dependency Review

Reviewed: 2026-07-27

`path-to-regexp` is pinned through the root npm override to 8.4.0, the patched version for the reported ReDoS advisories.

`npm audit` still reports `postcss` and `sharp` through `next@16.2.12`, with no compatible automated fix published by the dependency tree. Their current reachable surface is constrained as follows:

- The application accepts no user-supplied CSS, and PostCSS only runs during the trusted build process.
- Next image optimization is disabled. Uploaded images are limited to authenticated administrators, 5 MB, approved MIME types, and matching image signatures before they are served statically.

Re-run `npm audit --omit=dev --audit-level=high` when upgrading Next.js and at least monthly. Remove these mitigations only after verifying the replacement path does not reintroduce vulnerable image or CSS processing.
