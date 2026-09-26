#!/usr/bin/env bash
# Journey prompt, authority, and fixture-kind selection for publication native runs.
# shellcheck disable=SC2154 # Fixture and runner globals are supplied by the sourcing runner.

git_publication_prompt_for() {
  local journey=$1
  case ${journey} in
    startup-trunk | startup-story-branch | startup-selected-source)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance to execute queued Story A (SEED-A#a) in ${git_publication_fixture_startup_mode} mode. The originating and integration checkout is ${git_publication_fixture_integration}; the authorized owned execution workspace is ${git_publication_fixture_workspace} on local branch exec/native-startup. Remote origin trunk is refs/heads/main. You have explicit authority to select that workspace and publish this claim to remote trunk. Your stable execution publisher ID is native-startup-${journey}. Preserve existing local changes. Follow the project's preparation gate before implementing Story A as a new feature.txt containing 'implemented'. Report the outcome."
      ;;
    startup-claim-race | startup-resume)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance to resume authorized queued Story A (SEED-A#a) in Trunk Mode. The originating and integration checkout is ${git_publication_fixture_integration}; the retained owned execution workspace is ${git_publication_fixture_workspace} on branch exec/native-startup, starting revision ${git_publication_fixture_starting_sha}, candidate ${git_publication_fixture_candidate_sha}. Remote origin trunk is refs/heads/main. Your stable publisher ID is native-startup-${journey}; you have authority for this workspace and remote claim publication. Another writer may have advanced trunk. Verify ownership through the installed startup boundary, preserve local work, and start implementation only if this execution owns the accepted claim and project setup succeeds. If allowed, implement Story A as feature.txt containing 'implemented'. Report the outcome."
      ;;
    admission-*)
      git_publication_admission_prompt "${journey}"
      ;;
    local-only)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. In the owned workspace at this checkout, retain the authorized verified increment under explicit local-only authority. Do not publish to the remote. Preserve any pending human edit on the separate default checkout. Report the local retention and that publication remains pending."
      ;;
    claim-race)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. Attempt to take and publish a queued claim from this owned workspace. Another checkout may already hold a published claim. Observe claim ownership before implementation, preserve pending human edits elsewhere, and report a recoverable conflict when ownership is not yours."
      ;;
    uncertain-recovery)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. Resume publication of the retained candidate in this owned workspace after an uncertain prior response. Another writer may have advanced the remote. Check whether the candidate is already accepted in remote history before pushing again. Preserve pending human edits on the default checkout."
      ;;
    preparation)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. Publish the retained preparation result from this owned workspace onto the authorized remote trunk. A pending human edit exists on the separate default checkout; leave it untouched and report maintenance separately from remote acceptance."
      ;;
    trunk-closure)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. Close Trunk Mode work by publishing the owned candidate from this workspace to remote trunk before local cleanup. Preserve pending human edits on the default checkout. Report remote acceptance and deferred maintenance."
      ;;
    story-branch-closure)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. Close Story Branch work by publishing a history-preserving candidate from this owned workspace onto remote trunk. Preserve pending human edits on the default checkout. Report remote acceptance."
      ;;
    story-branch-increment)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. Publish the validated first Story Branch increment at this owned workspace's current HEAD to the authorized remote origin and target branch exec/story. That target branch does not exist yet. Leave remote trunk and the separate default checkout unchanged, and report the accepted revision."
      ;;
    bug-disposition)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. With explicit keep authority, publish the durable bug-triage record from this owned workspace. Preserve pending human edits on the default checkout. Report remote acceptance."
      ;;
    *)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. From this owned workspace, publish the verified unpublished candidate onto the authorized remote trunk. A separate default checkout holds a pending human edit; do not stage, reset, stash, or include that edit. Report whether the remote accepted the candidate and that local maintenance is separate."
      ;;
  esac
}

git_publication_authority_for() {
  case $1 in
    local-only) printf 'local-only\n' ;;
    *) printf 'publish\n' ;;
  esac
}

git_publication_create_fixture_for() {
  local journey=$1
  local parent=${2:-${TMPDIR:-/tmp}}
  case ${journey} in
    startup-*) git_publication_fixture_create_startup "${source_dir}" "${journey}" "${parent}" ;;
    admission-*)
      git_publication_fixture_create_admission "${source_dir}" "${journey}" "${parent}"
      ;;
    claim-race) git_publication_fixture_create_claim_race "${parent}" ;;
    uncertain-recovery)
      git_publication_fixture_create_uncertain_recovery "${parent}"
      ;;
    *) git_publication_fixture_create_publish_boundary "${parent}" ;;
  esac
}
