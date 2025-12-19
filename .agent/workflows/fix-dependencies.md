---
description: Fix broken node_modules or silent startup failures
---

# Fix Dependencies Workflow

Trigger this workflow when `npm run dev` fails silently, ports are blocked, or weird import errors occur.

1.  **Diagnose**:
    *   Check for running astro processes: `ps aux | grep astro`.
    *   Check for listening ports: `lsof -i :4321`.
2.  **Clean & Reinstall**:
    *   **// turbo**
    *   Run command: `rm -rf node_modules package-lock.json && npm install` (or just `rm -rf node_modules` if lockfile is trusted, but strict cleaner is safer).
    *   *Note: Adapt to `pnpm` or `yarn` if the project uses them, but default to `npm` per project structure.*
3.  **Verify**:
    *   Run `npm run build` or `npm run dev` to confirm the issue is resolved.
