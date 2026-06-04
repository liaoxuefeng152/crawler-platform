#!/bin/bash
# Auto-continue Script - 自动继续工作流执行
# 用于在9阶段工作流中实现无中断的自动化执行

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PYTHON="$SCRIPT_DIR/workflow-coordinator.py"

echo "======================================"
echo "🔄 工作流自动继续检查"
echo "======================================"

# 检查是否应该自动继续
if python3 "$PYTHON" --auto-continue; then
    echo "✅ 工作流配置为自动继续模式"
    echo "📍 当前阶段:"
    python3 "$PYTHON" --next-stage
    echo ""
    echo "🚀 工作流将继续执行，不会暂停"
    exit 0
else
    echo "⚠️ 工作流未启用自动继续模式"
    echo "💡 如需启用自动继续，请在 workflow-state.json 中设置 autoContinue=true"
    exit 1
fi
