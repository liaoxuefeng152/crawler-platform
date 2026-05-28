#!/bin/bash

# 组件skill文档验证脚本
# 检查所有components/目录下的组件是否都有对应的skill文档

set -e

echo "🔍 开始验证组件skill文档..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 统计变量
total_components=0
documented_components=0
missing_components=0
outdated_components=0

# 临时文件
TMP_REPORT=$(mktemp)

# 清理函数
cleanup() {
    rm -f "$TMP_REPORT"
}
trap cleanup EXIT

# 检查函数
check_component_skill() {
    local component_path=$1
    local component_name=$(basename "$component_path" .tsx)
    local relative_path=$(dirname "$component_path" | sed 's|^components/||')

    # 跳过测试文件和故事文件
    if [[ "$component_name" == *.test ]] || [[ "$component_name" == *.stories ]]; then
        return
    fi

    total_components=$((total_components + 1))

    # 确定分类
    local category=""
    if [[ "$relative_path" == "ui" ]]; then
        category="ui"
    elif [[ "$relative_path" == "layout" ]]; then
        category="layout"
    elif [[ "$relative_path" == "common" ]]; then
        category="common"
    elif [[ "$relative_path" == ui ]]; then
        category="ui"
    else
        # 功能特定组件
        category="$relative_path"
    fi

    # 构建skill文档路径（支持两种结构）
    # 从skill目录返回到项目根目录（../../../）
    local skill_path1="../../../.claude/skills/component-library/${category}/${component_name}.md"
    local skill_path2="../../../.claude/skills/component-library/${category}/${component_name}.skill"

    local skill_path=""
    if [ -f "$skill_path1" ]; then
        skill_path="$skill_path1"
    elif [ -f "$skill_path2" ]; then
        skill_path="$skill_path2"
    fi

    if [ -n "$skill_path" ]; then
        echo -e "${GREEN}✅${NC} $component_name (${category})"
        documented_components=$((documented_components + 1))

        # 检查文档是否过时（简单检查：比较修改时间）
        if [ "$component_path" -nt "$skill_path" ]; then
            echo -e "  ${YELLOW}⚠️  文档可能过时（组件代码比文档新）${NC}"
            echo "$component_name|$category|outdated" >> "$TMP_REPORT"
            outdated_components=$((outdated_components + 1))
        fi
    else
        echo -e "${RED}❌${NC} $component_name (${category}) - 缺少skill文档"
        echo "$component_name|$category|missing" >> "$TMP_REPORT"
        missing_components=$((missing_components + 1))
    fi
}

# 检查是否安装了必要的工具
check_requirements() {
    if ! command -v find &> /dev/null; then
        echo -e "${RED}❌ 错误：缺少 'find' 命令${NC}"
        exit 1
    fi

    if ! command -v grep &> /dev/null; then
        echo -e "${RED}❌ 错误：缺少 'grep' 命令${NC}"
        exit 1
    fi
}

# 扫描所有组件
scan_components() {
    echo ""
    echo "📦 扫描组件目录..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 检查components目录是否存在
    if [ ! -d "components" ]; then
        echo -e "${YELLOW}⚠️  警告：components目录不存在${NC}"
        exit 0
    fi

    # 扫描components/目录
    find components -type f -name "*.tsx" 2>/dev/null | sort | while read -r component; do
        check_component_skill "$component"
    done
}

# 输出报告
generate_report() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 验证报告"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "总组件数：${BLUE}$total_components${NC}"
    echo -e "${GREEN}已文档化：$documented_components${NC}"
    echo -e "${RED}缺少文档：$missing_components${NC}"
    echo -e "${YELLOW}文档过时：$outdated_components${NC}"

    # 计算覆盖率
    if [ $total_components -gt 0 ]; then
        coverage=$((documented_components * 100 / total_components))
        echo -e "覆盖率：${BLUE}${coverage}%${NC}"
    fi

    # 检查是否失败
    if [ $missing_components -gt 0 ] || [ $outdated_components -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ 验证失败！${NC}"
        echo ""
        echo "需要处理的组件："
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        if [ -s "$TMP_REPORT" ]; then
            while IFS='|' read -r name category status; do
                if [ "$status" = "missing" ]; then
                    echo -e "${RED}✗${NC} $name ($category) - 需要创建skill文档"
                else
                    echo -e "${YELLOW}⚠${NC} $name ($category) - 需要更新skill文档"
                fi
            done < "$TMP_REPORT"
        fi

        echo ""
        echo "💡 快速修复："
        echo "  1. 查看模板：.claude/skills/component-library/SKILL_TEMPLATE.md"
        echo "  2. 创建skill文档："
        echo "     cp .claude/skills/component-library/SKILL_TEMPLATE.md \\"
        echo "        .claude/skills/component-library/[category]/[component-name].md"
        echo "  3. 更新L1索引：.claude/skills/component-library-guide.skill"
        echo ""
        return 1
    else
        echo ""
        echo -e "${GREEN}✅ 所有组件都有完整的skill文档！${NC}"
        return 0
    fi
}

# 主流程
main() {
    check_requirements
    scan_components
    generate_report
}

# 执行主流程
main "$@"
