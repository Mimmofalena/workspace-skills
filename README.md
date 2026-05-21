# workspace-skills

One-shot AI skill installer for **opencode** and **GitHub Copilot**.

Installs a curated set of default skills into your project so the agent knows what rules and prompts are available.

## Usage

```bash
npx workspace-skills
```

You will be asked where to install:

- **opencode only** → `.agents/skills/<name>/SKILL.md`
- **GitHub Copilot only** → `.github/skills/<name>.md`
- **Both** → both structures

That's it. No config files, no lock files, no indexes. Only the files the tool actually needs.

## Included skills

- **caveman** — ultra-compressed, low-token communication mode
- **brainstorming** — explore designs before coding
- **frontend-design** — distinctive UI generation guidelines
- **grill-me** — stress-test your plans via relentless Q&A
- **ui-ux-pro-max** — comprehensive UI/UX design intelligence
- **vercel-react-best-practices** — React/Next.js performance rules

## How it works

1. Clones the skill repos once into `~/.workspace-skills/cache/`
2. Copies the relevant `SKILL.md` files into your project
3. For Copilot: places skills as `.github/skills/<name>.md`
4. For opencode: places skills as `.agents/skills/<name>/SKILL.md`

Run the command again anytime to refresh to the latest upstream version.

## Requirements

- Node.js 18+
- `git` installed

## License

MIT
