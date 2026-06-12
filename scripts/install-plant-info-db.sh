#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DB="$REPO_ROOT/data/build/plant-info.db"
TARGET_DB="$REPO_ROOT/plant-manager/App_Data/plant-info.db"

if pgrep -f "dotnet run --project plant-manager|plant-manager.dll" >/dev/null; then
  echo "Plant-Man backend appears to be running. Stop it before installing plant-info.db." >&2
  exit 1
fi

if [[ ! -f "$SOURCE_DB" ]]; then
  echo "Missing generated plant info database: $SOURCE_DB" >&2
  echo "Build it first with:" >&2
  echo "  dotnet run --project plant-manager-importer -- build-db --source data/raw/gbif/backbone.zip --output data/build/plant-info.db" >&2
  exit 1
fi

SOURCE_COUNT="$(sqlite3 "$SOURCE_DB" "SELECT COUNT(*) FROM PlantInfoRecords;" 2>/dev/null || echo 0)"
if [[ "$SOURCE_COUNT" == "0" ]]; then
  echo "Generated plant info database has no PlantInfoRecords: $SOURCE_DB" >&2
  exit 1
fi

mkdir -p "$(dirname "$TARGET_DB")"
rm -f "$TARGET_DB-shm" "$TARGET_DB-wal"
cp -f "$SOURCE_DB" "$TARGET_DB"

echo "Installed $SOURCE_DB -> $TARGET_DB"
echo "Plant info records: $SOURCE_COUNT"
