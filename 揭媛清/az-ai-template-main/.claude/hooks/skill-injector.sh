#!/bin/bash

###############################################################################
# 智能技能注入器 (Smart Skill Injector)
#
# 功能：根据用户输入的关键词和上下文，自动在用户输入前注入 skill 调用指令
# 这样 Claude Code 会先加载 skill，然后再响应用户请求
#
# 工作原理：
# 1. 拦截用户输入（通过 userPromptSubmit hook）
# 2. 检测输入中的关键词和上下文
# 3. 如果匹配特定场景，在用户输入前插入 skill 调用指令
# 4. 输出增强后的输入给 Claude Code
#
# @module .claude/hooks/skill-injector.sh
###############################################################################

# 用户输入（从 Claude Code 传入）
USER_PROMPT="$1"

# 技能注入内容（默认为空）
SKILL_INJECTION=""

###############################################################################
# 触发条件检测函数
###############################################################################

# 检测 React/Next.js 开发场景（强制调用 react-best-practices）
check_react_development() {
    local keywords=(
        "react" "next\.js" "nextjs" "component" "usestate" "useeffect"
        "tsx" "jsx" "props" "hook" "state" "渲染" "组件"
        "性能" "优化" "bundle" "suspense" "ssr" "csr"
        "app router" "page\.tsx" "layout\.tsx" "frontend"
        "前端开发" "react开发" "nextjs开发" "组件开发"
        "开发"  # 通用触发词：任何开发任务都应遵循最佳实践
        "调整" "修改" "实现" "创建" "添加"  # 常见开发动作
        "页面" "文件"  # 前端开发对象
    )

    local prompt_lower=$(echo "$USER_PROMPT" | tr '[:upper:]' '[:lower:]')

    for keyword in "${keywords[@]}"; do
        if echo "$prompt_lower" | grep -qE "$keyword"; then
            return 0
        fi
    done

    return 1
}

# 检测前端UI设计场景
check_frontend_design() {
    local keywords=(
        "界面设计" "ui设计" "ux设计" "页面设计" "样式设计"
        "美化页面" "设计风格" "配色" "布局设计"
    )

    local prompt_lower=$(echo "$USER_PROMPT" | tr '[:upper:]' '[:lower:]')

    for keyword in "${keywords[@]}"; do
        if echo "$prompt_lower" | grep -qE "$keyword"; then
            return 0
        fi
    done

    return 1
}

###############################################################################
# 主逻辑
###############################################################################

main() {
    # 检测 React/Next.js 开发场景
    if check_react_development; then
        # 注入 react-best-practices skill 调用指令
        SKILL_INJECTION="[SYSTEM] 在回答用户问题之前，请先调用 Skill(react-best-practices) 查询相关的 React/Next.js 性能优化规则，然后再进行开发或回答。\n\n"
    fi

    # 检测前端UI设计场景
    if check_frontend_design; then
        # 如果还没有注入，则注入 ui-ux-pro-max
        if [ -z "$SKILL_INJECTION" ]; then
            SKILL_INJECTION="[SYSTEM] 在回答用户问题之前，请先调用 Skill(ui-ux-pro-max) 获取UI/UX设计指导，然后再进行开发。\n\n"
        fi
    fi

    # 输出增强后的输入
    # 如果有注入内容，先输出注入内容，再输出用户原始输入
    if [ -n "$SKILL_INJECTION" ]; then
        printf "%s%s" "$SKILL_INJECTION" "$USER_PROMPT"
    else
        # 没有注入内容，直接输出用户原始输入
        printf "%s" "$USER_PROMPT"
    fi
}

# 执行主函数
main "$@"
