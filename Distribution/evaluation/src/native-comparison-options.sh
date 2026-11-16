#!/usr/bin/env bash
# Maintainer comparison command options; execution and evidence keep their owners.
# shellcheck disable=SC2034,SC2154,SC2312 # Sourced command globals and usage.
host='' case_name='' results_dir='' model=gpt-6.1-sol effort=xhigh deadline=2400 list=false recover=''
where=() native_comparison_pair_baseline='' native_comparison_pair_candidate=''
native_comparison_pair_factor='' native_comparison_pair_gain='' native_comparison_pair_quality=''
native_comparison_pair_arms=concurrent native_comparison_pair_repository=${source_dir}
save_baseline='' export_baseline='' assess_baseline='' baseline_arm=baseline
reuse_baseline='' fresh_pair=false require_usage=false
while (($#)); do
  case $1 in
    --list) list=true && shift && continue ;;
    --fresh-pair) fresh_pair=true && shift && continue ;;
    --require-usage) require_usage=true && shift && continue ;;
    --native | --case | --results-dir | --model | --effort | --deadline | --where | --baseline | \
      --candidate | --factor | --gain | --quality | --arms | --payload-repo | --recover | \
      --save-baseline | --export-baseline | --assess-baseline | --arm | --reuse-baseline)
      [[ $# -ge 2 && -n $2 ]] || usage
      ;;
    *) usage ;;
  esac
  case $1 in
    --native) host=$2 ;;
    --case) case_name=$2 ;;
    --results-dir) results_dir=$2 ;;
    --model) model=$2 ;;
    --effort) effort=$2 ;;
    --deadline) deadline=$2 ;;
    --where) where+=("$2") ;;
    --baseline) native_comparison_pair_baseline=$2 ;;
    --candidate) native_comparison_pair_candidate=$2 ;;
    --factor) native_comparison_pair_factor=$2 ;;
    --gain) native_comparison_pair_gain=$2 ;;
    --quality) native_comparison_pair_quality=$2 ;;
    --arms) native_comparison_pair_arms=$2 ;;
    --payload-repo) native_comparison_pair_repository=$2 ;;
    --recover) recover=$2 ;;
    --save-baseline) save_baseline=$2 ;;
    --export-baseline) export_baseline=$2 ;;
    --assess-baseline) assess_baseline=$2 ;;
    --arm) baseline_arm=$2 ;;
    --reuse-baseline) reuse_baseline=$2 ;;
    *) usage ;;
  esac
  shift 2
done
# Any pair option selects pair mode.
pair_options=${native_comparison_pair_baseline}${native_comparison_pair_candidate}
pair_options+=${native_comparison_pair_factor}${native_comparison_pair_gain}${native_comparison_pair_quality}
[[ ${baseline_arm} =~ ^(baseline|candidate)$ ]] || usage
