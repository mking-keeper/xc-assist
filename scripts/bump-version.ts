#!/usr/bin/env npx tsx

import { readFile, writeFile } from "fs/promises";
import { execSync } from "child_process";
import { parseJSON, stringifyJSON } from "confbox";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface FileConfig {
  path: string;
  keys: string[];
}

// Files to update with their version paths
const FILES: FileConfig[] = [
  { path: "package.json", keys: ["version"] },
  { path: "mcp-servers/package.json", keys: ["version"] },
  { path: "mcp-servers/xc-assist/package.json", keys: ["version"] },
  { path: ".claude-plugin/plugin.json", keys: ["version"] },
  {
    path: ".claude-plugin/marketplace.json",
    keys: ["metadata.version", "plugins.0.version"],
  },
];

function isValidVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

function bumpPatch(version: string): string {
  const parts = version.split(".");
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`);
  }
  const [major, minor, patch] = parts.map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

function getNewVersion(currentVersion: string, arg?: string): string {
  if (!arg) {
    return bumpPatch(currentVersion);
  }
  if (isValidVersion(arg)) {
    return arg;
  }
  console.error(
    `Error: Invalid version "${arg}". Use format X.Y.Z (e.g., 1.2.3)`,
  );
  process.exit(1);
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce((o, k) => (o as Record<string, unknown>)?.[k], obj);
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  const target = keys.reduce((o, k) => o[k] as Record<string, unknown>, obj);
  target[last] = value;
}

async function readJson(filePath: string): Promise<Record<string, unknown>> {
  const fullPath = join(ROOT, filePath);
  const content = await readFile(fullPath, "utf8");
  return parseJSON(content);
}

async function writeJson(
  filePath: string,
  data: Record<string, unknown>,
): Promise<void> {
  const fullPath = join(ROOT, filePath);
  await writeFile(fullPath, stringifyJSON(data));
}

async function main(): Promise<void> {
  const arg = process.argv[2];

  // Get current version from root package.json
  const rootPkg = await readJson("package.json");
  const currentVersion = rootPkg.version as string;
  const newVersion = getNewVersion(currentVersion, arg);

  console.log(`Bumping version: ${currentVersion} → ${newVersion}\n`);

  // Update all files
  for (const { path, keys } of FILES) {
    const data = await readJson(path);
    for (const key of keys) {
      const oldValue = getNestedValue(data, key);
      setNestedValue(data, key, newVersion);
      console.log(`  ${path}: ${key} ${oldValue} → ${newVersion}`);
    }
    await writeJson(path, data);
  }

  console.log("\nCreating git commit and tag...");

  // Stage all changed files
  const filePaths = FILES.map((f) => f.path).join(" ");
  execSync(`git add ${filePaths}`, { cwd: ROOT, stdio: "inherit" });

  // Commit
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, {
    cwd: ROOT,
    stdio: "inherit",
  });

  // Tag
  execSync(`git tag v${newVersion}`, { cwd: ROOT, stdio: "inherit" });

  console.log(`\nDone! Created commit and tag v${newVersion}`);
  console.log(`\nTo push: git push && git push --tags`);
}

main();
