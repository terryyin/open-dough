# Reproducing CI's platform

When a check fails only on CI, or a runner or trap change needs CI's Bash and
Git, check it on CI's platform:

```sh
scripts/ci-container.sh tests/test-runner-bash.sh   # chosen checks
scripts/ci-container.sh                             # the whole suite
scripts/ci-container.sh --dashboard                 # dashboard type-check and browser suite
```

It is for diagnosis only: neither `npm test` nor CI uses it, and ordinary runs
stay native. It needs `docker` on `PATH` (for example Colima on macOS) with a
reachable daemon, and otherwise stops naming the unavailable runtime before
any image work. On first use it builds a cached image from CI's Ubuntu with
Git from the `git-core` PPA, `jq`, CI's Node, and the locked Playwright
Chromium with its system dependencies and the hosted Ubuntu font families.
The script states the Ubuntu and Node versions and shared dashboard checks
once, and `tests/ci-container.sh`
checks them against `.github/workflows/ci.yml`, separately from the image's
system-dependency bootstrap. Native CI installs only the locked Chromium
browser, using the runner's existing system libraries. The image tag follows the
build recipe, so a new Ubuntu, Node, Playwright version or font package list
builds a new image; installed versions are fixed at build. A rebuild reuses
Docker's build
cache, which cannot be pruned per image, so to refresh them remove the image
and prune all of Docker's build cache, every project's; the next run rebuilds:

```sh
docker image rm $(docker image ls -q open-dough-ci) && docker builder prune
```

Each run mounts the checkout, and a linked worktree's common Git directory, at
their host paths, keeps `node_modules` in a container volume so host modules
are neither used nor overwritten, runs `npm ci`, prints the Git and Node
versions, and then runs `scripts/test.sh` with the given paths, or the
dashboard type-check and browser suite unsharded with `CI=true` (so Playwright's
`forbidOnly` and HTML report apply). `scripts/test.sh` runs with `CI` unset,
as on any local run. A path or caller directory outside the checkout is
refused by name. It runs as the host user with a container-local `HOME`, so
files it writes in the checkout stay yours. The image uses the host's native
architecture, which may differ from CI's x86_64.

## Hosted fonts and layout checks

The recipe explicitly installs the font packages published for the hosted
Ubuntu image. Playwright's `--with-deps` supplies browser dependencies, including
some fonts, but alone does not reproduce the hosted `system-ui` fallback.

The baseline is runner image `20261101.360.1`, release
[`ubuntu24/20261101.360`](https://github.com/actions/runner-images/releases/tag/ubuntu24/20261101.360),
used by DD-435's failing run 42379612785 and still used by successful main run
42725263249 on 2026-11-10. Its
[published SBOM](https://github.com/actions/runner-images/releases/download/ubuntu24/20261101.360/sbom.ubuntu-24.04.json.zip)
(`sbom.json`, package names beginning `fonts-`, `xfonts-` or `ttf-`) lists:

| Packages | Baseline versions |
| --- | --- |
| `fonts-dejavu`, `fonts-dejavu-core`, `fonts-dejavu-extra`, `fonts-dejavu-mono` | `2.37-8` |
| `fonts-lato` | `2.015-1` |
| `fonts-liberation` | `1:2.1.5-3` |
| `fonts-noto-color-emoji` | `2.047-0ubuntu0.24.04.1` |
| `fonts-ubuntu-console` | `0.869+git20240321-0ubuntu1` |

On native arm64, the diagnostic image's installed versions matched that
inventory. Chromium 153.0.8010.12, installed by locked Playwright 1.63.0,
rendered the normal dashboard `system-ui, sans-serif` stack with DejaVu Sans.
The actual historical specs reproduced both DD-435 faults at the 320×256
viewport: `0332f824ae60b9741732ba2c83e0db505645a805` overflowed by 2 CSS pixels
and `d146a05d95f62810da79bf653e5f0f98fa58fefc` by 26. The repaired journey at
`c6467c3811f5f0e016e5867a3399b73991988c1a` passed both zoom steps with zero overflow, whole words and keyboard traversal,
both with normal typography and with its retained Verdana injection.

The Verdana overrides remain useful stress coverage on native macOS. Linux
need not have Verdana: that override resolved to Liberation Sans in the tested
image. Font-parity acceptance therefore separately removes only the injection
in a disposable observation; it does not change the maintained specs.

To refresh or investigate the contract:

1. Read the actual hosted job's runner-image version and release link from its
   setup log. Download that release's SBOM and independently compare its font
   packages with the list above. A moving `ubuntu-24.04` label is insufficient.
2. Update the existing apt recipe in `scripts/ci-container.sh` and the independent
   source-attributed expectation in `tests/ci-container.sh` when that inventory
   changes. Run `bash scripts/test.sh tests/ci-container.sh`. The test captures
   the Dockerfile consumed by a substitute runtime; it needs no daemon or
   network. Removing a required font must fail it. Changing the recipe changes
   the image tag; an unchanged recipe reuses the cached image. For newer package
   versions under an unchanged recipe, use the image/build-cache refresh above.
3. Inspect the rebuilt image with `dpkg-query -W 'fonts-*' 'xfonts-*' 'ttf-*'`,
   `fc-list : family` and `fc-match system-ui`. Extra Playwright dependency fonts
   are acceptable when they do not change the observed fallback/layout. Package
   presence and fontconfig output alone do not prove Chromium's selection.
4. Replay the historical snapshots using their real CSS, lockfile and specs:
   the first uses `dashboard/tests/intent-ci-proof.spec.ts`, the second uses
   `dashboard/tests/intent/intent-ci-proof.spec.ts`. In the helper's built image,
   with its same user, checkout/common-Git mounts and isolated npm volumes, run
   `CI=true npx playwright test --config dashboard/playwright.config.ts <spec-path> --grep 'at 200% zoom' --workers=1`.
   This is a direct in-image observation, not an extra helper option. Both
   historical specs have no font injection. Observe the original overflow
   assertion, computed stack, viewport and Chromium's actual font (for example
   CDP `CSS.getPlatformFontsForNode`). An unrelated test failure is no replay.
5. Check the repaired current journey with its normal stack and its retained
   injection, removing the injection only in an owned disposable copy. Restore
   scratch edits afterwards. Finally run `scripts/ci-container.sh --dashboard`
   to cover all dashboard consumers of the image's system fonts. Apply the
   [local resource and sleep policy](local-test-resources.md) to long runs.

This is observed fallback/layout parity for these journeys, not pixel-identical
rendering or a promise to reproduce every hosted-platform difference. The
helper stays on the host's native architecture. Do not add architecture
emulation to chase rendering: the earlier `linux/amd64` QEMU experiment crashed
Chromium. For other hosted-only failures, inspect CI's retained Playwright report
and trace in `dashboard-playwright-report-<shard>`.
