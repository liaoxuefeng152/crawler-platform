#!/bin/bash
# Auto Mode Check Hook
# Checks AUTO_MODE status from active-bridge.md and outputs JSON

PLAN_DIR=$(find .az -name "plan-*" -type d 2>/dev/null | head -1)
if [ -n "$PLAN_DIR" ]; then
  ACTIVE_BRIDGE="$PLAN_DIR/communication/active-bridge.md"
  if [ -f "$ACTIVE_BRIDGE" ]; then
    AUTO_MODE=$(grep -c "\[AUTO_MODE\]: true" "$ACTIVE_BRIDGE" 2>/dev/null)
    if [ "$AUTO_MODE" -gt 0 ]; then
      echo '{"auto_mode": true}'
    else
      echo '{"auto_mode": false}'
    fi
  else
    echo '{"auto_mode": false}'
  fi
else
  echo '{"auto_mode": false}'
fi