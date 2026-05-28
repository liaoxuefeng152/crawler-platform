#!/bin/bash

###############################################################################
# Claude Code Hooks 简化验证脚本
###############################################################################

echo "🔍 Claude Code Hooks 配置验证"
echo "================================"
echo ""

SUCCESS=0
TOTAL=0

check() {
    local name="$1"
    local test="$2"

    ((TOTAL++))
    printf "%-50s" "$name"

    if eval "$test" 2>/dev/null; then
        echo -e "✅"
        ((SUCCESS++))
        return 0
    else
        echo -e "❌"
        return 1
    fi
}

echo "📁 文件检查"
echo "-----------"
check "配置文件存在" "[ -f .claude/settings.local.json ]"
check "Hook脚本存在" "[ -f .claude/hooks/prevent-git-write.sh ]"
check "Hook脚本可执行" "[ -x .claude/hooks/prevent-git-write.sh ]"

echo ""
echo "🔧 配置检查"
echo "-----------"
check "JSON语法正确" "python3 -m json.tool .claude/settings.local.json > /dev/null"
check "defaultMode正确" "grep -q '\"defaultMode\": \"respectPermissions\"' .claude/settings.local.json"
check "hooks配置存在" "grep -q '\"hooks\":' .claude/settings.local.json"
check "allowAdd=false" "grep -q '\"allowAdd\": false' .claude/settings.local.json"
check "allowCommit=false" "grep -q '\"allowCommit\": false' .claude/settings.local.json"
check "allowPush=false" "grep -q '\"allowPush\": false' .claude/settings.local.json"

echo ""
echo "🧪 功能测试"
echo "-----------"
# 测试git add被阻止
if output=$(export CLAUDE_TOOL_INPUT='{"command":"git add ."}' && bash .claude/hooks/prevent-git-write.sh 2>/dev/null); then
    if echo "$output" | grep -q '"decision": "block"'; then
        check "Hook阻止git add" "true"
    else
        check "Hook阻止git add" "false"
    fi
else
    check "Hook阻止git add" "false"
fi

# 测试git status被允许
if output=$(export CLAUDE_TOOL_INPUT='{"command":"git status"}' && bash .claude/hooks/prevent-git-write.sh 2>/dev/null); then
    if echo "$output" | grep -q '"decision": "approve"'; then
        check "Hook允许git status" "true"
    else
        check "Hook允许git status" "false"
    fi
else
    check "Hook允许git status" "false"
fi

echo ""
echo "================================"
echo "结果: $SUCCESS / $TOTAL 通过"
echo "================================"

if [ $SUCCESS -eq $TOTAL ]; then
    echo "✅ 所有检查通过！"
    echo ""
    echo "下一步："
    echo "1. 重启Claude Code"
    echo "2. 在Claude Code中执行: /hooks"
    echo "3. 验证Hook已加载"
    exit 0
else
    echo "⚠️  有 $((TOTAL - SUCCESS)) 个检查未通过"
    exit 1
fi
