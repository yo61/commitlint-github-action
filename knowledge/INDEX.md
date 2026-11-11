# Knowledge index

Routes to this repository's knowledge folders. Each domain holds `knowledge.md` (facts and
patterns) and, when there are any, `hypotheses.md` (need more data) and `rules.md` (confirmed
three or more times; apply by default). Knowledge that spans repositories is in `yo61/global`'s
`knowledge/`.

- [releases](releases/knowledge.md) — cutting a release with release-please and the pinned
  multi-arch image, and what a healthy run logs.

## Decisions

Decisions live in [`../decisions/`](../decisions/).

- `2026-11-11-release-please-pins-image-on-release-pr.md` — release-please builds the image on the
  release PR and pins its digest there; amended the same day for linux/arm64.
- `2026-11-11-commitlint-ignores-co-author-trailers.md` — the footer length rule skips
  `Co-authored-by` lines, which release commits gain from the App.
