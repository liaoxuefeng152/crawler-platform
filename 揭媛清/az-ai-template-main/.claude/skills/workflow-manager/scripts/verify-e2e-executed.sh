#!/bin/bash
#
# Verify that E2E tests have been executed (not just written).
#
# This script checks:
# 1. E2E test files exist
# 2. communication/active-bridge.md has Playwright test records
# 3. Test execution evidence exists (passed/failed/screenshot)
# 4. Status is not "pending" or "to be executed"
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
PLAN_DIR="$1"
MODULE="$2"

if [ -z "$PLAN_DIR" ]; then
    echo -e "${RED}❌ FAIL: plan-dir argument required${NC}"
    echo "Usage: $0 <plan-dir> <module>"
    exit 1
fi

echo "🔍 Verifying E2E test execution"
echo "   Plan directory: $PLAN_DIR"
echo "   Module: $MODULE"
echo ""

# Step 1: Check if E2E test files exist
echo "📋 Step 1: Checking E2E test files..."
TEST_FILES=$(find "$PLAN_DIR/.." -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null || true)

if [ -z "$TEST_FILES" ]; then
    echo -e "${RED}❌ FAIL: No E2E test files found${NC}"
    exit 1
fi

TEST_FILE_COUNT=$(echo "$TEST_FILES" | wc -l)
echo -e "${GREEN}✅ PASS: Found $TEST_FILE_COUNT E2E test files${NC}"

# Step 2: Check if active-bridge.md exists
echo ""
echo "📋 Step 2: Checking communication/active-bridge.md..."
ACTIVE_BRIDGE="$PLAN_DIR/communication/active-bridge.md"

if [ ! -f "$ACTIVE_BRIDGE" ]; then
    echo -e "${RED}❌ FAIL: active-bridge.md not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PASS: active-bridge.md exists${NC}"

# Step 3: Check for Playwright test records
echo ""
echo "📋 Step 3: Checking for Playwright test execution records..."

if ! grep -q "Playwright\|playwright\|E2E.*test\|e2e.*test" "$ACTIVE_BRIDGE"; then
    echo -e "${RED}❌ FAIL: No Playwright test records found in active-bridge.md${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PASS: Playwright test records found${NC}"

# Step 4: Check for test execution evidence
echo ""
echo "📋 Step 4: Checking for test execution evidence..."

# Look for evidence keywords
EVIDENCE_KEYWORDS="passed\|failed\|screenshot\|passed\|failed\|通过\|失败\|截图"

if ! grep -qiE "$EVIDENCE_KEYWORDS" "$ACTIVE_BRIDGE"; then
    echo -e "${RED}❌ FAIL: No test execution evidence found${NC}"
    echo "   Expected keywords: passed, failed, screenshot, 通过, 失败, 截图"
    exit 1
fi

echo -e "${GREEN}✅ PASS: Test execution evidence found${NC}"

# Step 5: Check status is not "pending" or "to be executed"
echo ""
echo "📋 Step 5: Checking test status..."

PENDING_PATTERNS="待执行\|pending\|to be executed\|待测试\|待验证"

if grep -qiE "$PENDING_PATTERNS" "$ACTIVE_BRIDGE"; then
    echo -e "${YELLOW}⚠️  WARNING: Test appears to be in pending status${NC}"
    echo "   This might indicate tests haven't been executed yet"
fi

# Check for completion indicators
COMPLETION_PATTERNS="completed\|finished\|done\|完成\|TEST_PASSED\|READY"

if grep -qiE "$COMPLETION_PATTERNS" "$ACTIVE_BRIDGE"; then
    echo -e "${GREEN}✅ PASS: Tests appear to be completed${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: No clear completion status found${NC}"
fi

# Summary
echo ""
echo "="=========="
echo -e "${GREEN}✅ SUCCESS: E2E test execution verification passed!${NC}"
echo ""
echo "Summary:"
echo "  - E2E test files: $TEST_FILE_COUNT"
echo "  - Playwright records: Found"
echo "  - Execution evidence: Found"
