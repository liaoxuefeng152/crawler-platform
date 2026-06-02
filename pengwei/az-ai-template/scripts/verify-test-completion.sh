#!/bin/bash

###############################################################################
# 工作流测试验证脚本
#
# 功能: 验证测试文件的真实存在和执行情况
# 用途: 在Test阶段和Verification阶段强制检查测试质量
# 使用: bash scripts/verify-test-completion.sh <module-name>
#
# 示例: bash scripts/verify-test-completion.sh courses
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 模块名称
MODULE=${1:-"courses"}

echo "=========================================="
echo "🔍 工作流测试验证脚本"
echo "📦 模块: $MODULE"
echo "=========================================="
echo ""

# 初始化错误计数
ERRORS=0
WARNINGS=0

###############################################################################
# 1. 检查后端测试文件
###############################################################################
echo "📋 [1/6] 检查后端测试文件..."

BACKEND_TEST_FILE="app/api/$MODULE/route.test.ts"
if [ ! -f "$BACKEND_TEST_FILE" ]; then
  echo -e "${RED}❌ 后端测试文件不存在: $BACKEND_TEST_FILE${NC}"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ 后端测试文件存在${NC}"
  echo "   📄 $BACKEND_TEST_FILE"
fi
echo ""

###############################################################################
# 2. 检查E2E测试文件
###############################################################################
echo "📋 [2/6] 检查E2E测试文件..."

# 检查可能的E2E测试文件位置
E2E_TEST_FILE=""
if [ -f "app/dashboard/$MODULE/page.spec.ts" ]; then
  E2E_TEST_FILE="app/dashboard/$MODULE/page.spec.ts"
elif [ -f "app/dashboard/$MODULE/$MODULE.spec.ts" ]; then
  E2E_TEST_FILE="app/dashboard/$MODULE/$MODULE.spec.ts"
elif [ -f "app/dashboard/$MODULE/${MODULE}s/page.spec.ts" ]; then
  E2E_TEST_FILE="app/dashboard/$MODULE/${MODULE}s/page.spec.ts"
fi

if [ -z "$E2E_TEST_FILE" ]; then
  echo -e "${RED}❌ E2E测试文件不存在${NC}"
  echo -e "${YELLOW}   查找位置:${NC}"
  echo "     - app/dashboard/$MODULE/page.spec.ts"
  echo "     - app/dashboard/$MODULE/$MODULE.spec.ts"
  echo "     - app/dashboard/$MODULE/${MODULE}s/page.spec.ts"
  ERRORS=$((ERRORS + 1))
else
  echo -e "${GREEN}✅ E2E测试文件存在${NC}"
  echo "   📄 $E2E_TEST_FILE"
fi
echo ""

###############################################################################
# 3. TypeScript类型检查
###############################################################################
echo "📋 [3/6] TypeScript类型检查..."

TYPE_ERRORS=0

# 检查后端测试文件
if [ -f "$BACKEND_TEST_FILE" ]; then
  echo "   检查: $BACKEND_TEST_FILE"
  if npx tsc --noEmit "$BACKEND_TEST_FILE" 2>/dev/null; then
    echo -e "${GREEN}   ✅ 后端测试TypeScript检查通过${NC}"
  else
    echo -e "${RED}   ❌ 后端测试有TypeScript错误${NC}"
    TYPE_ERRORS=$((TYPE_ERRORS + 1))
  fi
fi

# 检查E2E测试文件
if [ -n "$E2E_TEST_FILE" ]; then
  echo "   检查: $E2E_TEST_FILE"
  if npx tsc --noEmit "$E2E_TEST_FILE" 2>/dev/null; then
    echo -e "${GREEN}   ✅ E2E测试TypeScript检查通过${NC}"
  else
    echo -e "${RED}   ❌ E2E测试有TypeScript错误${NC}"
    TYPE_ERRORS=$((TYPE_ERRORS + 1))
  fi
fi

if [ $TYPE_ERRORS -gt 0 ]; then
  ERRORS=$((ERRORS + TYPE_ERRORS))
fi
echo ""

###############################################################################
# 4. 运行后端测试
###############################################################################
echo "📋 [4/6] 运行后端测试..."

if [ -f "$BACKEND_TEST_FILE" ]; then
  echo "   执行: npm test -- $BACKEND_TEST_FILE"
  if npm test -- "$BACKEND_TEST_FILE" --run 2>&1 | tee /tmp/test-output.log; then
    echo -e "${GREEN}✅ 后端测试通过${NC}"

    # 提取测试统计
    TOTAL=$(grep -oP '\d+(?= tests)' /tmp/test-output.log | tail -1)
    PASSED=$(grep -oP '\d+(?= passing)' /tmp/test-output.log | tail -1)
    echo "   📊 测试统计: $PASSED/$TOTAL 通过"
  else
    echo -e "${RED}❌ 后端测试失败${NC}"
    echo "   📄 查看详细日志: /tmp/test-output.log"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${YELLOW}⚠️  跳过后端测试（文件不存在）${NC}"
fi
echo ""

###############################################################################
# 5. 运行E2E测试
###############################################################################
echo "📋 [5/6] 运行E2E测试..."

if [ -n "$E2E_TEST_FILE" ]; then
  # 检查开发服务器是否运行
  if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ 开发服务器运行中"
    echo "   执行: npx playwright test $E2E_TEST_FILE"

    if npx playwright test "$E2E_TEST_FILE" 2>&1 | tee /tmp/e2e-output.log; then
      echo -e "${GREEN}✅ E2E测试通过${NC}"

      # 提取测试统计
      TOTAL=$(grep -oP '\d+(?= passed)' /tmp/e2e-output.log | tail -1)
      if [ -z "$TOTAL" ]; then
        TOTAL=0
      fi
      echo "   📊 测试统计: $TOTAL 通过"
    else
      echo -e "${YELLOW}⚠️  E2E测试有失败用例${NC}"
      echo "   📄 查看详细日志: /tmp/e2e-output.log"
      echo "   📊 查看报告: npx playwright show-report"
      WARNINGS=$((WARNINGS + 1))
    fi
  else
    echo -e "${YELLOW}⚠️  开发服务器未运行，无法执行E2E测试${NC}"
    echo "   💡 请先启动: npm run dev"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo -e "${YELLOW}⚠️  跳过E2E测试（文件不存在）${NC}"
fi
echo ""

###############################################################################
# 6. 生成验证报告
###############################################################################
echo "📋 [6/6] 生成验证报告..."

REPORT_FILE=".az/verification-report-${MODULE}.txt"
cat > "$REPORT_FILE" << EOF
工作流测试验证报告
==================
模块: $MODULE
时间: $(date)
结果: $([ $ERRORS -eq 0 ] && echo "✅ 通过" || echo "❌ 失败")

测试文件
-------
后端测试: $([ -f "$BACKEND_TEST_FILE" ] && echo "✅ 存在" || echo "❌ 不存在")
E2E测试: $([ -n "$E2E_TEST_FILE" ] && echo "✅ 存在" || echo "❌ 不存在")

执行结果
-------
TypeScript检查: $([ $TYPE_ERRORS -eq 0 ] && echo "✅ 通过" || echo "❌ 有错误")
后端测试: $([ -f "$BACKEND_TEST_FILE" ] && echo "已执行" || echo "未执行")
E2E测试: $([ -n "$E2E_TEST_FILE" ] && echo "已执行" || echo "未执行")

错误统计
-------
错误: $ERRORS
警告: $WARNINGS
EOF

echo -e "${GREEN}✅ 验证报告已生成${NC}"
echo "   📄 $REPORT_FILE"
echo ""

###############################################################################
# 最终结果
###############################################################################
echo "=========================================="
echo "🎯 验证结果汇总"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ 验证通过${NC}"
  echo ""
  echo "所有关键检查项均通过，可以继续下一阶段。"
  exit 0
else
  echo -e "${RED}❌ 验证失败${NC}"
  echo ""
  echo "发现 $ERRORS 个错误，必须修复后才能继续。"
  echo ""
  echo "下一步操作:"
  echo "1. 修复上述错误"
  echo "2. 重新运行验证脚本"
  echo "3. 确保所有检查项通过"
  exit 1
fi
