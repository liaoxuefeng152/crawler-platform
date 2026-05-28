#!/bin/bash

# az-init 完整环境检查脚本
# 检查所有不可移植的配置项

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# 输出函数
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${MAGENTA}➤ $1${NC}"
    echo ""
}

# 检查函数
check_yolo_mode() {
    # 检查正确的YOLO模式配置项：permissions.defaultMode: "bypassPermissions"
    if grep -q '"defaultMode":.*"bypassPermissions"' ~/.claude/settings.json 2>/dev/null; then
        print_success "YOLO 模式已启用"
        return 0
    else
        print_warning "YOLO 模式未启用"
        return 1
    fi
}

check_claude_hud() {
    local installed=false
    local configured=false

    if [ -d "$HOME/.claude/plugins/marketplaces/claude-hud" ]; then
        print_success "claude-hud 插件已安装"
        installed=true
    else
        print_warning "claude-hud 插件未安装"
        installed=false
    fi

    if grep -q "claude-hud" ~/.claude/settings.json 2>/dev/null || \
       grep -q "claude-hud" ./.claude/settings.json 2>/dev/null; then
        print_success "claude-hud 配置已设置"
        configured=true
    else
        print_warning "claude-hud 配置未设置"
        configured=false
    fi

    if [ "$installed" = true ] && [ "$configured" = true ]; then
        return 0
    else
        return 1
    fi
}

check_project_plugins() {
    # 检查项目级 skills（这些是可移植的）
    if [ -d ".claude/skills" ]; then
        local skill_count=$(find .claude/skills -maxdepth 1 -type d | wc -l)
        skill_count=$((skill_count - 1)) # 减去当前目录
        print_success "项目级 Skills: $skill_count 个（可移植）"
        return 0
    else
        print_warning "项目级 Skills 目录不存在"
        return 1
    fi
}


check_project_deps() {
    # 检查项目依赖 - 必须验证核心依赖是否存在
    local has_node_modules=false
    local has_lock_file=false
    local has_core_deps=false

    if [ -d "node_modules" ]; then
        has_node_modules=true
    fi

    if [ -f "package-lock.json" ]; then
        has_lock_file=true
    fi

    # 检查核心依赖是否存在（验证真正安装完成）
    # 检查 Next.js 作为核心依赖的代表
    if [ -d "node_modules/next" ] && [ -d "node_modules/react" ]; then
        has_core_deps=true
    fi

    if [ "$has_node_modules" = true ] && [ "$has_lock_file" = true ] && [ "$has_core_deps" = true ]; then
        # 检查 package.json 是否比 node_modules 新
        if [ "package.json" -nt "node_modules" ] 2>/dev/null; then
            print_warning "项目依赖已安装，但 package.json 有更新"
            print_info "建议运行：npm install"
            return 2
        else
            print_success "项目依赖已安装并验证"
            return 0
        fi
    elif [ "$has_node_modules" = true ] && [ "$has_core_deps" = false ]; then
        print_warning "node_modules 目录存在，但核心依赖缺失"
        print_info "必须运行：npm install"
        return 1
    elif [ -d "node_modules" ]; then
        print_warning "node_modules 存在，但缺少 package-lock.json"
        print_info "建议运行：npm install"
        return 1
    else
        print_warning "项目依赖未安装"
        print_info "必须运行：npm install"
        return 1
    fi
}

# 安装项目依赖
install_project_deps() {
    print_header "📦 安装项目依赖"

    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        print_info "请先安装 Node.js 和 npm"
        return 1
    fi

    print_info "正在运行 npm install..."
    echo ""

    if npm install; then
        print_success "项目依赖安装成功"
        return 0
    else
        print_error "项目依赖安装失败"
        return 1
    fi
}

check_mcp_config() {
    # 检查 MCP 配置
    if [ -f ".claude/mcp.json" ]; then
        print_success "项目级 MCP 配置存在（可移植）"
        return 0
    else
        print_warning "项目级 MCP 配置不存在"
        return 1
    fi
}

check_permissions() {
    # 检查权限配置
    if [ -f ".claude/settings.local.json" ]; then
        print_success "项目权限配置存在（可移植）"
        return 0
    else
        print_warning "项目权限配置不存在"
        return 1
    fi
}

check_git_hooks() {
    # 检查 Git hooks
    if [ -f ".claude/hooks.json" ]; then
        print_success "Git hooks 配置存在（可移植）"
        return 0
    else
        print_warning "Git hooks 配置不存在"
        return 1
    fi
}

# 生成移植性报告
generate_portability_report() {
    print_header "📊 移植性分析报告"

    echo "以下配置项的移植性分析："
    echo ""

    # 可移植项
    echo -e "${GREEN}✅ 可通过 Git 传输的配置：${NC}"
    echo "  • 项目代码（所有源文件）"
    echo "  • .claude/skills/ (项目级技能)"
    echo "  • .claude/commands/ (自定义命令)"
    echo "  • .claude/settings.json (项目级配置)"
    echo "  • .claude/settings.local.json (权限配置)"
    echo "  • .claude/mcp.json (MCP 配置)"
    echo "  • .claude/hooks.json (Git hooks)"
    echo "  • 所有文档文件（.md 文件）"
    echo ""

    # 不可移植项
    echo -e "${YELLOW}⚠️  无法通过 Git 传输的配置：${NC}"
    echo "  • ~/.claude/plugins/ (用户级插件)"
    echo "    - claude-hud"
    
    echo "  • ~/.claude/settings.json (用户级配置)"
    echo "  • YOLO 模式配置"
    echo ""

    # 需要手动配置
    echo -e "${BLUE}ℹ️  需要团队成员手动配置：${NC}"
    echo "  1. 安装用户级插件（如果需要）"
    echo "  2. 启用 YOLO 模式（可选）"
    echo "  3. 配置 claude-hud（推荐）"
    echo ""
}

# 生成完整报告
generate_complete_report() {
    print_header "📋 完整配置报告"

    echo "开发环境配置状态："
    echo ""

    # 可移植项
    echo -e "${GREEN}可移植配置${NC}（通过 Git 自动同步）："

    if [ -d ".claude/skills" ]; then
        local skill_count=$(find .claude/skills -maxdepth 1 -type d 2>/dev/null | wc -l)
        skill_count=$((skill_count - 1))
        echo "  [✅] 项目级 Skills ($skill_count 个)"
    else
        echo "  [⚪] 项目级 Skills"
    fi

    if [ -f ".claude/mcp.json" ]; then
        echo "  [✅] MCP 配置"
    else
        echo "  [⚪] MCP 配置"
    fi

    if [ -f ".claude/settings.local.json" ]; then
        echo "  [✅] 权限配置"
    else
        echo "  [⚪] 权限配置"
    fi

    echo ""

    # 不可移植项
    echo -e "${YELLOW}不可移植配置${NC}（需要手动安装）："

    if grep -q '"defaultMode":.*"bypassPermissions"' ~/.claude/settings.json 2>/dev/null; then
        echo "  [✅] YOLO 模式"
    else
        echo "  [⚪] YOLO 模式"
    fi

    if [ -d "$HOME/.claude/plugins/marketplaces/claude-hud" ]; then
        echo "  [✅] claude-hud 插件"
    else
        echo "  [⚪] claude-hud 插件"
    fi

    echo ""
    echo "下一步操作："
    echo "  1. 运行 '/az-init' 完成环境配置"
    echo "  2. 运行 'npm run dev' 启动开发服务器"
    echo "  3. 查看 .claude/QUICKREF.md 了解更多信息"
}

# 主函数
main() {
    local mode="${1:-check}"

    case "$mode" in
        --check-only)
            # 仅检查模式
            print_header "🔍 环境配置检查"

            print_section "项目基础检查"
            check_project_deps || true

            print_section "可移植配置检查"
            check_project_plugins || true
            check_mcp_config || true
            check_permissions || true
            check_git_hooks || true

            print_section "不可移植配置检查"
            check_yolo_mode || true
            check_claude_hud || true
            check_user_plugins || true

            generate_portability_report
            generate_complete_report
            ;;

        --portability)
            # 移植性分析
            generate_portability_report
            ;;

        --install-deps)
            # 安装项目依赖
            install_project_deps
            exit $?
            ;;

        --help-plugins)
            # 显示插件帮助
            print_header "📎 用户级插件说明"

            cat << 'EOF'
用户级插件是安装在用户目录的插件，无法通过 Git 传输。

本项目中检测到的用户级插件：

1. claude-hud
   • 用途：UI 增强，在输入框下方显示状态栏
   • 安装：/plugin marketplace add jarrodwatts/claude-hud
   • 配置：/claude-hud:setup
   • 推荐：⭐⭐⭐⭐⭐

   • 用途：自动化迭代开发
   • 来源：claude-code-plugins 官方包
   • 安装：/plugin marketplace add claude-code-plugins
   • 推荐：⭐⭐⭐（适合复杂项目）

注意：
  • 这些插件不是必需的
  • 项目功能完全可运行
  • 安装仅为了提升开发体验
EOF
            ;;

        *)
            # 默认：完整检查
            print_header "🚀 az-init 开发环境初始化"

            echo "本命令将检查并引导您配置开发环境"
            echo ""

            print_section "项目基础检查"
            check_project_deps
            deps_status=$?

            # 如果依赖未安装，提供安装选项
            if [ $deps_status -ne 0 ]; then
                echo ""
                print_warning "检测到项目依赖问题"
                echo ""
                echo "是否现在运行 'npm install' 安装依赖？"
                echo "  [1] 是，立即安装"
                echo "  [2] 否，稍后手动安装"
                echo ""
                echo "提示：在 Claude Code 中运行 /az-init --install-deps 可直接安装"
                echo ""
            fi

            print_section "可移植配置（Git 自动同步）"
            check_project_plugins || true
            check_mcp_config || true
            check_permissions || true
            check_git_hooks || true

            print_section "不可移植配置（需要手动安装）"
            check_yolo_mode || true
            check_claude_hud || true
            check_user_plugins || true

            generate_portability_report
            generate_complete_report
            ;;
    esac
}

# 执行主函数
main "$@"
