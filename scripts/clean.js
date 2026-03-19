#!/usr/bin/env node
/**
 * Cross-platform .next lock cleaner.
 * Kills node processes holding .next locks, then removes .next dir.
 * Safe to run even when nothing is locked.
 *
 * Usage: node scripts/clean.js [projectDir]
 *   projectDir defaults to process.cwd()
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectDir = path.resolve(process.argv[2] || process.cwd());
const nextDir = path.join(projectDir, ".next");
const isWindows = process.platform === "win32";

function log(msg) {
  console.log(`[clean] ${msg}`);
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function tryRemove() {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

function killNodeProcesses() {
  const myPid = process.pid;
  const parentPid = process.ppid;
  if (isWindows) {
    // Kill node processes EXCEPT ourselves and our parent (npm)
    try {
      const out = execSync('wmic process where "name=\'node.exe\'" get processid /format:csv', {
        shell: "cmd.exe",
        timeout: 10000,
        stdio: "pipe",
        encoding: "utf8",
      });
      const pids = out.match(/\d+/g) || [];
      const toKill = pids.filter(p => +p !== myPid && +p !== parentPid);
      if (toKill.length > 0) {
        for (const pid of toKill) {
          try {
            execSync(`taskkill /F /PID ${pid}`, { shell: "cmd.exe", timeout: 5000, stdio: "pipe" });
          } catch { /* already dead */ }
        }
        log(`Killed ${toKill.length} node process(es).`);
      } else {
        log("No other node processes to kill.");
      }
    } catch {
      log("Could not enumerate processes — trying force kill.");
      try {
        execSync("taskkill /F /IM node.exe", { shell: "cmd.exe", timeout: 10000, stdio: "pipe" });
      } catch { /* nothing to kill */ }
    }
  } else {
    try {
      execSync("pkill -9 -f 'node.*next' || true", {
        timeout: 10000,
        stdio: "pipe",
      });
      log("Killed next-related node processes.");
    } catch {
      // no processes
    }
  }
}

// --- Quick path: no .next or not locked ---
if (!fs.existsSync(nextDir)) {
  log("No .next directory — nothing to clean.");
  process.exit(0);
}

if (tryRemove()) {
  log("Removed .next successfully.");
  process.exit(0);
}

// --- .next is locked. Kill holders. ---
log(".next is locked — killing node processes...");
killNodeProcesses();

// --- Wait for locks to release, retry removal ---
sleepSync(2000); // Give Windows time to release handles
const maxAttempts = 10;
for (let i = 0; i < maxAttempts; i++) {
  sleepSync(1000);
  if (tryRemove()) {
    log("Removed .next successfully.");
    process.exit(0);
  }
}

log("ERROR: Could not remove .next after killing processes.");
log("Close any editors/terminals using the project and retry.");
process.exit(1);
