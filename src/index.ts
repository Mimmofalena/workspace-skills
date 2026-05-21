#!/usr/bin/env node
import { DEFAULT_SKILLS } from "./skills.js";
import { ensureDownloaded } from "./download.js";
import { generate } from "./generate.js";

const cwd = process.cwd();

console.log("workspace-skills: installing default skills...\n");

const skills = DEFAULT_SKILLS.map((s) => ({
  name: s.name,
  filePath: ensureDownloaded(s),
}));

generate(cwd, skills);

console.log("\nDone! Generated:");
console.log("  .agents/skills/       -> opencode skills");
console.log("  .github/copilot-instructions.md -> Copilot rules");
console.log("  SKILLS.md             -> skill index for the AI");
