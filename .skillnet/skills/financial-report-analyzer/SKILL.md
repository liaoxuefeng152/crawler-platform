---
name: financial-report-analyzer
version: 0.0.1
description: 分析财务报表，包括资产负债表、利润表和现金流量表
tags: financial, analysis, report, 财务分析
category: finance
---

# 财务报表分析技能

## 描述
分析企业财务报表，计算关键财务指标，生成财务健康评估报告。

## 能力
- 解析和分析资产负债表
- 计算财务比率（流动性、盈利能力、杠杆率）
- 生成财务健康摘要
- 跨期财务指标比较
- 计算营运资本分析
- 生成趋势分析报告

## 输入格式
```json
{
  "report_type": "balance_sheet | income_statement | cash_flow",
  "data": {
    "current_assets": 0,
    "current_liabilities": 0,
    "total_assets": 0,
    "total_liabilities": 0,
    "equity": 0,
    "net_income": 0,
    "revenue": 0,
    "inventory": 0
  },
  "period": "2025-Q4",
  "compare_period": "2025-Q3"
}
```

## 输出格式
```json
{
  "analysis": {
    "liquidity": "评估结果",
    "profitability": "评估结果",
    "leverage": "评估结果"
  },
  "ratios": {
    "current_ratio": 0,
    "quick_ratio": 0,
    "debt_to_equity": 0,
    "roe": 0,
    "roa": 0,
    "net_profit_margin": 0
  },
  "summary": "财务健康综合评估",
  "trend_analysis": {}
}
```

## 使用说明
此技能帮助AI Agent分析财务数据并从财务报表中生成有意义的洞察。

## 财务比率计算公式
- **流动比率** = 流动资产 / 流动负债
- **速动比率** = (流动资产 - 存货) / 流动负债
- **资产负债率** = 总负债 / 总资产
- **ROE** = 净利润 / 股东权益
- **ROA** = 净利润 / 总资产
- **净利润率** = 净利润 / 营业收入
