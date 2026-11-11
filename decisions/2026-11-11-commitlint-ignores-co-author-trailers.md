## Decision: this repository's commitlint footer length rule skips `Co-authored-by` lines

`commitlint.config.mjs` turns off `footer-max-line-length` and replaces it with
`function-rules/footer-max-line-length`, which drops `Co-authored-by:` lines (case-insensitive)
from the footer and applies the 100-character limit to what remains (#22).

## Context: Commitlint failed on `main` for both release commits

v7.0.0 (`aab35a7`) and v7.1.0 (`8008080`) each failed the Commitlint workflow's push run on
`main` with `footer-max-line-length`. A release PR holds the pin commit, written by the
`semantic-release-pusher` App, so its squash commit gains a `Co-authored-by` trailer for the App
whose noreply address, `283137246+semantic-release-pusher[bot]@users.noreply.github.com`, makes
the line 110 characters. The PR's own checks lint its commits one by one and never see that
trailer. The v7.0.0 failure went unnoticed until v7.1.0 because only the Release workflow was
watched.

## Alternatives considered:

- **Raise the footer limit for everything.** Would let long `Refs:` or `BREAKING CHANGE:` lines
  through too; only the trailer is outside an author's control.
- **Squash with `PR_BODY` or `BLANK` instead of `COMMIT_MESSAGES`.** `COMMIT_MESSAGES` is the
  default for every repository in `yo61/github-repos` (`modules/github-repo/variables.tf`), and
  the release PR body is release-please's changelog, not a fit for a commit body.
- **Lint only pull requests, not pushes to `main`.** The push run is also the job that runs the
  action against its own history; dropping it to avoid one rule loses that.
- **Write the pin commit with `GITHUB_TOKEN`.** Its commits start no workflows, so the release PR
  would not run CI on the pinned image.

## Reasoning:

The trailer's length comes from the App's noreply address, which no author can shorten, so the
exemption is narrow and permanent. It follows the existing `function-rules/body-max-line-length`
rule beside it, which already exempts dependency-bump bodies the same way.

## Trade-offs accepted:

- A hand-written `Co-authored-by` line of any length passes.
- The two failed runs on `main` stay red; their commits are history.

## Supersedes: none
