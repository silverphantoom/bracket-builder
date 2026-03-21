#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== TypeScript check ==="
npx tsc --noEmit

echo ""
echo "=== Next.js build ==="
npm run build

echo ""
echo "=== All checks passed ==="
