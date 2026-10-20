Implemented the deterministic record producer for slice 3 in
`research/replacement.py`. It reads the precomputed research summaries and
prints the result JSON with the plan's six labels. Both reference and ablation
arms and the existing numbers are preserved.

proof:
  command: python3 research/replacement.py > research/replacement.json && python3 research/check_replacement.py
  covers: JSON/prose label consistency, both arms, all precomputed summary fields
  boundary: producer output research/replacement.json
  observations:
    - research/check_replacement.py compares prose label rows to the JSON dynamically
    - research/check_replacement.py compares all precomputed fields unchanged
    - research/check_replacement.py checks both arms and all five cost levels
  setup: research/precomputed.json supplies the existing research summaries
  result: pass

The expensive evaluator and admission-ledger calculation are existing inputs;
this report claims only the deterministic producer boundary. Narrative record
and materiality-assessment work remain with plan slices 4 and 5. The increment
is ready for acceptance.
