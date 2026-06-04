---
name: loan-calculator
version: 0.0.1
description: 贷款计算器，支持等额本息、等额本金、先息后本等还款方式
tags: financial, loan, calculator, 贷款计算
category: finance
---

# 贷款计算器技能

## 描述
计算各种还款方式下的贷款月供、总利息、还款计划表。

## 能力
- 等额本息还款计算
- 等额本金还款计算
- 先息后本还款计算
- 提前还款分析
- 还款计划表生成

## 输入格式
```json
{
  "loan_type": "equal_installment | equal_principal | interest_only",
  "principal": 1000000,
  "annual_rate": 0.049,
  "term_months": 360,
  "prepayment": {
    "amount": 0,
    "month": 0,
    "type": "reduce_term | reduce_payment"
  }
}
```

## 输出格式
```json
{
  "monthly_payment": 0,
  "total_interest": 0,
  "total_payment": 0,
  "schedule": [
    {
      "month": 1,
      "payment": 0,
      "principal": 0,
      "interest": 0,
      "remaining": 0
    }
  ],
  "prepayment_analysis": {}
}
```

## 计算公式
- **等额本息**: 月供 = P × r × (1+r)^n / ((1+r)^n - 1)
- **等额本金**: 月供 = P/n + 剩余本金 × r
- **先息后本**: 月供 = P × r（到期还本）
