# workspace-skills

One-shot AI skill installer for **opencode** and **GitHub Copilot**.

Installs a curated set of default skills into your project so both agents know what rules and prompts are available.

## Usage

```bash
npx workspace-skills
```

That's it. Run it in any project directory.

## What it creates

| File / Folder | Purpose |
|---------------|---------|
| `.agents/skills/<name>/SKILL.md` | Skills for **opencode** |
| `.github/copilot-instructions.md` | Global instructions for **GitHub Copilot** |
| `SKILLS.md` | Index so the AI (and you) know which skills exist and when to use them |

## Included skills (always installed)

- **caveman** — ultra-compressed, low-token communication mode
- **brainstorming** — explore designs before coding
- **frontend-design** — distinctive UI generation guidelines
- **grill-me** — stress-test your plans via relentless Q&A
- **ui-ux-pro-max** — comprehensive UI/UX design intelligence
- **vercel-react-best-practices** — React/Next.js performance rules

## How it works

1. Clones the skill repos once into `~/.workspace-skills/cache/`
2. Copies the relevant `SKILL.md` files into your project
3. Builds a single `copilot-instructions.md` from all skills
4. Generates `SKILLS.md` as an index

Run the command again anytime to refresh to the latest upstream version.

## Requirements

- Node.js 18+
- `git` installed

## License

MIT
