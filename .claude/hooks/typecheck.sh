#!/usr/bin/env bash
# Stop hook — report-only TypeScript check so rapid UI edits don't silently
# break the build. Never blocks (always exits 0); just surfaces errors.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
out=$(npx --no-install tsc --noEmit 2>&1)
if [ -n "$out" ]; then
  echo "⚠️  tsc --noEmit reported type errors:"
  echo "$out" | head -40
fi
exit 0
