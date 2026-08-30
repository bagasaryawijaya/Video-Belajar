const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = __dirname ? path.resolve(__dirname, '..') : process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function hasInstalledDeps(dir) {
  return fs.existsSync(path.join(dir, 'node_modules'));
}

function install(dir) {
  const relative = path.relative(root, dir) || '.';
  console.log(`\n[setup] Installing dependencies in ${relative}...`);
  const result = spawnSync(npmCommand, ['install'], {
    cwd: dir,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

for (const dir of [root, path.join(root, 'frontend'), path.join(root, 'backend')]) {
  if (!hasInstalledDeps(dir)) install(dir);
}
