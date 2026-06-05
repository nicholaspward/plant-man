#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

mkdir -p "$REPO_ROOT/data/raw/gbif"
curl -L \
  --output "$REPO_ROOT/data/raw/gbif/backbone.zip" \
  https://hosted-datasets.gbif.org/datasets/backbone/current/backbone.zip
