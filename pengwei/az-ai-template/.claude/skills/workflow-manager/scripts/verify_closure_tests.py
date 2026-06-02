#!/usr/bin/env python3
"""
Verify that E2E tests include navigation/closure tests (P0强制检查).

This is a P0 blocking check - if validation fails, it triggers rework.
Checks that test files contain:
- Return button tests
- Closure/loop tests
- Navigation test keywords
- Distinction between functional and navigation tests
"""

import argparse
import re
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Verify E2E navigation tests completeness (P0强制检查)"
    )
    parser.add_argument(
        "--plan-dir",
        required=True,
        help="Path to plan directory (e.g., .az/plan-xxx)",
    )
    parser.add_argument(
        "--module",
        help="Module name to locate test files (e.g., users, orders)",
    )
    return parser.parse_args()


def find_test_files(plan_dir: Path, module: str = None) -> list[Path]:
    """Find E2E test files."""
    # Common test file locations
    search_paths = [
        plan_dir.parent / "e2e" / module,
        plan_dir.parent.parent / "e2e" / module,
        Path("e2e") / module,
    ]

    test_files = []
    for search_path in search_paths:
        if search_path.exists():
            test_files = list(search_path.glob("*.spec.ts"))
            if test_files:
                break

    if not test_files:
        # Try searching in parent directories
        for parent in [plan_dir.parent, plan_dir.parent.parent]:
            potential_tests = list(parent.rglob("*.spec.ts"))
            if potential_tests:
                test_files = potential_tests
                break

    return test_files


def check_test_files_exist(test_files: list[Path]) -> bool:
    """Check if test files exist."""
    if not test_files:
        print(f"❌ FAIL: No E2E test files found")
        return False

    print(f"✅ PASS: Found {len(test_files)} E2E test files")
    for test_file in test_files:
        print(f"   - {test_file.name}")
    return True


def analyze_test_file(test_file: Path) -> dict:
    """Analyze a single test file for navigation tests."""
    content = test_file.read_text(encoding="utf-8")

    analysis = {
        "has_return_button_test": False,
        "has_closure_test": False,
        "navigation_keywords_count": 0,
        "has_functional_tests": False,
        "has_navigation_tests": False,
    }

    # Check for return button tests
    return_button_patterns = [
        r"返回按钮",
        r"back.*button",
        r"return.*button",
        r"测试.*返回",
        r"test.*return",
    ]
    for pattern in return_button_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            analysis["has_return_button_test"] = True
            break

    # Check for closure/loop tests
    closure_patterns = [
        r"闭环",
        r"closure",
        r"完整.*路径",
        r"complete.*path",
        r"往返",
        r"roundtrip",
    ]
    for pattern in closure_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            analysis["has_closure_test"] = True
            break

    # Count navigation keywords
    navigation_keywords = [
        "导航", "navigate", "返回", "return", "back", "router",
        "页面跳转", "page.*transition", "路由", "routing"
    ]
    for keyword in navigation_keywords:
        count = len(re.findall(keyword, content, re.IGNORECASE))
        analysis["navigation_keywords_count"] += count

    # Check for functional tests (non-navigation)
    functional_patterns = [
        r"提交.*表单",
        r"submit.*form",
        r"保存.*数据",
        r"save.*data",
        r"创建.*成功",
        r"create.*success",
    ]
    for pattern in functional_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            analysis["has_functional_tests"] = True
            break

    # Check for explicit navigation tests
    navigation_test_patterns = [
        r"导航.*测试",
        r"navigation.*test",
        r"测试.*导航",
        r"test.*navigation",
    ]
    for pattern in navigation_test_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            analysis["has_navigation_tests"] = True
            break

    return analysis


def verify_navigation_tests(test_files: list[Path]) -> bool:
    """Verify that test files include navigation tests."""
    all_passed = True

    print(f"\n📊 Analyzing test files for navigation tests:")
    print("-" * 60)

    for test_file in test_files:
        print(f"\n📄 {test_file.name}:")
        analysis = analyze_test_file(test_file)

        # Check return button test
        if analysis["has_return_button_test"]:
            print(f"   ✅ Has return button test")
        else:
            print(f"   ❌ Missing return button test")
            all_passed = False

        # Check closure test
        if analysis["has_closure_test"]:
            print(f"   ✅ Has closure/loop test")
        else:
            print(f"   ❌ Missing closure/loop test")
            all_passed = False

        # Navigation keywords
        if analysis["navigation_keywords_count"] > 0:
            print(f"   ✅ Navigation keywords: {analysis['navigation_keywords_count']}")
        else:
            print(f"   ❌ No navigation keywords found")
            all_passed = False

        # Test type distinction
        if analysis["has_functional_tests"]:
            print(f"   ✅ Has functional tests")
        if analysis["has_navigation_tests"]:
            print(f"   ✅ Has explicit navigation tests")

    return all_passed


def check_p0_blocking_criteria(test_files: list[Path]) -> bool:
    """
    P0 blocking criteria check.

    All test files must:
    1. Contain return button tests
    2. Contain closure tests
    3. Have navigation keywords > 0
    """
    print(f"\n🚨 P0 Blocking Criteria Check:")
    print("-" * 60)

    all_passed = True

    for test_file in test_files:
        analysis = analyze_test_file(test_file)

        if not analysis["has_return_button_test"]:
            print(f"❌ P0 FAIL: {test_file.name} missing return button test")
            all_passed = False

        if not analysis["has_closure_test"]:
            print(f"❌ P0 FAIL: {test_file.name} missing closure test")
            all_passed = False

        if analysis["navigation_keywords_count"] == 0:
            print(f"❌ P0 FAIL: {test_file.name} has no navigation keywords")
            all_passed = False

    return all_passed


def main():
    args = parse_args()
    plan_dir = Path(args.plan_dir)

    if not plan_dir.exists():
        print(f"❌ FAIL: Plan directory {plan_dir} does not exist")
        sys.exit(1)

    print(f"\n🔍 Verifying E2E navigation tests (P0强制检查)")
    print("=" * 60)

    # Find test files
    test_files = find_test_files(plan_dir, args.module)

    # Check test files exist
    if not check_test_files_exist(test_files):
        print(f"\n❌ P0 FAIL: No test files found - triggers rework")
        sys.exit(1)

    # Verify navigation tests
    navigation_tests_ok = verify_navigation_tests(test_files)

    # P0 blocking criteria check
    p0_check_passed = check_p0_blocking_criteria(test_files)

    print("=" * 60)

    if not p0_check_passed:
        print(f"\n🚨 P0 FAIL: Navigation tests incomplete")
        print(f"   ⚠️  This triggers rework:")
        print(f"      1. test-expert must supplement navigation test cases")
        print(f"      2. Re-run tests")
        print(f"      3. Re-verify")
        sys.exit(1)

    print(f"\n✅ SUCCESS: All P0 navigation test checks passed!")


if __name__ == "__main__":
    main()
