#!/bin/bash
# audit-all.sh — Run all validation hooks against N5 content and generate a report.
# Usage: bash hooks/audit-all.sh [--level N5|N4|all] [--hook <hook-name>]
# Defaults to N5 only. Output: summary table + detailed failures.

set -euo pipefail

LEVEL="${1:-N5}"
FILTER_HOOK="${2:-}"

# Collect content files based on level
collect_files() {
  local lvl="$1"
  local files=()
  for dir in "data/${lvl}/lessons" "data/${lvl}/grammar" "data/${lvl}/reviews" "data/${lvl}/compose"; do
    if [[ -d "$dir" ]]; then
      for f in "$dir"/*.json; do
        [[ -f "$f" ]] && files+=("$f")
      done
    fi
  done
  # Stories (terms.json files)
  if [[ -d "data/${lvl}/stories" ]]; then
    while IFS= read -r f; do
      files+=("$f")
    done < <(find "data/${lvl}/stories" -name "*.json" 2>/dev/null)
  fi
  printf '%s\n' "${files[@]}" | sort
}

# Collect hooks
collect_hooks() {
  for h in hooks/validate-*.sh; do
    [[ -f "$h" ]] || continue
    if [[ -n "$FILTER_HOOK" ]]; then
      [[ "$h" == *"$FILTER_HOOK"* ]] || continue
    fi
    echo "$h"
  done
}

FILES=$(collect_files "$LEVEL")
HOOKS=$(collect_hooks)
FILE_COUNT=$(echo "$FILES" | wc -l)
HOOK_COUNT=$(echo "$HOOKS" | wc -l)

echo "═══════════════════════════════════════════════════════════════"
echo "  CONTENT AUDIT REPORT — ${LEVEL}"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Files: ${FILE_COUNT}  |  Hooks: ${HOOK_COUNT}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0
FAIL_DETAILS=""

# Per-hook summary accumulators
declare -A HOOK_PASS
declare -A HOOK_FAIL
declare -A HOOK_FAILURES

while IFS= read -r hook; do
  hook_name=$(basename "$hook" .sh | sed 's/^validate-//')
  HOOK_PASS[$hook_name]=0
  HOOK_FAIL[$hook_name]=0
  HOOK_FAILURES[$hook_name]=""

  while IFS= read -r file; do
    INPUT="{\"tool_input\":{\"file_path\":\"${file}\"}}"
    OUTPUT=$(echo "$INPUT" | bash "$hook" 2>&1) && STATUS=0 || STATUS=$?

    if [[ $STATUS -eq 0 ]]; then
      HOOK_PASS[$hook_name]=$(( ${HOOK_PASS[$hook_name]} + 1 ))
      TOTAL_PASS=$(( TOTAL_PASS + 1 ))
    else
      HOOK_FAIL[$hook_name]=$(( ${HOOK_FAIL[$hook_name]} + 1 ))
      TOTAL_FAIL=$(( TOTAL_FAIL + 1 ))
      short_file=$(echo "$file" | sed "s|^data/${LEVEL}/||")
      HOOK_FAILURES[$hook_name]+="  ✗ ${short_file}"$'\n'
      if [[ -n "$OUTPUT" ]]; then
        # Indent output lines
        HOOK_FAILURES[$hook_name]+="$(echo "$OUTPUT" | sed 's/^/      /')"$'\n'
      fi
    fi
  done <<< "$FILES"
done <<< "$HOOKS"

# Summary table
echo "┌─────────────────────────┬───────┬───────┐"
echo "│ Hook                    │ Pass  │ Fail  │"
echo "├─────────────────────────┼───────┼───────┤"
while IFS= read -r hook; do
  hook_name=$(basename "$hook" .sh | sed 's/^validate-//')
  pass=${HOOK_PASS[$hook_name]}
  fail=${HOOK_FAIL[$hook_name]}
  marker=""
  [[ $fail -gt 0 ]] && marker=" ✗"
  printf "│ %-23s │ %5d │ %5d │%s\n" "$hook_name" "$pass" "$fail" "$marker"
done <<< "$HOOKS"
echo "├─────────────────────────┼───────┼───────┤"
printf "│ %-23s │ %5d │ %5d │\n" "TOTAL" "$TOTAL_PASS" "$TOTAL_FAIL"
echo "└─────────────────────────┴───────┴───────┘"
echo ""

# Detailed failures
if [[ $TOTAL_FAIL -gt 0 ]]; then
  echo "═══════════════════════════════════════════════════════════════"
  echo "  FAILURES BY HOOK"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  while IFS= read -r hook; do
    hook_name=$(basename "$hook" .sh | sed 's/^validate-//')
    fail=${HOOK_FAIL[$hook_name]}
    if [[ $fail -gt 0 ]]; then
      echo "── ${hook_name} (${fail} failure$([ $fail -gt 1 ] && echo s)) ──"
      echo "${HOOK_FAILURES[$hook_name]}"
    fi
  done <<< "$HOOKS"
else
  echo "All ${TOTAL_PASS} checks passed. No issues found."
fi
