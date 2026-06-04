---
name: financial-ratio-analyzer
version: 0.0.1
description: 财务比率分析，支持杜邦分析、行业对标分析
tags: financial, ratio, dupont, 杜邦分析, 行业对标
category: finance
---

# 财务比率分析技能

## 描述
深度财务比率分析，支持杜邦分析分解和行业对标比较。

## 能力
- 五大类财务比率计算（流动性、盈利、杠杆、效率、市场）
- 杜邦分析三步分解
- 行业基准对标
- 异常指标预警
- 综合评分

## 输入格式
```json
{
  "company_data": {
    "current_assets": 0,
    "current_liabilities": 0,
    "inventory": 0,
    "total_assets": 0,
    "total_liabilities": 0,
    "equity": 0,
    "net_income": 0,
    "revenue": 0,
    "cogs": 0,
    "shares_outstanding": 0,
    "market_price": 0,
    "ebit": 0,
    "interest_expense": 0
  },
  "industry_benchmarks": {
    "current_ratio": 1.5,
    "debt_to_equity": 2.0,
    "roe": 0.15,
    "net_margin": 0.08
  }
}
```

## 输出格式
```json
{
  "ratios": {
    "liquidity": { "current_ratio": 0, "quick_ratio": 0, "cash_ratio": 0 },
    "profitability": { "gross_margin": 0, "net_margin": 0, "roe": 0, "roa": 0 },
    "leverage": { "debt_to_equity": 0, "debt_to_assets": 0, "interest_coverage": 0 },
    "efficiency": { "asset_turnover": 0, "inventory_turnover": 0, "receivables_turnover": 0 },
    "market": { "pe_ratio": 0, "pb_ratio": 0, "eps": 0 }
  },
  "dupont_analysis": {
    "roe": 0,
    "net_margin": 0,
    "asset_turnover": 0,
    "equity_multiplier": 0
  },
  "benchmark_comparison": {},
  "alerts": [],
  "overall_score": 0
}
```

## 杜邦分析公式
- **ROE** = 净利润率 × 资产周转率 × 权益乘数
- **净利润率** = 净利润 / 营业收入
- **资产周转率** = 营业收入 / 总资产
- **权益乘数** = 总资产 / 股东权益
