#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2310,SC2312 # SC2034: force and replace_verified are read by install_payload.
# The payload is every file under Distribution/src/skills/; this line marks
# the release as directory-format data for open-dough-payload-inventory.sh.
open_dough_payload_format=directory
source "$(dirname -- "${BASH_SOURCE[0]}")/Distribution/src/install/open-dough-install-entry.sh"
