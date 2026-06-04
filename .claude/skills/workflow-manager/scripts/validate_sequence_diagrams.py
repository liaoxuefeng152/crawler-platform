#!/usr/bin/env python3
"""
验证时序图数量和质量

用途：在Plan阶段验证user-journeys.md中的时序图是否符合标准
验证项：
1. 时序图数量 ≥ min_diagrams
2. 每个时序图包含API路径标注（GET/POST/PUT/DELETE /api/xxx）
3. 步骤数 ≤ 7步（可选）
"""

import sys
import re
import argparse
from pathlib import Path


def validate_sequence_diagrams(plan_dir: str, min_diagrams: int = 3) -> bool:
    """
    验证时序图数量和质量

    Args:
        plan_dir: plan目录路径（如 .az/plan-202512251100）
        min_diagrams: 最少时序图数量

    Returns:
        bool: 验证是否通过
    """
    user_journeys = Path(plan_dir) / "user-journeys.md"

    # 检查文件存在
    if not user_journeys.exists():
        print(f"❌ 错误: user-journeys.md不存在")
        print(f"   路径: {user_journeys}")
        return False

    content = user_journeys.read_text(encoding="utf-8")

    # 统计mermaid代码块
    mermaid_pattern = r'```mermaid\s*sequenceDiagram.*?```'
    mermaid_blocks = re.findall(mermaid_pattern, content, re.DOTALL)
    diagram_count = len(mermaid_blocks)

    print(f"\n📊 时序图验证结果")
    print(f"=" * 50)
    print(f"文件: {user_journeys}")
    print(f"时序图数量: {diagram_count}")
    print(f"要求数量: ≥ {min_diagrams}")

    if diagram_count < min_diagrams:
        print(f"\n❌ 验证失败: 时序图数量不足")
        print(f"   当前: {diagram_count}个")
        print(f"   要求: ≥ {min_diagrams}个")
        print(f"\n💡 建议:")
        print(f"   确保每个功能模块都生成了对应的时序图")
        print(f"   使用 Skill(user-story-mermaid) 为每个模块生成时序图")
        return False

    # 验证每个时序图包含API路径
    api_pattern = r'(GET|POST|PUT|DELETE|PATCH)\s+/api/'
    api_results = []

    for i, block in enumerate(mermaid_blocks, 1):
        # 提取模块名称（从上下文中）
        module_pattern = rf'## 模块{i}[：:\s]+([^\n]+)'
        module_match = re.search(module_pattern, content)
        module_name = module_match.group(1).strip() if module_match else f"模块{i}"

        # 检查API路径
        api_matches = re.findall(api_pattern, block)
        api_count = len(api_matches)

        if api_count == 0:
            print(f"\n❌ 错误: 模块{i} '{module_name}' 时序图缺少API路径标注")
            print(f"   时序图必须包含完整的API路径（如 GET /api/auth/login）")
            return False

        # 统计步骤数（autonumber行）
        step_pattern = r'autonumber'
        has_autonumber = re.search(step_pattern, block) is not None

        # 统计箭头数量（步骤数估计）
        arrow_pattern = r'(-\s*-[\s>]+|-\s*\.\s*>[\s]+|-\s*-x\s+|-\s*-\\)'
        arrows = re.findall(arrow_pattern, block)
        step_count = len(arrows)

        api_results.append({
            "module": module_name,
            "apis": api_count,
            "steps": step_count,
            "has_autonumber": has_autonumber
        })

    # 打印详细结果
    print(f"\n✅ 时序图数量验证通过")
    print(f"\n📋 各模块时序图详情:")
    print(f"-" * 50)

    total_apis = 0
    for result in api_results:
        print(f"模块: {result['module']}")
        print(f"  - API路径数: {result['apis']}个")
        print(f"  - 步骤数: {result['steps']}步")
        total_apis += result['apis']

    print(f"-" * 50)
    print(f"API路径总数: {total_apis}个")
    print(f"\n✅ 所有时序图验证通过")

    # 返回成功
    print(f"\n🎉 时序图质量验证完成！")
    print(f"   - 时序图数量: {diagram_count}个 ✓")
    print(f"   - API路径标注: 全部包含 ✓")
    print(f"   - API路径总数: {total_apis}个（架构专家可基于此定义spec-api.md）")

    return True


def main():
    parser = argparse.ArgumentParser(
        description="验证user-journeys.md中的时序图数量和质量"
    )
    parser.add_argument(
        "--plan-dir",
        required=True,
        help="plan目录路径（如 .az/plan-202512251100）"
    )
    parser.add_argument(
        "--min-diagrams",
        type=int,
        default=3,
        help="最少时序图数量（默认3）"
    )

    args = parser.parse_args()

    success = validate_sequence_diagrams(args.plan_dir, args.min_diagrams)

    if not success:
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()