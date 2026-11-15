#!/usr/bin/env bash
# Credential-free admission continuation journey and its rejected cases.
set -euo pipefail
exec "${BASH}" "$(dirname -- "${BASH_SOURCE[0]}")/git-publication-native-admission.sh" continuation
