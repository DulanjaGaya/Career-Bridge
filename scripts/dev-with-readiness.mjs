import { access, open, unlink } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const readinessPort = 4000;
const lockPath = path.join(repoRoot, '.readiness.lock');
const readinessDir = path.join(repoRoot, 'server');

const targets = {
  frontend: {
    cwd: path.join(repoRoot, 'frontend'),
    command: 'vite',
    args: [],
  },
  backend: {
    cwd: path.join(repoRoot, 'backend'),
    command: 'nodemon',
    args: ['server.js'],
  },
};

const targetName = process.argv[2];
const target = targets[targetName];

if (!target) {
  console.error(`Unknown dev target: ${targetName}`);
  process.exit(1);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const useShell = process.platform === 'win32';

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let finished = false;

    const done = (value) => {
      if (finished) return;
      finished = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(250);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, '127.0.0.1');
  });
}

async function waitForPort(port, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isPortOpen(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function runNpm(cwd, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, args, {
      cwd,
      stdio: 'inherit',
      shell: useShell,
      windowsHide: true,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
        ...extraEnv,
      },
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed: npm ${args.join(' ')}`));
      }
    });

    child.on('error', reject);
  });
}

async function ensureReadinessServer() {
  if (await isPortOpen(readinessPort)) {
    return null;
  }

  try {
    const lockFile = await open(lockPath, 'wx');
    await lockFile.write(`${process.pid}\n`);

    await runNpm(readinessDir, ['run', 'db:push']);

    const readiness = spawn(npmCommand, ['run', 'dev'], {
      cwd: readinessDir,
      stdio: 'inherit',
      shell: useShell,
      windowsHide: true,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
      },
    });

    readiness.on('exit', async () => {
      await lockFile.close().catch(() => {});
      await unlink(lockPath).catch(() => {});
    });

    const ready = await waitForPort(readinessPort, 20000);
    if (!ready) {
      readiness.kill();
      await lockFile.close().catch(() => {});
      await unlink(lockPath).catch(() => {});
      throw new Error('Readiness server did not start on port 4000. Run npm install at the repo root so the server workspace dependencies are available.');
    }

    return readiness;
  } catch (error) {
    if (error?.code !== 'EEXIST') {
      throw error;
    }

    const ready = await waitForPort(readinessPort, 20000);
    if (!ready) {
      try {
        await access(lockPath, fsConstants.F_OK);
        await unlink(lockPath);
      } catch {
        // Ignore stale lock cleanup errors.
      }
      return ensureReadinessServer();
    }

    return null;
  }
}

const readinessProcess = await ensureReadinessServer();
const appProcess = spawn(target.command, target.args, {
  cwd: target.cwd,
  stdio: 'inherit',
  shell: useShell,
  windowsHide: true,
});

const shutdown = () => {
  appProcess.kill();
  if (readinessProcess) {
    readinessProcess.kill();
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

appProcess.on('exit', (code) => {
  if (readinessProcess) {
    readinessProcess.kill();
  }
  process.exit(code ?? 0);
});