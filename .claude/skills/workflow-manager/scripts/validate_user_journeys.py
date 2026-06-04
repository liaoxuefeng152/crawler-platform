#!/usr/bin/env python3
"""
Validate user journeys document completeness and quality.

This script checks that user-journeys.md exists and meets all requirements:
- File exists
- At least 3 user journeys defined
- Each journey has complete operation paths
- Expected closure rate >= 90%
"""

import argparse
import re
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Validate user journeys document completeness"
    )
    parser.add_argument(
        "--plan-dir",
        required=True,
        help="Path to plan directory (e.g., .az/plan-xxx)",
    )
    parser.add_argument(
        "--min-journeys",
        type=int,
        default=3,
        help="Minimum number of user journeys required (default: 3)",
    )
    parser.add_argument(
        "--min-closure-rate",
        type=int,
        default=90,
        help="Minimum expected closure rate percentage (default: 90)",
    )
    return parser.parse_args()


def check_file_exists(plan_dir: Path) -> Path:
    """Check if user-journeys.md exists."""
    user_journeys_file = plan_dir / "user-journeys.md"

    if not user_journeys_file.exists():
        print(f"❌ FAIL: user-journeys.md not found in {plan_dir}")
        sys.exit(1)

    print(f"✅ PASS: user-journeys.md exists")
    return user_journeys_file


def count_user_journeys(content: str, min_journeys: int) -> int:
    """Count user journeys and validate minimum."""
    # Count journey headers (## or ### followed by journey name)
    journey_pattern = r"^##+\s+.*旅程|Journey.*|用户旅程"
    journeys = re.findall(journey_pattern, content, re.MULTILINE)

    journey_count = len(journeys)

    if journey_count < min_journeys:
        print(
            f"❌ FAIL: Only {journey_count} user journeys found (minimum: {min_journeys})"
        )
        sys.exit(1)

    print(f"✅ PASS: {journey_count} user journeys defined (minimum: {min_journeys})")
    return journey_count


def check_operation_paths(content: str) -> bool:
    """Check if journeys have complete operation paths."""
    # Look for path indicators: 起点, 操作, 终点, 返回
    required_keywords = ["起点", "操作", "终点", "返回"]

    missing_keywords = []
    for keyword in required_keywords:
        if keyword not in content:
            missing_keywords.append(keyword)

    if missing_keywords:
        print(f"❌ FAIL: Missing operation path keywords: {missing_keywords}")
        return False

    print(f"✅ PASS: Operation paths contain all required elements")
    return True


def check_closure_rate(content: str, min_rate: int) -> int:
    """Extract and validate expected closure rate."""
    # Look for closure rate pattern
    closure_pattern = r"闭合率.*?(\d+)%"
    match = re.search(closure_pattern, content)

    if not match:
        print(f"⚠️  WARNING: No closure rate found in document")
        return 0

    closure_rate = int(match.group(1))

    if closure_rate < min_rate:
        print(
            f"❌ FAIL: Closure rate {closure_rate}% is below minimum {min_rate}%"
        )
        sys.exit(1)

    print(f"✅ PASS: Closure rate {closure_rate}% meets minimum {min_rate}%")
    return closure_rate


def check_visual_entry_points(content: str) -> bool:
    """Check if visual entry points are defined."""
    if "可视化入口" not in content and "视觉入口" not in content:
        print(f"⚠️  WARNING: No visual entry points (可视化入口) defined")
        return False

    print(f"✅ PASS: Visual entry points defined")
    return True


def check_operation_path_list(content: str) -> bool:
    """Check if operation path list is defined."""
    if "可操作路径" not in content and "操作路径清单" not in content:
        print(f"⚠️  WARNING: No operation path list (可操作路径) defined")
        return False

    print(f"✅ PASS: Operation path list defined")
    return True


def main():
    args = parse_args()
    plan_dir = Path(args.plan_dir)

    if not plan_dir.exists():
        print(f"❌ FAIL: Plan directory {plan_dir} does not exist")
        sys.exit(1)

    print(f"\n🔍 Validating user journeys in {plan_dir}")
    print("=" * 60)

    # Step 1: Check file exists
    user_journeys_file = check_file_exists(plan_dir)

    # Read content
    content = user_journeys_file.read_text(encoding="utf-8")

    # Step 2: Count user journeys
    journey_count = count_user_journeys(content, args.min_journeys)

    # Step 3: Check operation paths completeness
    check_operation_paths(content)

    # Step 4: Check closure rate
    closure_rate = check_closure_rate(content, args.min_closure_rate)

    # Step 5: Check visual entry points
    check_visual_entry_points(content)

    # Step 6: Check operation path list
    check_operation_path_list(content)

    print("=" * 60)
    print(f"✅ SUCCESS: All validation checks passed!")
    print(f"   - User journeys: {journey_count}")
    print(f"   - Closure rate: {closure_rate}%")


if __name__ == "__main__":
    main()
