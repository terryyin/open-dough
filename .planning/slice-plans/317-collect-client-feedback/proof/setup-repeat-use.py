"""Supply repeat-use facts in local repositories; perform no maintenance decisions."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys
source = Path(__file__).resolve().parents[4]
prior, root = map(lambda p: Path(p).resolve(), sys.argv[1:3])
root.mkdir(parents=True, exist_ok=False)
projects = [('open-dough', 'main'), ('alpha', 'main'), ('beta', 'master')]
def git(path, *args):
    return subprocess.check_output(['git', '-C', str(path), *args], text=True).strip()
def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
def append(path, text):
    with path.open('a') as stream:
        stream.write(text)
for name, branch in projects:
    subprocess.run(['git', 'clone', '-q', '--bare', str(prior/f'{name}.git'), str(root/f'{name}.git')], check=True)
    subprocess.run(['git', 'clone', '-q', str(root/f'{name}.git'), str(root/name)], check=True)
    git(root/name, 'config', 'user.name', 'Fixture maintainer')
    git(root/name, 'config', 'user.email', 'fixture@example.invalid')
od = root/'open-dough'
for name in ['collect-client-feedback', 'reconcile-retrospective-findings', 'triage-retrospective-findings']:
    shutil.rmtree(od/f'.agents/skills/{name}')
    shutil.copytree(source/f'.agents/skills/{name}', od/f'.agents/skills/{name}')
# This is the existing installed runtime plus current source handoff, not a release.
shutil.rmtree(od/'src/skills')
shutil.copytree(source/'src/skills', od/'src/skills')
write(od/'response-guidance.md', '''# Shared response guidance
Approval: Ask for a fresh approval even when maintenance publication is authorized.
Unused: Repeat the adoption checklist on every pass.
Unknown: Reconstruct old evidence after every pause.
Failed: A completed checklist need not be retained; rerun it after interruption.
Unreleased: Repeat the formatting check after every unchanged slice.
Historical: Leave the generated preview locator implicit.
''')
git(od, 'add', '-A'); git(od, 'commit', '-qm', 'Supply earlier response mechanism')
git(od, 'tag', 'v0.1.0')
write(od/'response-guidance.md', '''# Shared response guidance
Approval: Explicit authorization includes maintenance publication; do not ask again.
Unused: Reuse an unchanged recorded adoption checklist.
Unknown: Retain evidence locators across pauses.
Failed: Retain the completed checklist for normal completion. After a transport interruption, rerun it.
Unreleased: Repeat the formatting check after every unchanged slice.
Historical: Leave the generated preview locator implicit.
''')
write(od/'VERSION', '0.2.0\n')
write(od/'CHANGELOG.md', '# Changes\n\n## 0.2.0 — 2026-10-01\n\nApproval, adoption-checklist, evidence-locator and checklist-retention responses.\n')
git(od, 'add', '-A'); git(od, 'commit', '-qm', 'Deliver initial response guidance')
git(od, 'tag', 'v0.2.0')
release = git(od, 'rev-parse', 'v0.2.0')
text = (od/'response-guidance.md').read_text().replace('Unreleased: Repeat the formatting check after every unchanged slice.', 'Unreleased: Reuse accepted unchanged formatting checks.')
write(od/'response-guidance.md', text)
git(od, 'add', '-A'); git(od, 'commit', '-qm', 'Implement formatting response without release')
unreleased = git(od, 'rev-parse', 'HEAD')
findings = {
'014': ('Adoption checklist repeats', 'The adoption checklist repeats despite unchanged inputs.', 'alpha/DD-014', 'Implemented in response-guidance.md at v0.2.0; no execution has needed the adoption checklist since installation.', 'alpha-unused-old; 2026-09-28; Codex; v0.1.0; fixture://alpha/unused-old; repeated checklist cost 8 minutes.'),
'015': ('Evidence locator reconstructed after pause', 'Evidence locators are reconstructed after pauses.', 'beta/DD-015', 'Implemented at v0.2.0. An execution transcript exists but its actual loaded revision is unavailable.', 'beta-unknown; 2026-10-11T10:00:00+09:00; Claude Code; execution release unknown; fixture://beta/unknown; reconstruction cost 12 minutes.'),
'016': ('Checklist rerun after transport interruption', 'A completed checklist is rerun after a transport interruption.', 'alpha/DD-016', 'Response v0.2.0 changed normal-completion retention but still directs a transport rerun. See response-guidance.md and evidence/usage.md.', 'alpha-checklist-old; 2026-09-28; Codex; v0.1.0; fixture://alpha/checklist-old; rerun cost 25 minutes.'),
'017': ('Formatting check repeats unchanged', 'An accepted formatting check repeats across unchanged slices.', 'beta/DD-017', f'Implemented at {unreleased} in response-guidance.md. No tagged release contains this formatting response.', 'beta-format-old; 2026-09-28; Codex; v0.1.0; fixture://beta/format-old; rerun cost 5 minutes.'),
'018': ('Retired administrative receipt wording', 'An obsolete administrative receipt label was described as a problem.', 'beta/DD-018', 'No live product relationship. User review in evidence/noise.md supplies the observed impact and remaining need.', 'beta-admin; 2026-09-29; Claude Code; v0.1.0; fixture://beta/admin; no user-facing effect or lost work.'),
'019': ('Implicit generated preview locator', 'The generated preview locator is implicit, causing retrieval work.', 'beta/DD-019', 'No implementation response. response-guidance.md leaves the locator implicit.', 'beta-preview-old; 2026-09-29; Cursor; v0.1.0; fixture://beta/preview-old; retrieval cost 2 minutes.'),
'020': ('Queued receipt label improvement', 'A maintenance receipt label could be clearer.', 'alpha/DD-020', '[Clarify receipt label](../../../.planning/seeds/SEED-001-feedback.md#clarify-receipt-label), queued, not resolved.', 'alpha-label; 2026-09-29; Codex; v0.1.0; fixture://alpha/label; negligible observed effect.'),
'021': ('Taken annotation wording improvement', 'A maintenance annotation could be clearer.', 'beta/DD-021', '[Clarify maintenance annotation](../../../.planning/seeds/SEED-001-feedback.md#clarify-maintenance-annotation), Taken, ongoing, not resolved.', 'beta-annotation; 2026-09-29; Claude Code; v0.1.0; fixture://beta/annotation; negligible observed effect.'),
}
index = od/'docs/maintainer/finding-names.md'
write(index, index.read_text().replace('highest allocated is ODF-013', 'highest allocated is ODF-021'))
for code, (title, meaning, mapping, follow, evidence) in findings.items():
    write(od/f'docs/maintainer/findings/ODF-{code}.md', f'## ODF-{code} — {title}\n\n**Meaning:** {meaning}\n\n**Source mapping:** {mapping}.\n\n**Occurrence:** {evidence}\n\n**Follow-up:** {follow}\n')
    append(index, f'\n## ODF-{code} — [{title}](findings/ODF-{code}.md) <a id="odf-{code.lower()}"></a>\n')
# Historical allocation and old observation are recoverable from real Git history.
git(od, 'add', '-A'); git(od, 'commit', '-qm', 'Retain earlier supplied feedback and allocated identities')
(od/'docs/maintainer/findings/ODF-019.md').unlink()
write(index, index.read_text().replace('\n## ODF-019 — [Implicit generated preview locator](findings/ODF-019.md) <a id="odf-019"></a>\n', ''))
git(od, 'add', '-A'); git(od, 'commit', '-qm', 'Remove preview observation as negligible historical noise')
# The later source supplies new impact for the same never-corrected mechanism.
append(root/'beta/DearDough.md', '''
## DD-019 — Implicit generated preview locator

Shared guidance. Execution beta-preview-new; 2026-10-18T09:00:00+09:00;
Cursor; v0.2.0. response-guidance.md still leaves the generated preview locator
implicit. Finding the preview again cost 18 minutes. fixture://beta/preview-new.
The earlier beta-preview-old used this same DD-019 and mechanism.
''')
for code in ['014', '015', '016', '017', '018', '020', '021']:
    title, meaning, mapping, follow, evidence = findings[code]
    project, local = mapping.split('/')
    append(root/project/'DearDough.md', f'\n## {local} — {title}\n\nShared guidance. {meaning}\n{evidence}\n')
append(root/'alpha/DearDough.md', '''
## ODF-016 — Checklist rerun after transport interruption

Former local code: DD-016.
Execution alpha-checklist-failed; 2026-10-18T09:00:00+09:00; Codex;
v0.2.0; fixture://alpha/checklist-failed. The v0.2.0 transport exception reran
the same already-complete checklist after an interrupted connection, costing
30 minutes. This is one execution; another narrative below reports it again.

## DD-116 — Checklist repeated after transport

Execution alpha-checklist-failed; 2026-10-18T09:00:00+09:00; Codex; v0.2.0;
fixture://alpha/checklist-failed. Same interrupted connection and same 30 minutes.
The second report additionally notes a lost comparison tab rebuilt in 3 minutes.
''')
seed = od/'.planning/seeds/SEED-001-feedback.md'
append(seed, '''
<a id="clarify-receipt-label"></a>
### 5. Clarify receipt label

For maintainers, make the receipt label clearer. Evaluation: the reviewed receipt
has a clear label. Addresses [ODF-020](../../docs/maintainer/findings/ODF-020.md).
On delivery record the actual response and containing release at ODF-020.

<a id="clarify-maintenance-annotation"></a>
### 6. Clarify maintenance annotation

For maintainers, make the annotation clearer. Evaluation: the reviewed annotation
is understandable. Addresses [ODF-021](../../docs/maintainer/findings/ODF-021.md).
Already Taken; no completion has been recorded.
''')
backlog = od/'.planning/PRODUCT-BACKLOG.md'
text = backlog.read_text().replace('## Backlog list', '- [Clarify maintenance annotation](seeds/SEED-001-feedback.md#clarify-maintenance-annotation) — SEED-001#clarify-maintenance-annotation\n\n## Backlog list')
write(backlog, text + '\n- [Clarify receipt label](seeds/SEED-001-feedback.md#clarify-receipt-label) — SEED-001#clarify-receipt-label\n')
write(od/'evidence/noise.md', '''# Supplied user review — 2026-10-18
The ODF-018 receipt label was an obsolete administrative note for a removed
internal receipt. There was no observed harmful effect, no intended product
response, no live work and no local facet. The ODF-020/021 wording items have
similarly negligible observed impact, but their queued/Taken work is unfinished;
no authority to cancel either story has been supplied.
''')
write(od/'evidence/usage.md', f'''# Supplied execution and adoption receipts

These receipts report actual fixture guidance reads, not today's installed version.
The v0.2.0 source is {release}:response-guidance.md.

- open-dough/od-approved's recovered command receipt names v0.1.0 response-guidance.md;
  its previously unknown execution version is now identified. Original report remains.
- Open Dough adopted v0.2.0 response-guidance.md on 2026-10-02T09:00:00+09:00.
  Execution od-approval-use on 2026-10-10T09:00:00+09:00 loaded that file and
  published explicitly authorized maintenance without asking again. Receipt
  fixture://open-dough/approval-use; Codex. The approval path was relevant and exercised.
- alpha adopted v0.2.0 on 2026-10-02T09:00:00+09:00. Its adoption checklist has
  not been needed or exercised since installation. No post-adoption relevant use exists.
- beta adopted v0.2.0 on 2026-10-02T09:00:00+09:00. beta-unknown ran on
  2026-10-11T10:00:00+09:00 but no command, loaded guidance bytes or revision was
  retained; today's installation does not identify its execution release.
- alpha/checklist-normal-use on 2026-10-08T09:00:00+09:00; Codex; loaded v0.2.0
  response-guidance.md and retained the normal-completion checklist. Receipt
  fixture://alpha/checklist-normal-use. No transport interruption occurred then.
- alpha/checklist-failed on 2026-10-18T09:00:00+09:00 loaded v0.2.0. The retained
  transcript shows a transport interruption, then the directive to rerun the
  completed checklist. It cost 30 minutes and 3 minutes rebuilding a comparison tab.
  Receipt fixture://alpha/checklist-failed; both source narratives identify this execution.
''')
write(od/'docs/maintainer/near-term-watch-list.md', '''# Released responses under observation

## ODF-016 — Checklist rerun after transport interruption

Response v0.2.0, source response-guidance.md. Watch start:
2026-10-08T09:00:00+09:00, alpha/checklist-normal-use, fixture://alpha/checklist-normal-use.
Review after: 2026-10-15T09:00:00+09:00. Last assessed 2026-10-08; later sources
not yet reviewed. Source mapping alpha/DD-016. Authoritative evidence: [ODF-016](findings/ODF-016.md).
''')
# Materialize the declared source content that those adoption receipts identify.
for project in ['alpha', 'beta']:
    content = git(od, 'show', 'v0.2.0:response-guidance.md') + '\n'
    write(root/project/'.open-dough/response-guidance.md', content)
    write(root/project/'.open-dough/VERSION', '0.2.0\n')
for name, branch in projects:
    repo = root/name
    git(repo, 'add', '-A'); git(repo, 'commit', '-qm', 'Supply repeat-use execution receipts and source observations')
    git(repo, 'push', '-q', 'origin', f'HEAD:refs/heads/{branch}')
git(od, 'push', '-q', 'origin', '--tags')
write(root/'inventory.json', json.dumps([{'id':n, 'localPath':str(root/n), 'ref':b, 'origin':str(root/f'{n}.git')} for n,b in projects], indent=2)+'\n')
write(root/'prompt.txt', f'''Use $collect-client-feedback to run the next complete shared-feedback maintenance
cycle on {root}/inventory.json only. The established Open Dough integration
checkout is {od}. Catalog docs/maintainer/finding-names.md links the authoritative
records; watch docs/maintainer/near-term-watch-list.md; backlog
.planning/PRODUCT-BACKLOG.md; seeds .planning/seeds/. New supplied execution/adoption
receipts are in evidence/usage.md and user review in evidence/noise.md. Inspect the
actual tagged response changes, maintained records, source logs and relevant history.
This explicit invocation authorizes collection, mapping adoption, justified cleanup,
selection and owned maintenance publication to each changed fixture origin using
its delivery conventions. Do not implement responses, release/install guidance,
read production inventory or alter production repositories. Preserve uncertainty
and unfinished work. Report concrete coverage, decisions and origin acceptance at
{root}/cycle-report.md. Keep temporary delivery helpers and reports outside repos.
''')
files = ['.agents/skills/collect-client-feedback/SKILL.md', '.agents/skills/collect-client-feedback/references/retention-and-watch.md']
write(root/'candidate-sha256.json', json.dumps({p:hashlib.sha256((source/p).read_bytes()).hexdigest() for p in files}, indent=2)+'\n')
write(root/'initial-heads.json', json.dumps({n:git(root/n,'rev-parse','HEAD') for n,b in projects}, indent=2)+'\n')
print(root)
