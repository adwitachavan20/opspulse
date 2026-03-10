# OpsPulse — Business Stress Score Formula Justification

**Team:** [Your Team Name]
**Domain:** Web Development — HORIZON 1.0
**Business Type:** E-commerce SMB (General Retail)

---

## Formula

**Business Stress Score (BSS) = (SalesStress × 0.35) + (InventoryStress × 0.25) + (SupportStress × 0.20) + (CashStress × 0.20)**

All component scores are normalized to 0–100. The BSS represents operational risk, where **higher = more stressed/at-risk**.

---

## Component Breakdown

### 1. Sales Stress (Weight: 35%)
```
SalesStress = (1 - conversion_rate/5) × 40 + max(0, 1 - revenue/₹50,000) × 60
```
**Justification:** Sales is the lifeblood of any SMB. Revenue shortfalls and poor conversion directly threaten viability. We weight revenue attainment (60%) higher than conversion (40%) because cash generation is more immediately critical than funnel efficiency. The ₹50,000 daily revenue target and 5% benchmark conversion are calibrated for a mid-sized e-commerce SMB.

### 2. Inventory Stress (Weight: 25%)
```
InventoryStress = (low_stock_items/20) × 50 + min(stockout_items × 10, 50)
```
**Justification:** Inventory problems are lagging indicators that turn into revenue loss and customer churn. Stockouts (10 points each) penalize harder than low-stock warnings because stockouts are already causing lost sales, while low-stock is still recoverable. Capped at 100 to prevent outlier distortion.

### 3. Support Stress (Weight: 20%)
```
SupportStress = (open_tickets/100) × 30 + (avg_response_time/24) × 40 + ((100 - csat)/100) × 30
```
**Justification:** Customer support quality is a leading indicator of churn. Response time receives the highest sub-weight (40%) as SLA breaches compound rapidly and directly impact CSAT. Queue volume (30%) and satisfaction score (30%) balance the formula. A 24-hour normalization for response time maps to a full business day maximum acceptable delay.

### 4. Cash Flow Stress (Weight: 20%)
```
CashStress = clamp((1 - runway_days/180) × 100, 0, 100)
```
**Justification:** Cash runway below 180 days (≈6 months) triggers increasing stress. This benchmark reflects the typical SMB fundraising/recovery timeline. A runway of 0 days = score of 100 (critical), 180+ days = 0 (no stress). Cash stress is weighted at 20% because it acts as a ceiling — once cash is out, all other metrics become irrelevant — but on a day-to-day basis, sales and inventory have higher operational variance.

---

## Weight Rationale Summary

| Vertical | Weight | Reasoning |
|----------|--------|-----------|
| Sales | **35%** | Primary revenue driver; most volatile daily metric |
| Inventory | **25%** | Direct revenue impact; visible to customers |
| Support | **20%** | Retention lever; lags but predicts churn |
| Cash Flow | **20%** | Existential risk; slower-moving but catastrophic at extremes |

**Total: 100%**

---

## Stress Thresholds

| Score | Status | Recommended Action |
|-------|--------|--------------------|
| 0–25 | 🟢 Healthy | Monitor normally |
| 26–50 | 🔵 Stable | Review weekly |
| 51–70 | 🟡 Caution | Daily review, prepare contingencies |
| 71–85 | 🟠 Stressed | Daily standup, activate escalation protocols |
| 86–100 | 🔴 Critical | **Activate War Room Mode immediately** |
