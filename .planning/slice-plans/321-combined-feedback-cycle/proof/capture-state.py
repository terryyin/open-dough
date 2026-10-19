"""Capture raw origin state for human assessment; makes no pass/fail judgment."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys

root = Path(sys.argv[1]).resolve()
initial = json.loads((root/'initial-heads.json').read_text())
result = {}
for name in initial:
    bare = root/f'{name}.git'
    def git(*args):
        return subprocess.check_output(['git', '--git-dir', str(bare), *args], text=True).strip()
    branch = git('symbolic-ref', '--short', 'HEAD')
    head = git('rev-parse', f'refs/heads/{branch}')
    paths = git('ls-tree', '-r', '--name-only', head).splitlines()
    selected = [p for p in paths if p in ['DearDough.md', 'notes/ProjectFindings.md', '.planning/PRODUCT-BACKLOG.md', 'private-note.txt'] or p.startswith(('.planning/seeds/', 'docs/maintainer/findings/'))]
    commits = git('rev-list', '--reverse', f'{initial[name]}..{head}').splitlines()
    result[name] = {'target': f'origin/refs/heads/{branch}', 'head': head,
                    'accepted': (root/f'{name}-accepted.txt').read_text() if (root/f'{name}-accepted.txt').exists() else '',
                    'commits': [{'sha': sha, 'subject': git('show', '-s', '--format=%s', sha),
                                 'changed': git('diff-tree', '--no-commit-id', '--name-only', '-r', sha).splitlines(),
                                 'records': {p: git('show', f'{sha}:{p}') for p in selected if p in git('ls-tree', '-r', '--name-only', sha).splitlines()}}
                                for sha in commits],
                    'records': {p: git('show', f'{head}:{p}') for p in selected}}
    def checkout_git(*args):
        return subprocess.check_output(['git', '-C', str(root/name), *args], text=True).strip()
    result[name]['default'] = {
        'head': checkout_git('rev-parse', 'HEAD'),
        'status': checkout_git('status', '--porcelain'),
        'worktrees': checkout_git('worktree', 'list', '--porcelain')}
    if (root/name/'private-note.txt').exists():
        result[name]['default']['privateIndex'] = checkout_git('show', ':private-note.txt')
        result[name]['default']['privateIndexOid'] = checkout_git('rev-parse', ':private-note.txt')
        result[name]['default']['privateIndexHex'] = subprocess.check_output([
            'git', '-C', str(root/name), 'show', ':private-note.txt']).hex()
        result[name]['default']['privateWorkingTree'] = (root/name/'private-note.txt').read_text()
        result[name]['default']['privateWorkingTreeSha256'] = hashlib.sha256(
            (root/name/'private-note.txt').read_bytes()).hexdigest()
print(json.dumps(result, indent=2))
