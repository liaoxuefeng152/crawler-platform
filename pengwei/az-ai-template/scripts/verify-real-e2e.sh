#!/bin/bash

###############################################################################
# 真实E2E测试验证脚本
#
# 功能: 验证E2E测试是否真实执行，而不是虚假"文档测试"
# 用途: 在Test阶段和Verification阶段强制检查真实测试执行
# 使用: bash scripts/verify-real-e2e.sh <module-name>
#
# 示例: bash scripts/verify-real-e2e.sh courses
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 模块名称
MODULE=${1:-"course-system"}

echo "=========================================="
echo "🔍 真实E2E测试验证脚本"
echo "📦 模块: $MODULE"
echo "=========================================="
echo ""

# 初始化错误计数
ERRORS=0

###############################################################################
# 1. 检查E2E测试文件
###############################################################################
echo "📋 [1/5] 检查E2E测试文件..."

# 查找可能的测试文件位置
E2E_FILES=(
  "app/dashboard/$MODULE/$MODULE.spec.ts"
  "app/dashboard/$MODULE/page.spec.ts"
  "app/dashboard/$MODULE/${MODULE}s/page.spec.ts"
)

E2E_FILE_FOUND=false
for file in "${E2E_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ E2E测试文件存在${NC}"
    echo "   📄 $file"
    E2E_FILE_FOUND=true
    break
  fi
done

if [ "$E2E_FILE_FOUND" = false ]; then
  echo -e "${RED}❌ E2E测试文件不存在${NC}"
  echo -e "${YELLOW}   查找位置:${NC}"
  for file in "${E2E_FILES[@]}"; do
    echo "     - $file"
  done
  ERRORS=$((ERRORS + 1))
fi
echo ""

###############################################################################
# 2. 检查开发服务器
###############################################################################
echo "📋 [2/5] 检查开发服务器..."

if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ 开发服务器运行中${NC}"
  echo "   🌐 http://localhost:3000"
else
  echo -e "${RED}❌ 开发服务器未运行${NC}"
  echo -e "${YELLOW}   💡 请先启动: npm run dev &${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

###############################################################################
# 3. 运行真实E2E测试
###############################################################################
echo "📋 [3/5] 运行真实E2E测试..."

if [ "$E2E_FILE_FOUND" = false ]; then
  echo -e "${YELLOW}⚠️  跳过测试执行（测试文件不存在）${NC}"
else
  echo "   执行: npx playwright test app/dashboard/$MODULE/"

  if npx playwright test "app/dashboard/$MODULE/" --reporter=line 2>&1 | tee /tmp/e2e-verify.log; then
    echo -e "${GREEN}✅ E2E测试执行完成${NC}"
  else
    echo -e "${YELLOW}⚠️  E2E测试有失败用例${NC}"
  fi

  # 4. 检查测试结果
  echo "📋 [4/5] 检查测试结果..."

  if grep -q "passed" /tmp/e2e-verify.log; then
    PASSED=$(grep -oP '\d+(?= passed)' /tmp/e2e-verify.log 2>/dev/null || echo "0")
    FAILED=$(grep -oP '\d+(?= failed)' /tmp/e2e-verify.log 2>/dev/null || echo "0")
    TOTAL=$((PASSED + FAILED))

    echo -e "${GREEN}✅ 测试已真实执行${NC}"
    echo "   📊 结果: ${PASSED} passed, ${FAILED} failed (总计: ${TOTAL})"

    if [ "$FAILED" -gt 0 ]; then
      echo -e "${YELLOW}   ⚠️  有失败用例，但至少真实执行了${NC}"
    fi
  else
    echo -e "${RED}❌ E2E测试未执行或无结果${NC}"
    echo "   📄 查看日志: /tmp/e2e-verify.log"
    ERRORS=$((ERRORS + 1))
  fi
  echo ""
fi

###############################################################################
# 5. 检查测试报告
###############################################################################
echo "📋 [5/5] 检查测试报告..."

if [ -f "playwright-report/index.html" ]; then
  echo -e "${GREEN}✅ Playwright测试报告存在${NC}"
  echo "   📊 查看报告: npx playwright show-report"
else
  echo -e "${YELLOW}⚠️  Playwright测试报告不存在${NC}"
  echo "   💡 生成报告: npx playwright show-report"
fi
echo ""

###############################################################################
# 最终结果
###############################################################################
echo "=========================================="
echo "🎯 验证结果汇总"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ 真实E2E测试验证通过${NC}"
  echo ""
  echo "所有检查项均通过，E2E测试已真实执行。"
  exit 0
else
  echo -e "${RED}❌ 真实E2E测试验证失败${NC}"
  echo ""
  echo "发现 $ERRORS 个错误，必须修复后才能继续。"
  echo ""
  echo "下一步操作:"
  echo "1. 创建E2E测试文件"
  echo "2. 启动开发服务器"
  echo "3. 运行npx playwright test"
  echo "4. 重新验证"
  exit 1
fi
