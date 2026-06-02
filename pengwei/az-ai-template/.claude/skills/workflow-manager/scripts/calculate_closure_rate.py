#!/usr/bin/env python3
"""
Calculate user journey closure rate from test reports.

Extracts closure rate data from:
- playwright-test-report.md (primary)
- swagger-test-report.md (secondary)
- qa-report.md (tertiary)

Output format:
{
  "total_paths": N,
  "closed_paths": M,
  "closure_rate": P,
  "unclosed_paths": [...]
}
"""

import argparse
import json
import re
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(
        description="Calculate user journey closure rate"
    )
    parser.add_argument(
        "--plan-dir",
        required=True,
        help="Path to plan directory (e.g., .az/plan-xxx)",
    )
    parser.add_argument(
        "--report-type",
        choices=["playwright", "swagger", "qa"],
        default="playwright",
        help="Type of report to analyze (default: playwright)",
    )
    parser.add_argument(
        "--min-rate",
        type=int,
        default=100,
        help="Minimum acceptable closure rate percentage (default: 100)",
    )
    parser.add_argument(
        "--output",
        help="Output JSON file path (optional)",
    )
    return parser.parse_args()


def find_report_file(plan_dir: Path, report_type: str) -> Path:
    """Find the test report file."""
    report_filenames = {
        "playwright": "playwright-test-report.md",
        "swagger": "swagger-test-report.md",
        "qa": "qa-report.md",
    }

    report_file = plan_dir / report_filenames[report_type]

    if not report_file.exists():
        # Try communication subdirectory
        report_file = plan_dir / "communication" / report_filenames[report_type]

    if not report_file.exists():
        print(f"❌ FAIL: {report_filenames[report_type]} not found in {plan_dir}")
        sys.exit(1)

    return report_file


def extract_closure_rate_from_playwright(content: str) -> dict:
    """Extract closure rate from playwright-test-report.md."""
    result = {
        "total_paths": 0,
        "closed_paths": 0,
        "closure_rate": 0,
        "unclosed_paths": [],
    }

    # Pattern 1: Look for explicit closure rate statement
    closure_rate_pattern = r"闭合率[：:]\s*(\d+)%"
    match = re.search(closure_rate_pattern, content)

    if match:
        result["closure_rate"] = int(match.group(1))

    # Pattern 2: Look for total paths and closed paths
    total_pattern = r"总路径数[：:]\s*(\d+)"
    closed_pattern = r"闭合路径数[：:]\s*(\d+)"

    total_match = re.search(total_pattern, content)
    closed_match = re.search(closed_pattern, content)

    if total_match:
        result["total_paths"] = int(total_match.group(1))
    if closed_match:
        result["closed_paths"] = int(closed_match.group(1))

    # Pattern 3: Extract from test results table
    # Look for test cases with pass/fail status
    test_case_pattern = r"测试.*?[:：].*?(?:通过|失败|passed|failed)"
    test_cases = re.findall(test_case_pattern, content, re.IGNORECASE)

    if test_cases:
        result["total_paths"] = len(test_cases)
        passed_cases = [t for t in test_cases if "通过" in t or "passed" in t.lower()]
        result["closed_paths"] = len(passed_cases)

    # Calculate closure rate if not explicitly stated
    if result["total_paths"] > 0 and result["closure_rate"] == 0:
        result["closure_rate"] = int(
            (result["closed_paths"] / result["total_paths"]) * 100
        )

    # Extract unclosed paths if mentioned
    unclosed_pattern = r"未闭合路径[：:]\s*(.+?)(?:\n|$)"
    unclosed_match = re.search(unclosed_pattern, content)
    if unclosed_match:
        unclosed_text = unclosed_match.group(1).strip()
        result["unclosed_paths"] = [
            path.strip() for path in unclosed_text.split(",") if path.strip()
        ]

    return result


def extract_closure_rate_from_swagger(content: str) -> dict:
    """Extract closure rate from swagger-test-report.md."""
    # Swagger tests focus on API completeness, less about user journeys
    # Return basic structure
    result = {
        "total_paths": 0,
        "closed_paths": 0,
        "closure_rate": 0,
        "unclosed_paths": [],
        "note": "Swagger tests don't typically measure closure rate",
    }

    # Look for API endpoint pass rate as proxy
    pass_rate_pattern = r"通过率[：:]\s*(\d+)%"
    match = re.search(pass_rate_pattern, content)

    if match:
        result["closure_rate"] = int(match.group(1))
        result["note"] = "Using API pass rate as proxy for closure rate"

    return result


def extract_closure_rate_from_qa(content: str) -> dict:
    """Extract closure rate from qa-report.md."""
    result = {
        "total_paths": 0,
        "closed_paths": 0,
        "closure_rate": 0,
        "unclosed_paths": [],
    }

    # Look for manual verification closure rate
    closure_rate_pattern = r"闭合率[：:]\s*(\d+)%"
    match = re.search(closure_rate_pattern, content)

    if match:
        result["closure_rate"] = int(match.group(1))

    # Look for manual verification counts
    verified_pattern = r"验证通过[：:]\s*(\d+)"
    total_pattern = r"总验证数[：:]\s*(\d+)"

    verified_match = re.search(verified_pattern, content)
    total_match = re.search(total_pattern, content)

    if verified_match and total_match:
        result["closed_paths"] = int(verified_match.group(1))
        result["total_paths"] = int(total_match.group(1))

    return result


def calculate_closure_rate(report_file: Path, report_type: str) -> dict:
    """Calculate closure rate from report file."""
    content = report_file.read_text(encoding="utf-8")

    if report_type == "playwright":
        return extract_closure_rate_from_playwright(content)
    elif report_type == "swagger":
        return extract_closure_rate_from_swagger(content)
    elif report_type == "qa":
        return extract_closure_rate_from_qa(content)
    else:
        return {
            "total_paths": 0,
            "closed_paths": 0,
            "closure_rate": 0,
            "unclosed_paths": [],
        }


def validate_closure_rate(result: dict, min_rate: int) -> bool:
    """Validate that closure rate meets minimum requirement."""
    if result["closure_rate"] < min_rate:
        return False

    return True


def print_result(result: dict, min_rate: int):
    """Print calculation result."""
    print(f"\n📊 Closure Rate Calculation Result:")
    print("=" * 60)

    if result.get("note"):
        print(f"ℹ️  Note: {result['note']}")

    print(f"Total paths: {result['total_paths']}")
    print(f"Closed paths: {result['closed_paths']}")
    print(f"Closure rate: {result['closure_rate']}%")
    print(f"Minimum required: {min_rate}%")

    if result["unclosed_paths"]:
        print(f"\nUnclosed paths:")
        for path in result["unclosed_paths"]:
            print(f"  - {path}")

    print("=" * 60)


def main():
    args = parse_args()
    plan_dir = Path(args.plan_dir)

    if not plan_dir.exists():
        print(f"❌ FAIL: Plan directory {plan_dir} does not exist")
        sys.exit(1)

    print(f"\n🔍 Calculating closure rate from {args.report_type} report")
    print(f"   Plan directory: {plan_dir}")

    # Find report file
    report_file = find_report_file(plan_dir, args.report_type)
    print(f"   Report file: {report_file}")

    # Calculate closure rate
    result = calculate_closure_rate(report_file, args.report_type)

    # Print result
    print_result(result, args.min_rate)

    # Validate
    if not validate_closure_rate(result, args.min_rate):
        print(f"\n❌ FAIL: Closure rate {result['closure_rate']}% is below minimum {args.min_rate}%")
        sys.exit(1)

    print(f"\n✅ SUCCESS: Closure rate {result['closure_rate']}% meets minimum {args.min_rate}%")

    # Output to file if requested
    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(result, indent=2, ensure_ascii=False))
        print(f"📄 Result saved to: {output_path}")


if __name__ == "__main__":
    main()
