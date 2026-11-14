#!/usr/bin/env bash
# Credential-free one-shot workspace selection and landing journeys and counterexamples.
set -euo pipefail
exec "${BASH}" "$(dirname -- "${BASH_SOURCE[0]}")/git-publication-native-one-shot.sh" workspaces
