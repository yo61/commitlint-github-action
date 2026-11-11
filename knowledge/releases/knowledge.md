# Releases — knowledge (facts and patterns)

How a release of this action goes, as run for v7.0.0 and v7.1.0 on 2026-11-11. The design is in
[the decision record](../../decisions/2026-11-11-release-please-pins-image-on-release-pr.md).
Patterns shared with other repositories are in `yo61/global`'s `knowledge/releases/`.

## Cutting a release

1. A releasable commit (`feat`, `fix`, `perf`, `deps`, `revert`, `docs`, `refactor`, `build`)
   lands on `main`. `ci`, `chore`, `test` and `style` do not open a release PR.
2. The Release run opens or updates "chore(main): release X.Y.Z". In the same run `pin-prepare`,
   the `pin-build` matrix and `pin-commit` add `chore(release): pin image digest <12 hex>` on top.
3. Merge the release PR only when that pin commit is its newest commit and CI is green. Merged
   earlier, `verify` refuses to tag and the version is left without an image; release a patch.
4. On the merge commit, check every workflow, not just Release: Release, CI and Commitlint all run
   on it, and it is the one commit no PR check has seen.
5. `verify` logs, per architecture, `… (x86_64|aarch64) was built from <sha>, the released
   source` and the Node and commitlint versions; `publish` logs `tagged … as X.Y.Z and X` and
   `vX now points at <sha>`.

## What healthy looks like

- release-please logs a small `Considering: N commits` (2 after v7.0.0). The whole history means
  it lost its anchor on the latest GitHub Release.
- With no release PR open, `pin-prepare` logs `no open release PR; nothing to pin`.
- `ghcr.io/yo61/commitlint-github-action:X.Y.Z`, `:X` and the digest in `action.yml` on `main`
  are one index holding `linux/amd64` and `linux/arm64`, whose revision labels both name the
  release PR's release-please commit.

## Checking an image from a Mac

The image has no `darwin` variant; pass `--platform linux/amd64` or `linux/arm64` to
`docker pull` and `docker run`. To read an index without pulling:
`docker buildx imagetools inspect <ref> --format '{{json .Manifest}}'` (digest, platforms) and
`--format '{{json .Image}}'` (per-platform config, labels).
