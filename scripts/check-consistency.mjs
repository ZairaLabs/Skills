#!/usr/bin/env node
// Consistency check: every criterion in the skill's reference files must match
// the Zaira Standard's Appendix A (ID, name, requirement level, weight, module
// file placement), with no criteria missing, duplicated, or invented.
//
// The manifest (criteria-manifest.json) is transcribed from the published
// standard. When the standard versions, update the manifest first, then let
// this check surface every reference file that needs to follow.
//
// Usage: node scripts/check-consistency.mjs   (from the skill root or repo root)
// Exit codes: 0 = consistent, 1 = drift found, 2 = script/setup error

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(skillRoot, 'scripts', 'criteria-manifest.json'), 'utf8'));
const refDir = join(skillRoot, 'references');

const HEADING = /^## ([A-Z]{1,3}\d+)\. (.+?) \(([^)]+)\)$/;
const errors = [];
const found = new Map(); // id -> { file, name, suffix }

for (const file of readdirSync(refDir).filter(f => f.endsWith('.md'))) {
  const lines = readFileSync(join(refDir, file), 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(HEADING);
    if (!m) continue;
    const [, id, name, suffix] = m;
    if (found.has(id)) {
      errors.push(`${id}: appears in both ${found.get(id).file} and ${file}`);
      continue;
    }
    found.set(id, { file, name: name.trim(), suffix });
  }
}

for (const c of manifest.criteria) {
  const f = found.get(c.id);
  if (!f) {
    errors.push(`${c.id} (${c.name}): missing from reference files`);
    continue;
  }
  if (f.file !== c.file) {
    errors.push(`${c.id}: in ${f.file}, manifest says ${c.file}`);
  }
  // Bold markers are presentation (MUST gates are bolded); strip before comparing.
  const cleanName = f.name.replace(/\*\*/g, '');
  if (cleanName !== c.name) {
    errors.push(`${c.id}: heading name "${cleanName}" != standard name "${c.name}"`);
  }
  const suffix = f.suffix.replace(/\*\*/g, '');
  const saysMust = /\bMUST\b/.test(suffix);
  if (saysMust !== (c.requirement === 'MUST')) {
    errors.push(`${c.id}: heading ${saysMust ? 'claims' : 'omits'} MUST; standard says ${c.requirement}`);
  }
  if (!saysMust && !suffix.includes(c.requirement)) {
    errors.push(`${c.id}: heading suffix "${suffix}" missing requirement level ${c.requirement}`);
  }
  const saysCritical = /Critical/.test(suffix);
  if (saysCritical !== (c.weight === 'Critical')) {
    errors.push(`${c.id}: heading ${saysCritical ? 'claims' : 'omits'} Critical weight; standard says ${c.weight}`);
  }
}

for (const id of found.keys()) {
  if (!manifest.criteria.some(c => c.id === id)) {
    errors.push(`${id}: found in references but not in the standard's criteria list`);
  }
}

// SKILL.md must name the five MUST gates and never invent others.
const skillMd = readFileSync(join(skillRoot, 'SKILL.md'), 'utf8');
const mustGates = manifest.criteria.filter(c => c.requirement === 'MUST').map(c => c.id);
if (mustGates.length !== 5) {
  errors.push(`manifest lists ${mustGates.length} MUST gates; the standard defines 5`);
}
for (const id of mustGates) {
  if (!skillMd.includes(id)) errors.push(`SKILL.md does not mention MUST gate ${id}`);
}

const expectedTotal = 71;
if (manifest.criteria.length !== expectedTotal) {
  errors.push(`manifest has ${manifest.criteria.length} criteria; the standard defines ${expectedTotal}`);
}

if (errors.length) {
  console.error(`DRIFT: ${errors.length} inconsistencies with Zaira Standard v${manifest.standard_version}\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK: ${manifest.criteria.length} criteria consistent with Zaira Standard v${manifest.standard_version} (${found.size} documented, ${mustGates.length} MUST gates verified in SKILL.md)`);
