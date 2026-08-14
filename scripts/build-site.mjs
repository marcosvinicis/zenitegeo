import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE_DIST = "dist-site";

export const ROOT_PUBLIC_FILES = [
  "404.html",
  "index.html",
  "contato.html",
  "analise-presenca-digital.html",
  "sobre.html",
  "servicos.html",
  "termos.html",
  "privacidade.html",
  "obrigado.html",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "humans.txt",
  "security.txt",
  "site.webmanifest",
  "_headers",
  "_redirects",
];

export const PUBLIC_DIRECTORIES = ["assets", "images", "blog", "cases"];

export const FORBIDDEN_PUBLIC_PATHS = [
  "package.json",
  "package-lock.json",
  "wrangler.jsonc",
  "worker-configuration.d.ts",
  ".dev.vars",
  ".dev.vars.example",
  "src",
  "tests",
  "scripts",
  "docs",
  "vendor",
  "node_modules",
  ".git",
  "templates",
  "projects",
  "footer.html",
  "client.json",
];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, SITE_DIST);

function copyFile(name) {
  const from = join(root, name);
  if (!existsSync(from)) {
    throw new Error(`public file missing: ${name}`);
  }
  cpSync(from, join(out, name));
}

function copyDir(name) {
  const from = join(root, name);
  if (!existsSync(from)) {
    throw new Error(`public directory missing: ${name}`);
  }
  cpSync(from, join(out, name), {
    recursive: true,
    filter: (source) => {
      const base = source.split("/").pop() ?? "";
      return base !== ".DS_Store" && !base.endsWith(".map");
    },
  });
}

function walkFiles(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(relative(out, full));
  }
  return acc;
}

function bytesOf(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    total += entry.isDirectory() ? bytesOf(full) : statSync(full).size;
  }
  return total;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const file of ROOT_PUBLIC_FILES) copyFile(file);
for (const dir of PUBLIC_DIRECTORIES) copyDir(dir);

const required = ["404.html", "index.html", "_headers", "_redirects", "assets/js/zdh-tracking.js"];
for (const file of required) {
  if (!existsSync(join(out, file))) {
    throw new Error(`dist-site missing ${file} — run build:browser first`);
  }
}

for (const forbidden of FORBIDDEN_PUBLIC_PATHS) {
  if (existsSync(join(out, forbidden))) {
    throw new Error(`dist-site must not contain ${forbidden}`);
  }
}

const files = walkFiles(out).sort();
const bytes = bytesOf(out);
const dirs = [...new Set(files.map((file) => file.split("/")[0]))].sort();

console.log(`dist-site files ${files.length}`);
console.log(`dist-site bytes ${bytes}`);
console.log(`dist-site top-level ${dirs.join(",")}`);
