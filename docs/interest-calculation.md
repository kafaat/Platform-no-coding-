# Interest Calculation & Day Count Conventions

## Overview

This document describes the interest calculation methods and day count conventions supported by the Dynamic Product System for financial contracts (FR-131, FR-133).

---

## 1. Interest Types

### 1.1 Flat Interest (FLAT)

Interest is calculated on the **original principal** for the entire term.

**Formula:**
```
Total Interest = Principal × Annual Rate × Term (years)
Monthly Interest = Total Interest / Number of Installments
Monthly Principal = Principal / Number of Installments
Monthly Payment = Monthly Principal + Monthly Interest
```

**Example:** Principal=500,000 YER, Rate=12%, Term=12 months
```
Total Interest = 500,000 × 0.12 × 1 = 60,000
Monthly Interest = 60,000 / 12 = 5,000
Monthly Principal = 500,000 / 12 = 41,666.67
Monthly Payment = 41,666.67 + 5,000 = 46,666.67
Total Repayment = 560,000
```

### 1.2 Reducing Balance Interest (REDUCING)

Interest is calculated on the **remaining principal** each period.

**Formula (Equal Installment — Annuity):**
```
r = Annual Rate / 12 (monthly rate)
n = Number of Installments

EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)

Per installment:
  Interest = Outstanding Balance × r
  Principal = EMI - Interest
  New Balance = Outstanding Balance - Principal
```

**Example:** Principal=500,000 YER, Rate=12%, Term=12 months
```
r = 0.12 / 12 = 0.01
EMI = 500,000 × 0.01 × (1.01)^12 / ((1.01)^12 - 1)
EMI = 500,000 × 0.01 × 1.12682503 / 0.12682503
EMI ≈ 44,424.39

Installment 1: Interest = 500,000 × 0.01 = 5,000 | Principal = 39,424.39
Installment 2: Interest = 460,575.61 × 0.01 = 4,605.76 | Principal = 39,818.63
...
Total Interest ≈ 33,092.68 (less than Flat method)
```

### 1.3 Fixed Amount (FIXED_AMOUNT)

A fixed interest amount per period, defined in the contract.

**Formula:**
```
Monthly Payment = Monthly Principal + Fixed Interest Amount
Monthly Principal = Principal / Number of Installments
```

---

## 2. Day Count Conventions

Day count conventions determine how interest accrues between dates.

### 2.1 30E/360 (European Thirty/Three-Sixty)

**Also known as:** Eurobond basis, 30/360 ISDA

**Rules:**
- Each month is treated as 30 days
- Each year is treated as 360 days
- If day = 31, adjust to 30

**Formula:**
```
Days = (Y2 - Y1) × 360 + (M2 - M1) × 30 + (D2 - D1)

Where:
  D1, D2 = min(actual_day, 30)

Day Count Fraction = Days / 360
Interest = Outstanding × Annual Rate × Day Count Fraction
```

**Best for:** Standard loan products, consumer lending

### 2.2 ACT/365 (Actual/365 Fixed)

**Rules:**
- Actual number of days between dates
- Year is always 365 days (ignoring leap years)

**Formula:**
```
Days = Actual calendar days between dates
Day Count Fraction = Days / 365
Interest = Outstanding × Annual Rate × Day Count Fraction
```

**Best for:** Money market instruments, UK conventions

### 2.3 ACT/360 (Actual/360)

**Rules:**
- Actual number of days between dates
- Year is always 360 days

**Formula:**
```
Days = Actual calendar days between dates
Day Count Fraction = Days / 360
Interest = Outstanding × Annual Rate × Day Count Fraction
```

**Note:** This convention results in slightly higher effective interest because the denominator (360) is less than actual days in a year.

**Best for:** US money market, LIBOR-based products

---

## 3. Compound Interest (FR-133)

When compound interest is enabled, unpaid interest is added to the principal.

**Formula:**
```
A = P × (1 + r/n)^(n×t)

Where:
  A = Final amount
  P = Principal
  r = Annual rate
  n = Compounding frequency per year
  t = Time in years

Compound Interest = A - P
```

**Compounding frequencies:**
- Monthly (n=12)
- Quarterly (n=4)
- Semi-annually (n=2)
- Annually (n=1)

---

## 4. Early Settlement (FR-133)

### 4.1 Methods

| Method | Description |
|---|---|
| **Outstanding Balance** | Remaining principal only (no future interest) |
| **Rule of 78** | Weighted interest rebate favoring lender |
| **Actuarial** | Present value of remaining payments discounted at contract rate |

### 4.2 Outstanding Balance Method (Default)

```
Settlement Amount = Outstanding Principal + Accrued Interest + Early Settlement Fee

Where:
  Outstanding Principal = Sum of remaining principal_due
  Accrued Interest = Interest accrued from last payment to settlement date
  Early Settlement Fee = As defined in product charges (when_event = 'OnEarlySettle')
```

---

## 5. Penalty Calculation (FR-132, BR-05, BR-08)

### 5.1 Late Payment Penalty

```
Penalty = Overdue Amount × Penalty Rate × Days Overdue / 360

Applied after Grace Period expires.
```

### 5.2 Aging Escalation (BR-08)

| Bucket | Days Overdue | Action |
|---|---|---|
| Current | 0-7 (Grace) | No action |
| 30 | 8-30 | Alert notification |
| 60 | 31-60 | Escalation to supervisor |
| 90 | 61-90 | Contract suspension |
| 180 | 91-180 | Restructuring review |
| 180+ | >180 | Write-off consideration |

---

## 6. Comparison Example

**Scenario:** 500,000 YER, 12% annual rate, 12 months

| Method | Monthly Payment | Total Interest | Total Repayment |
|---|---|---|---|
| Flat | 46,666.67 | 60,000.00 | 560,000.00 |
| Reducing (Annuity) | 44,424.39 | 33,092.68 | 533,092.68 |
| Fixed Amount (5,000/mo) | 46,666.67 | 60,000.00 | 560,000.00 |

**Note:** Reducing balance always results in lower total interest paid.
