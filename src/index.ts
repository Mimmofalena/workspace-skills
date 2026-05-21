#!/usr/bin/env node
import inquirer from "inquirer";
import { DEFAULT_SKILLS } from "./skills.js";
import { ensureDownloaded } from "./download.js";
import { generate } from "./generate.js";

async function main() {
  const cwd = process.cwd();

  const { target } = await inquirer.prompt([
    {
      type: "list",
      name: "target",
      message: "Where do you want to install skills?",
      choices: [
        { name: "opencode only (.agents/skills/)", value: "opencode" },
        { name: "GitHub Copilot only (.github/skills/)", value: "copilot" },
        { name: "Both", value: "both" },
      ],
      default: "both",
    },
  ]);

  console.log(`Installing skills for: ${target}\n`);

  const skills = DEFAULT_SKILLS.map((s) => ({
    name: s.name,
    filePath: ensureDownloaded(s),
  }));

  generate(cwd, skills, target as "opencode" | "copilot" | "both");

  console.log("\nDone!");
  if (target === "opencode" || target === "both") {
    console.log("  .agents/skills/       -> opencode skills");
  }
  if (target === "copilot" || target === "both") {
    console.log("  .github/skills/        -> Copilot skills");
  }
}

main();
