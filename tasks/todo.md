# Content Configuration Tasks

- [ ] Define the additive content contract and validation.
  - Acceptance: media fields are type-safe and server validated.
  - Verify: `npx tsc --noEmit`.
  - Files: `lib/cms-content.ts`, `app/api/admin/content/route.ts`.

- [ ] Make the homepage consume configured media.
  - Acceptance: about and timeline images are editable content.
  - Verify: `npm run build` and browser check.
  - Files: `lib/cms-content.ts`, `components/home-page.tsx`, `components/animated-timeline.tsx`.

- [ ] Make subpage templates consume configured media.
  - Acceptance: template-specific images resolve from each page media map.
  - Verify: `npm run build` and browser check.
  - Files: representative page templates and `components/subpage-shell.tsx`.

- [ ] Complete admin coverage for all homepage and page fields.
  - Acceptance: every persisted field has a form or media editor.
  - Verify: authenticated save and refresh.
  - Files: `components/admin-content-resource.tsx` and relevant admin routes.

- [ ] Run final quality checks and review the staged diff.
  - Acceptance: lint, types, build, browser flow, and security scan pass.
  - Verify: project commands and DevTools.
  - Files: all changed files.
