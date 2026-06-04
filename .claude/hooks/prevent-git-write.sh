#!/bin/bash

###############################################################################
# Claude Code Hook: Git操作权限控制
# 功能：阻止AI自动执行git commit/push，强制用户手动操作
###############################################################################

# 从环境变量获取工具输入
TOOL_INPUT="${CLAUDE_TOOL_INPUT:-}"

# 提取git命令
if command -v jq &> /dev/null; then
    GIT_COMMAND=$(echo "$TOOL_INPUT" | jq -r '.command // empty' 2>/dev/null || echo "")
else
    # 降级方案：如果没有jq，使用grep提取
    GIT_COMMAND=$(echo "$TOOL_INPUT" | grep -oP '"command":\s*"\K[^"]+' || echo "")
fi

# 检查是否为被禁止的Git操作
if echo "$GIT_COMMAND" | grep -q -E 'git\s+(add|commit|push|pull)'; then
    # 返回阻止决定（JSON格式）
    cat <<EOF
{
  "decision": "block",
  "reason": "🚫 Git写入操作被阻止：根据项目配置，AI不能自动执行git add/commit/push操作。\n\n📋 正确流程：\n1. AI负责编写代码\n2. 您负责审查代码质量\n3. 您手动执行Git操作\n\n请手动执行以下命令：\n  $GIT_COMMAND\n\n🔗 配置说明：.az/docs/claude/git-permissions-config.md"
}
EOF
    exit 0
fi

# 允许其他操作
echo '{"decision": "approve"}'
exit 0
