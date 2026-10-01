#!/usr/bin/env bash
# Credential-free one-shot result, escalation and review journeys and counterexamples.
set -euo pipefail
exec "${BASH}" "$(dirname -- "${BASH_SOURCE[0]}")/git-publication-native-one-shot.sh" results
