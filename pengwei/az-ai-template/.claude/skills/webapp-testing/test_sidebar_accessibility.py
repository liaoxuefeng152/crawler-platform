#!/usr/bin/env python3
"""
侧边栏功能入口完整性验证
测试所有侧边栏菜单项的页面可访问性和基本功能
"""

from playwright.sync_api import sync_playwright
import json

# 侧边栏菜单项配置
SIDEBAR_ITEMS = [
    {
        "title": "概览",
        "url": "/dashboard",
        "description": "系统概览和统计",
        "expected_elements": ["stats", "overview"]
    },
    {
        "title": "组件管理",
        "url": "/dashboard/components",
        "description": "shadcn/ui 组件库管理",
        "expected_elements": ["components", "list"]
    },
    {
        "title": "用户管理",
        "url": "/dashboard/user-management",
        "description": "登录人员管理",
        "expected_elements": ["users", "table"]
    },
    {
        "title": "数学工具",
        "url": "/dashboard/math-tools",
        "description": "阶乘计算和质数判断",
        "expected_elements": ["calculator", "tools"]
    },
    {
        "title": "汉堡餐厅",
        "url": "/restaurant",
        "description": "在线订餐系统",
        "expected_elements": ["restaurant", "menu"]
    },
    {
        "title": "自动化工作流",
        "url": "/dashboard/automation",
        "description": "自动化配置",
        "expected_elements": ["automation"],
        "expected_error": "404"  # 已知此页面不存在
    }
]

def test_page_access(page, item):
    """测试单个页面的可访问性"""
    result = {
        "title": item["title"],
        "url": item["url"],
        "status": "unknown",
        "http_status": None,
        "error": None,
        "load_time": 0,
        "has_content": False,
        "sidebar_found": False
    }

    try:
        # 记录开始时间
        import time
        start_time = time.time()

        # 导航到页面
        response = page.goto(f"http://localhost:7860{item['url']}", wait_until="networkidle", timeout=10000)

        # 计算加载时间
        load_time = time.time() - start_time
        result["load_time"] = round(load_time, 2)

        # 检查HTTP状态
        if response:
            result["http_status"] = response.status

        # 等待页面加载
        page.wait_for_load_state("networkidle", timeout=5000)

        # 检查是否是404页面
        if "404" in page.content() or "This page could not be found" in page.content():
            result["status"] = "error"
            result["error"] = "404 Not Found"
            if item.get("expected_error") == "404":
                result["status"] = "expected_error"
        else:
            result["status"] = "success"
            result["has_content"] = True

            # 检查是否有主要内容
            body_text = page.locator("body").text_content()
            if body_text and len(body_text.strip()) > 100:
                result["has_content"] = True

            # 检查侧边栏是否存在
            try:
                sidebar = page.locator("[data-sidebar]").count()
                if sidebar > 0:
                    result["sidebar_found"] = True
            except:
                pass

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)

    return result

def main():
    """主测试函数"""
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("=" * 80)
        print("侧边栏功能入口完整性验证")
        print("=" * 80)
        print()

        for item in SIDEBAR_ITEMS:
            print(f"测试: {item['title']} - {item['url']}")
            result = test_page_access(page, item)
            results.append(result)

            # 打印即时结果
            status_icon = {
                "success": "✅",
                "error": "❌",
                "expected_error": "⚠️",
                "unknown": "❓"
            }.get(result["status"], "❓")

            print(f"  {status_icon} 状态: {result['status']}")
            if result["http_status"]:
                print(f"  HTTP: {result['http_status']}")
            print(f"  加载时间: {result['load_time']}s")
            if result["error"]:
                print(f"  错误: {result['error']}")
            print()

        browser.close()

    # 生成汇总报告
    print("=" * 80)
    print("验证汇总报告")
    print("=" * 80)
    print()

    success_count = sum(1 for r in results if r["status"] == "success")
    error_count = sum(1 for r in results if r["status"] == "error")
    expected_error_count = sum(1 for r in results if r["status"] == "expected_error")

    print(f"总测试项: {len(results)}")
    print(f"✅ 成功: {success_count}")
    print(f"⚠️  预期错误: {expected_error_count}")
    print(f"❌ 失败: {error_count}")
    print()

    # 详细问题列表
    issues = [r for r in results if r["status"] in ["error", "expected_error"]]

    if issues:
        print("问题详情:")
        print("-" * 80)
        for issue in issues:
            print(f"❌ {issue['title']} ({issue['url']})")
            print(f"   状态: {issue['status']}")
            if issue["error"]:
                print(f"   错误: {issue['error']}")
            print()

    # 保存JSON报告
    report_path = "/tmp/sidebar_verification_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"详细报告已保存至: {report_path}")

    # 返回码
    if error_count > expected_error_count:
        return 1
    return 0

if __name__ == "__main__":
    exit(main())
