#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <source_dir> <output_zip> [exclude ...]"
  exit 1
fi

command -v zip >/dev/null 2>&1 || { echo "zip not found"; exit 1; }

src="$1"
out="$2"
shift 2

cd "$src"

args=( -r "$out" . )

if [ $# -gt 0 ]; then
  args+=( -x )
  for ex in "$@"; do
    case "$ex" in
      *\**|*\?*)
        args+=( "$ex" )
        ;;
      *)
        args+=( "*/$ex/*" "$ex/*" )
        ;;
    esac
  done
fi

zip "${args[@]}"