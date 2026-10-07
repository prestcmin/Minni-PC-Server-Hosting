#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_DIR"

exec "$PROJECT_DIR/backend/.venv/bin/uvicorn" \
  backend.app.main:app \
  --reload \
  --host 127.0.0.1 \
  --port 8001
