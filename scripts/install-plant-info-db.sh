#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DB="$REPO_ROOT/data/build/plant-info.db"
TARGET_DB="$REPO_ROOT/plant-manager/App_Data/plant-info.db"

if [[ ! -f "$SOURCE_DB" ]]; then
  echo "Missing generated plant info database: $SOURCE_DB" >&2
  echo "Build it first with:" >&2
  echo "  dotnet run --project plant-manager-importer -- build-db --source data/raw/gbif/backbone.zip --output data/build/plant-info.db" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET_DB")"
cp -f "$SOURCE_DB" "$TARGET_DB"

echo "Installed $SOURCE_DB -> $TARGET_DB"
