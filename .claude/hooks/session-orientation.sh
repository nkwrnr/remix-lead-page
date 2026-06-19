#!/usr/bin/env bash
# SessionStart hook — prints a quick orientation into the new session's context.
# Read-only, no side effects.
cat <<'EOF'
Remix lead page — orientation (design/UX/copy session)
• Run the app:    npm run dev  →  http://localhost:3000   (/ = editorial, /genie = experiential)
• Design tokens:  app/globals.css → @theme   |   Fonts: app/layout.tsx   |   System: docs/DESIGN.md
• Copy:           docs/COPY.md maps every string → its file   |   Architecture: docs/ARCHITECTURE.md
• Visual QA:      npm run qa:shots / qa:genie → read qa-screenshots/*   (or the /design-qa skill, or the design-reviewer subagent)
• Leads:          /admin?token=dev   |   backend defaults to LEAD_BACKEND=local (SQLite, no accounts)
• Gotchas:        2s form time-trap; 5/10min rate limit (restart dev to clear 429); Tailwind v4 has NO config file;
                  ignore AGENTS.md's "unstable_instant / read node_modules docs" hint — use standard App Router.
• Keep docs alive: update docs/DESIGN.md & docs/COPY.md and append to docs/DESIGN-LOG.md when you set a durable pattern.
EOF
