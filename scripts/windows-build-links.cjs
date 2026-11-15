// OpenNext's pnpm directory links need Windows junctions without elevation.
const fs = require('node:fs');
const path = require('node:path');
const { syncBuiltinESMExports } = require('node:module');
if (process.platform === 'win32') {
  const original = fs.symlinkSync;
  fs.symlinkSync = function(target, destination, type) {
    const standalone = path.resolve('.next/standalone') + path.sep;
    const bundle = path.resolve('.open-next/server-functions/default') + path.sep;
    const source = path.resolve(path.dirname(destination), target);
    if (destination.startsWith(bundle) && source.startsWith(standalone)) {
      const mapped = bundle + source.slice(standalone.length);
      fs.mkdirSync(mapped, { recursive: true });
      return original(mapped, destination, 'junction');
    }
    try { return original(target, destination, type); }
    catch (error) {
      const resolved = path.resolve(path.dirname(destination), target);
      if (error.code !== 'EPERM' || !fs.statSync(resolved).isDirectory()) throw error;
      return original(resolved, destination, 'junction');
    }
  };
  syncBuiltinESMExports();
}
