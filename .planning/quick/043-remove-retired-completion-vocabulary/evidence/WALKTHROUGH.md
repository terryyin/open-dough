# Quick 043 disposable Git walkthrough

Executed once on 2026-09-11. This records the original command and output;
recording it did not rerun the fixture.

```sh
python3 - <<'PY'
import subprocess, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory(prefix='wrap-up-043-') as d:
 p=Path(d)
 def git(*args): return subprocess.check_output(['git','-C',d,*args],text=True).strip()
 git('init','-q'); git('config','user.name','Fixture'); git('config','user.email','fixture@example.invalid')
 files={'BACKLOG.md':'# Product backlog\n\n## Taken\n\n- [Export nightly CSV](SEED.md#export-nightly-csv) — SEED-EXPORT\n\n## Backlog list\n', 'SEED.md':'# SEED-EXPORT\n\n## Export nightly CSV\n\nDeliver one CSV of posted invoices.\n\n## Retry exports\n\nPreserve this sibling story.\n', 'PLAN.md':'# Export nightly CSV\n\nSlice 1: done\n', 'PROOF.md':'Posted invoices appear in the delivered CSV.\n', 'PRODUCT.md':'Nightly billing export writes one CSV of posted invoices.\n'}
 for name,content in files.items(): (p/name).write_text(content)
 git('add','.'); git('commit','-qm','Preserve closure inputs'); before=git('rev-parse','HEAD')
 (p/'BACKLOG.md').write_text(files['BACKLOG.md'].replace('- [Export nightly CSV](SEED.md#export-nightly-csv) — SEED-EXPORT\n',''))
 assert all((p/n).read_text()==files[n] for n in ['SEED.md','PLAN.md','PROOF.md'])
 print('PASS standalone backlog removal preserves seed, plan, proof')
 (p/'SEED.md').write_text('# SEED-EXPORT\n\n## Retry exports\n\nPreserve this sibling story.\n')
 for n in ['PLAN.md','PROOF.md']: (p/n).unlink()
 git('add','-A'); git('commit','-qm','Close selected story')
 assert 'Export nightly CSV' not in (p/'BACKLOG.md').read_text()
 assert 'Export nightly CSV' not in (p/'SEED.md').read_text()
 assert (p/'PRODUCT.md').read_text()==files['PRODUCT.md']
 assert 'Preserve this sibling story.' in (p/'SEED.md').read_text()
 assert all(not (p/n).exists() for n in ['PLAN.md','PROOF.md'])
 assert not git('status','--porcelain')
 assert all(git('show',f'{before}:{n}')==files[n].strip() for n in files)
 print('PASS committed closure removes selected active entry and spent material, preserves product knowledge and sibling, and recovers originals using git show')
PY
```

Observed result: exit code 0.

```text
PASS standalone backlog removal preserves seed, plan, proof
PASS committed closure removes selected active entry and spent material, preserves product knowledge and sibling, and recovers originals using git show
```

This is source-authoring and Git-mechanism evidence. The fixture explicitly
applies the walkthrough's edits; it does not execute the skill through a native
host or prove that a host independently chooses them. It covers a completed
planned feature in Taken, sibling and product preservation, standalone entry
removal, final committed state, and before-cleanup recovery. Shared process-log
cleanup, link repair, follow-up queueing, and worktree cleanup retain their
existing instructions; this fixture makes no execution claim for those paths.
The temporary repository was automatically removed after assertions passed.
