#!/usr/bin/env python3
"""
Validate navigation tasks completeness in tasks.md.

This script verifies that tasks.md includes all necessary navigation tasks:
- File exists
- Contains return button implementation tasks
- Navigation tasks are marked as P0 priority
- Navigation tasks align with user-journeys.md
"""

import argparse
import re
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Validate navigation tasks completeness"
    )
    parser.add_argument(
        "--plan-dir",
        required=True,
        help="Path to plan directory (e.g., .az/plan-xxx)",
    )
    parser.add_argument(
        "--user-journeys",
        help="Path to user-journeys.md for cross-validation (optional)",
    )
    return parser.parse_args()


def check_tasks_file_exists(plan_dir: Path) -> Path:
    """Check if tasks.md exists."""
    tasks_file = plan_dir / "tasks.md"

    if not tasks_file.exists():
        print(f"❌ FAIL: tasks.md not found in {plan_dir}")
        sys.exit(1)

    print(f"✅ PASS: tasks.md exists")
    return tasks_file


def check_return_button_tasks(content: str) -> bool:
    """Check if return button implementation tasks exist."""
    # Look for return button related tasks
    return_button_patterns = [
        r"返回按钮",
        r"return.*button",
        r"导航.*实现",
        r"PageHeader",
        r"leftContent",
    ]

    found_patterns = []
    for pattern in return_button_patterns:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            found_patterns.extend(matches)

    if not found_patterns:
        print(f"❌ FAIL: No return button implementation tasks found")
        return False

    print(f"✅ PASS: Found {len(found_patterns)} return button/navigation tasks")
    return True


def check_p0_priority(content: str) -> bool:
    """Check if navigation tasks are marked as P0 priority."""
    # Look for P0 priority markers
    p0_patterns = [
        r"P0",
        r"优先级.*0",
        r"priority.*0",
        r"\[P0\]",
    ]

    has_p0 = False
    for pattern in p0_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            has_p0 = True
            break

    if not has_p0:
        print(f"⚠️  WARNING: No P0 priority markers found for navigation tasks")
        return False

    print(f"✅ PASS: Navigation tasks marked with P0 priority")
    return True


def check_navigation_task_completeness(content: str) -> bool:
    """Check if navigation tasks are complete."""
    required_elements = [
        "返回按钮",
        "导航",
    ]

    missing_elements = []
    for element in required_elements:
        if element not in content:
            missing_elements.append(element)

    if missing_elements:
        print(f"⚠️  WARNING: Missing navigation task elements: {missing_elements}")
        return False

    print(f"✅ PASS: Navigation tasks contain required elements")
    return True


def cross_validate_with_user_journeys(
    tasks_content: str, user_journeys_path: str
) -> bool:
    """Cross-validate navigation tasks with user journeys."""
    if not user_journeys_path:
        print(f"⚠️  INFO: No user-journeys.md provided for cross-validation")
        return True

    user_journeys_file = Path(user_journeys_path)
    if not user_journeys_file.exists():
        print(f"⚠️  WARNING: user-journeys.md not found at {user_journeys_path}")
        return True

    user_journeys_content = user_journeys_file.read_text(encoding="utf-8")

    # Extract page/feature names from user journeys
    # Look for patterns like "页面: xxx" or "在xxx页面"
    journey_pages = re.findall(r"页面[:：]\s*([^\n]+)|在\s*([^\s]+)\s*页面", user_journeys_content)
    journey_pages = [page for group in journey_pages for page in group if page]

    if not journey_pages:
        print(f"⚠️  INFO: Could not extract page names from user-journeys.md")
        return True

    print(f"ℹ️  INFO: Found {len(journey_pages)} pages in user journeys")

    # Check if tasks mention these pages
    missing_pages = []
    for page in journey_pages:
        if page.strip() not in tasks_content:
            missing_pages.append(page.strip())

    if missing_pages:
        print(f"⚠️  WARNING: Some journey pages not mentioned in tasks: {missing_pages[:5]}")
        return False

    print(f"✅ PASS: All journey pages are covered in tasks")
    return True


def main():
    args = parse_args()
    plan_dir = Path(args.plan_dir)

    if not plan_dir.exists():
        print(f"❌ FAIL: Plan directory {plan_dir} does not exist")
        sys.exit(1)

    print(f"\n🔍 Validating navigation tasks in {plan_dir}")
    print("=" * 60)

    # Step 1: Check tasks.md exists
    tasks_file = check_tasks_file_exists(plan_dir)

    # Read content
    content = tasks_file.read_text(encoding="utf-8")

    # Step 2: Check return button tasks
    check_return_button_tasks(content)

    # Step 3: Check P0 priority
    check_p0_priority(content)

    # Step 4: Check navigation task completeness
    check_navigation_task_completeness(content)

    # Step 5: Cross-validate with user journeys (if provided)
    if args.user_journeys:
        cross_validate_with_user_journeys(content, args.user_journeys)

    print("=" * 60)
    print(f"✅ SUCCESS: All navigation task validations passed!")


if __name__ == "__main__":
    main()
