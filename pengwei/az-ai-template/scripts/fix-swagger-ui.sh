#!/bin/bash

# Swagger UI 快速修复脚本

echo "=== Swagger UI 快速修复 ==="
echo ""

# 检查开发服务器是否运行
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ 开发服务器未运行"
    echo ""
    echo "正在启动开发服务器..."
    echo "提示: 请在新的终端窗口运行: npm run dev"
    echo ""
    exit 1
fi

echo "✅ 开发服务器运行中"
echo ""

# 1. 重新生成 OpenAPI 文档
echo "1️⃣  重新生成 OpenAPI 文档..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ 文档生成成功"
else
    echo "   ❌ 文档生成失败"
    exit 1
fi

# 2. 验证 openapi.json
echo ""
echo "2️⃣  验证 openapi.json..."
if [ -f "public/openapi.json" ]; then
    SIZE=$(wc -c < "public/openapi.json")
    echo "   ✅ 文件存在 ($SIZE 字节)"
else
    echo "   ❌ 文件不存在"
    exit 1
fi

# 3. 测试 HTTP 访问
echo ""
echo "3️⃣  测试 HTTP 访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/openapi.json)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ openapi.json 可访问 (HTTP $HTTP_CODE)"
else
    echo "   ❌ 访问失败 (HTTP $HTTP_CODE)"
    exit 1
fi

# 4. 测试 api-docs 页面
echo ""
echo "4️⃣  测试 api-docs 页面..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api-docs)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ api-docs 可访问 (HTTP $HTTP_CODE)"
else
    echo "   ❌ 访问失败 (HTTP $HTTP_CODE)"
    exit 1
fi

echo ""
echo "=== 修复完成 ✅ ==="
echo ""
echo "📖 访问文档: http://localhost:3000/api-docs"
echo ""
echo "🔍 如果页面仍然显示空白："
echo "   1. 打开浏览器控制台 (F12)"
echo "   2. 查看 [Swagger UI] 开头的日志"
echo "   3. 运行详细诊断: ./scripts/test-swagger-ui.sh"
echo "   4. 查看故障排查文档: docs/SWAGGER_UI.md"
echo ""
echo "💡 提示: 按 Ctrl+C 可以刷新页面"
echo ""

# 可选：自动打开浏览器（根据系统）
if command -v xdg-open > /dev/null; then
    read -p "是否自动打开浏览器? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:3000/api-docs
    fi
elif command -v open > /dev/null; then
    read -p "是否自动打开浏览器? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000/api-docs
    fi
fi
