# Reproducing CI's platform

When a check fails only on CI, or a runner or trap change needs CI's Bash and
Git, check it on CI's platform:

```sh
scripts/ci-container.sh tests/test-runner-bash.sh   # chosen checks
scripts/ci-container.sh                             # the whole suite
scripts/ci-container.sh --dashboard                 # the dashboard job
```

It is for diagnosis only: neither `npm test` nor CI uses it, and ordinary runs
stay native. It needs `docker` on `PATH` (for example Colima on macOS) with a
reachable daemon, and otherwise stops naming the unavailable runtime before
any image work. On first use it builds a cached image from CI's Ubuntu with
Git from the `git-core` PPA, `jq`, CI's Node, and the locked Playwright
Chromium with its system dependencies. The script states the Ubuntu and Node
versions and shared dashboard checks once, and `tests/ci-container.sh`
checks them against `.github/workflows/ci.yml`, separately from the image's
system-dependency bootstrap. Native CI installs only the locked Chromium
browser, using the runner's existing system libraries. The image tag follows the
build recipe, so a new Ubuntu, Node, or Playwright version builds a new image;
Git and Node releases are fixed at build. A rebuild reuses Docker's build
cache, which cannot be pruned per image, so to refresh them remove the image
and prune all of Docker's build cache, every project's; the next run rebuilds:

```sh
docker image rm $(docker image ls -q open-dough-ci) && docker builder prune
```

Each run mounts the checkout, and a linked worktree's common Git directory, at
their host paths, keeps `node_modules` in a container volume so host modules
are neither used nor overwritten, runs `npm ci`, prints the Git and Node
versions, and then runs `scripts/test.sh` with the given paths, or the
dashboard job's commands unsharded with `CI=true` (so Playwright's
`forbidOnly` and HTML report apply). `scripts/test.sh` runs with `CI` unset,
as on any local run. A path or caller directory outside the checkout is
refused by name. It runs as the host user with a container-local `HOME`, so
files it writes in the checkout stay yours. The image uses the host's native
architecture, which may differ from CI's x86_64.

Font-dependent layout is not reproduced: with `15362af`'s layout fix reverted,
CI failed two 320 CSS pixel checks by a fraction of a pixel (`toBeInViewport`
ratios of 0.99) that `--dashboard` passed on an aarch64 host, and the image
run as `linux/amd64` under QEMU crashed Chromium. For such a failure, CI's
retained trace (`dashboard-playwright-diagnostics`) is the evidence.
