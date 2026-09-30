#!/usr/bin/env bash
# The land-default-checkout journey for the credential-free publication
# substitute. Sourced by native-agent-publication.sh (copied beside it) with
# ${host}, ${journey} and ${workspace} (the default checkout the host runs in)
# set. Lands everything on the checkout the way the installed guidance
# describes: commit it all, reconcile with the fetched trunk, publish without
# force, and retire nothing. Records each command through the admission
# substitute's recorder and sets ${response}.
# shellcheck disable=SC2034,SC2154 # host, journey, workspace and response are shared with the sourcing substitute.

# shellcheck source=tests/support/native-agent-admission.sh
# shellcheck disable=SC1091
source "${0%/*}/native-agent-admission.sh"

native_land_default_substitute() {
  export GIT_AUTHOR_NAME='Publication Fixture' GIT_COMMITTER_NAME='Publication Fixture'
  export GIT_AUTHOR_EMAIL='publication-fixture@example.invalid'
  export GIT_COMMITTER_EMAIL='publication-fixture@example.invalid'
  admission_run git add -A
  admission_run git commit -qm 'Land default checkout changes'
  admission_run git fetch -q origin
  admission_run git rebase -q origin/main
  admission_run git push -q origin HEAD:refs/heads/main
  response="Committed everything on the default checkout, rebased it onto the fetched trunk and published it to remote trunk without force. Refresh was already current; cleanup is not applicable."
}
