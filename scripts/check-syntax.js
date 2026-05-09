const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const collectJsFiles = (directory) => {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
};

const files = collectJsFiles(path.join(__dirname, '..', 'src'));

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status);
  }
}

console.log(`Syntax OK: ${files.length} files checked.`);
