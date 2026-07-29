# Implementation Plan: Site Content Configuration

## Overview

Extend the existing versioned `SiteContent` bundle instead of adding parallel CMS tables. The admin UI edits the bundle and each page template consumes configuration-owned text, links, lists, and media paths.

## Architecture Decisions

- Keep the existing `home` and `subpages` records and optimistic concurrency versions.
- Add optional, backward-compatible media fields to content types; old saved content keeps rendering through defaults.
- Use a named `media` map on subpages for template-specific images. This prevents route-specific database schema and keeps media validation centralized.
- Keep all images local to `/media/`; uploads continue through the authenticated media API.

## Task List

### Phase 1: Content Contract

- [ ] Task 1: Add configurable media fields and centralized validation.
  - Acceptance: legacy content normalizes to valid defaults; invalid media maps are rejected.
  - Verify: type check and content API request validation.

- [ ] Task 2: Connect all page templates to configured media.
  - Acceptance: changing a configured media key changes the corresponding rendered image without code changes.
  - Verify: production build and browser screenshots for home and representative subpages.

### Checkpoint: Content Rendering

- [ ] Existing routes render with legacy/default content.
- [ ] Frontend receives no static media requirement for configurable slots.

### Phase 2: Admin Editing

- [ ] Task 3: Expose every homepage section and image in the existing admin resource.
  - Acceptance: all persisted homepage fields have an editable control.
  - Verify: authenticated edit, save, refresh, and conflict handling.

- [ ] Task 4: Expose page module items and named media in page management.
  - Acceptance: every subpage field and configured media key is editable with preview/upload support.
  - Verify: authenticated edit of a page and front-end refresh.

### Checkpoint: End-to-End

- [ ] Admin can alter menus, page text, and images without source changes.
- [ ] Type check, lint, build and browser checks pass.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Existing database content lacks new fields | Normalize optional fields to compatibility defaults. |
| Concurrent administrator saves | Preserve the existing version checks and 409 reload response. |
| Media path abuse | Reject non-local paths at the API boundary. |
| Existing local design changes | Preserve and build on the current worktree changes. |
