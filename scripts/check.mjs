#!/usr/bin/env node

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT_DIRS = ["bin", "scripts", "src", "test"];

const files = ROOT_DIRS.flatMap((dir) => listJavaScriptFiles(dir)).sort();

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || `Syntax check failed for ${file}\n`);
    process.exit(result.status || 1);
  }
}

process.stdout.write(`Checked ${files.length} JavaScript files.\n`);

function listJavaScriptFiles(path) {
  const stat = statSync(path, { throwIfNoEntry: false });
  if (!stat) return [];

  if (stat.isFile()) {
    return /\.(mjs|js)$/i.test(path) ? [path] : [];
  }

  if (!stat.isDirectory()) return [];

  return readdirSync(path)
    .filter((entry) => !entry.startsWith("."))
    .flatMap((entry) => listJavaScriptFiles(join(path, entry)));
}
