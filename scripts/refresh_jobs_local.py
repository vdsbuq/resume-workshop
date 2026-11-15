"""Hidden scheduled runner: bounded execution, UTF-8 logs, retain 20 runs."""
import datetime
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

def main():
    logs = ROOT / 'data' / 'refresh-logs'
    logs.mkdir(parents=True, exist_ok=True)
    path = logs / (datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + '.log')
    executable = Path(sys.executable).with_name('python.exe')
    env = dict(os.environ, PYTHONIOENCODING='utf-8')
    with path.open('w', encoding='utf-8') as log:
        log.write('Started: ' + datetime.datetime.now().isoformat() + '\n')
        log.flush()
        try:
            result = subprocess.run([str(executable), str(ROOT / 'scripts' / 'collect_jobs.py')],
                cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT,
                timeout=1100, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
            code = result.returncode
        except subprocess.TimeoutExpired:
            log.write('Collection timed out; inspect last successful data.\n')
            code = 124
        log.write(f'Finished: {datetime.datetime.now().isoformat()} exit={code}\n')
    for old in sorted(logs.glob('*.log'), reverse=True)[20:]:
        old.unlink()
    return code

if __name__ == '__main__':
    sys.exit(main())
