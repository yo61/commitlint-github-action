## Decision: release with release-please, building the image on the release PR so the release commit already pins its digest

`.github/workflows/release.yml` runs release-please on every push to `main`. While a release PR is
open, `pin-image` brings its branch up to date with `main`, builds the image from it with an
`org.opencontainers.image.revision` label naming the commit, pushes it to
`ghcr.io/yo61/commitlint-github-action:release-pr`, and commits its digest to `action.yml` on that
branch. Merging the PR creates `vX.Y.Z`; `publish` then tags the pinned digest `X.Y.Z` and `X` with
`docker buildx imagetools create`, which copies the manifest without rebuilding, and moves the git
tag `vX` to the release. `publish-image.yml`, `commit-and-tag-version` and `.versionrc.json` are
removed.

## Context: the Node 26 bump (#15) merged with no way to ship it

- `action.yml` pins the image by digest (`fae6c5c`), so downstream users pinning the action by
  commit SHA cannot have the image swapped under them.
- A git tag cannot contain the digest of the image its own push builds. `publish-image.yml` built on
  tag push, so each release took two tags: v6.3.0 published the image, v6.3.1 pinned it.
- `commit-and-tag-version` was broken by the digest pin: `.github/tasks/actionYamlUpdater.js` looked
  for `X.Y.Z` in `runs.image` and would throw on a digest. It had not been run since the fork;
  `package.json` said 6.3.0 while the latest tag was v6.3.1.

## Alternatives considered:

- **Pin by tag again** (`image: docker://…:X.Y.Z`, bumped by an `x-release-please-version` marker).
  Simplest, but reverses `fae6c5c`: a tag can be repointed after release.
- **Release first, pin after.** Leave the build on the tag and have a bot PR pin the digest. Every
  release would ship the previous release's image.
- **Build from the Dockerfile at run time** (`image: Dockerfile`), as upstream once did. No pin to
  manage, but every workflow run downstream builds the image, and nothing pins what it builds.

## Reasoning:

Building on the release PR breaks the loop: by the time the release commit exists, the image it
pins is already in the registry, so one tag is one release. It reuses two shapes already running
elsewhere: the `sync-lockfile` job (jobhound, unifictl, yotool, python-template, gh-release-stats)
that commits to the release PR branch with `createCommitOnBranch` so the commit is signed for the
`required_signatures` rule, and record-action's step that moves the major tag.

release-please rewrites its branch only when the release notes change. A hidden-type commit on
`main` (a Dependabot `chore(deps)` bump of the Dockerfile or lockfile, a Renovate `ci` bump) leaves
the branch, and so a pin built from older source, in place, while the squash-merge would release the
newer source. So `pin-image` runs on every push to `main`, not only when release-please reports a
PR, and merges `main` into the release branch with the update-branch API when the branch lacks it;
GitHub signs that merge commit. Once the branch contains `main`, its tree is what the squash-merge
produces, so the image is built from the source being released. It skips the build only when the
branch already contains `main` and ends in its pin commit, since a rebuild of the same source would
yield a new digest for nothing.

`publish` checks before tagging anything. The release commit must change `action.yml`, which it does
not if the PR was merged before `pin-image` committed. The pinned image's revision label must name a
commit whose tree matches the release commit everywhere except `action.yml`, which catches a merge
landing between a push to `main` and the rebuild it triggers.

## Trade-offs accepted:

- Every push to `main` while a release PR is open rebuilds and pushes the image and adds a merge
  commit to the release branch. Earlier builds stay in ghcr.io untagged.
- A release PR merged before its current pin lands fails `publish` and needs a follow-up patch
  release; nothing stops the merge itself. The git tag and GitHub Release exist by then, so that
  version is left without an image.
- The first release is forced with `"release-as": "7.0.0"`, since everything after v6.3.1
  (including the Node 26 bump, a `build:` commit) is a type release-please does not release. It must
  be removed once v7.0.0 is out, or every later release PR asks for 7.0.0 again.
- `build` commits are shown in the changelog here, unlike the other repos: for a Docker action the
  runtime and its build are what users get.

## Supersedes: none
