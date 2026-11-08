#!/usr/bin/env bash
# Acquire the pinned Node for the hosted Ubuntu x64 jobs. The npm cache restore
# shares the one-minute deadline where enabled. Each source gets one attempt.
set -euo pipefail
version=$(< "$1")
if [[ ! ${version} =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "::error::Expected an exact Node version in $1."
  exit 1
fi
now=$(($(date +%s) * 1000))
deadline=${OPEN_DOUGH_NODE_DEADLINE_MS:-$((now + 60000))}
remaining=$(((deadline - now) / 1000))
if ((remaining <= 0)); then
  echo '::error::Node acquisition deadline expired before download.'
  exit 1
fi

timeout --signal=KILL "${remaining}s" bash -euo pipefail -s -- "${version}" << 'NODE'
version=$1
use_node() {
  [[ $("$1/bin/node" --version) == "v${version}" ]] || return 1
  printf '%s\n' "$1/bin" >> "${GITHUB_PATH}" || return 1
  printf 'Using Node v%s from %s.\n' "${version}" "$2"
}
cached=${RUNNER_TOOL_CACHE:-}/node/${version}/x64
if [[ -n ${RUNNER_TOOL_CACHE:-} && -f ${cached}.complete ]] && use_node "${cached}" 'the runner tool cache'; then
  exit 0
fi

scratch=$(mktemp -d)
trap 'rm -rf -- "${scratch}"' EXIT
download() {
  curl --fail --silent --show-error --location --connect-timeout 5 --retry 0 "$@"
}
if release_url=$(download --max-time 5 'https://raw.githubusercontent.com/actions/node-versions/main/versions-manifest.json' \
  | jq -er --arg version "${version}" '
      .[] | select(.version == $version) | .files[]
      | select(.platform == "linux" and .arch == "x64")
      | .download_url | select(startswith("https://github.com/actions/node-versions/releases/download/"))
    ') \
  && download --max-time 15 --output "${scratch}/node.tar.gz" "${release_url}"; then
  mkdir -p "${RUNNER_TEMP}/node-github"
  if tar -xzf "${scratch}/node.tar.gz" --strip-components=1 -C "${RUNNER_TEMP}/node-github" \
    && use_node "${RUNNER_TEMP}/node-github" 'GitHub Releases'; then
    exit 0
  fi
fi

echo '::warning::GitHub Node acquisition failed; trying the official Node.js distribution.'
base=https://nodejs.org/dist/v${version}
archive=node-v${version}-linux-x64.tar.xz
download --max-time 5 --output "${scratch}/SHASUMS256.txt" "${base}/SHASUMS256.txt"
download --max-time 20 --output "${scratch}/${archive}" "${base}/${archive}"
(cd -- "${scratch}" && awk -v archive="${archive}" '$2 == archive' SHASUMS256.txt | sha256sum --check)
mkdir -p "${RUNNER_TEMP}/node-official"
tar -xJf "${scratch}/${archive}" --strip-components=1 -C "${RUNNER_TEMP}/node-official"
use_node "${RUNNER_TEMP}/node-official" 'nodejs.org'
NODE
