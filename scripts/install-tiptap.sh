#!/bin/bash

# Tiptap AI编辑器 - 依赖安装脚本
# 使用方法: bash scripts/install-tiptap.sh

echo "🚀 开始安装Tiptap AI编辑器依赖..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查npm是否可用
if ! command -v npm &> /dev/null
then
    echo "❌ 错误: npm未安装，请先安装Node.js和npm"
    exit 1
fi

echo "📦 安装核心依赖..."

# 安装Tiptap核心包
npm install @tiptap/core@^2.1.13 \
            @tiptap/react@^2.1.13 \
            @tiptap/starter-kit@^2.1.13 \
            @tiptap/extension-bubble-menu@^2.1.13 \
            @tiptap/extension-placeholder@^2.1.13 \
            @tiptap/extension-character-count@^2.1.13 \
            @tiptap/pm@^2.1.13

echo ""
echo "📦 安装状态管理和HTTP客户端..."

# 安装状态管理和HTTP客户端
npm install zustand@^4.4.7 \
            axios@^1.6.2

echo ""
echo "${GREEN}✅ 所有依赖安装完成！${NC}"
echo ""
echo "📚 下一步:"
echo "1. 查看安装指南: cat .az/docs/tiptap-research/installation-guide.md"
echo "2. 运行开发服务器: npm run dev"
echo "3. 访问演示页面:"
echo "   - 完整版: http://localhost:3000/ai-editor-demo"
echo "   - 简洁版: http://localhost:3000/simple-ai-editor"
echo ""
echo "💡 提示: 如果遇到问题，请查看安装指南中的常见问题部分"
