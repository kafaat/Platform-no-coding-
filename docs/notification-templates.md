# Notification Templates — Dynamic Product System V2.0

## 1. Overview

The notification system delivers bilingual (Arabic + English) messages across multiple channels to customers, product managers, and system administrators. All templates use **variable interpolation** with `{{variable}}` syntax, resolved at send time from domain event payloads.

### Design Principles

- **Arabic-first**: Arabic (`ar`) is the primary locale; English (`en`) is secondary.
- **Multi-tenant**: Every template is scoped to `tenant_id`. Tenants may override default templates.
- **Channel-aware**: Each template targets one or more delivery channels with channel-specific formatting constraints.
- **Auditable**: Every sent notification is logged in the `audit_log` table with full payload for compliance and debugging.

### Variable Interpolation

```
{{customer_name}}       → عبدالله محمد الحارثي
{{contract_number}}     → FIN-2026-001482
{{amount_due}}          → 125,000.00
{{currency}}            → YER
```

All monetary values are pre-formatted with thousand separators and two decimal places. Dates follow the tenant's calendar preference (Hijri or Gregorian).

---

## 2. Notification Channels

| Channel | Provider | Priority | Max Length | Use Cases |
|---------|----------|----------|------------|-----------|
| **SMS** | Twilio / Local Gateway (Yemen Mobile, MTN) | Critical | 160 chars | OTP, payment due, overdue alerts, reservation hold |
| **Email** | SendGrid | Standard | Unlimited | Statements, contract documents, welcome kits, escalation letters |
| **Push** | Firebase FCM | Real-time | 256 chars body | Payment received, reservation confirmed, status changes |
| **In-App** | WebSocket | Low | Unlimited | Activity feed, non-critical updates, promotions |

### Channel Selection Matrix

| Event Severity | Primary | Fallback 1 | Fallback 2 |
|----------------|---------|------------|------------|
| Critical (OTP, overdue) | SMS | Email | — |
| High (payment due, disbursement) | SMS + Push | Email | — |
| Medium (confirmation, receipt) | Push | SMS | Email |
| Low (welcome, updates) | Email + In-App | Push | — |

---

## 3. Contract / Loan Notifications

### 3.1 Contract Created

| Field | Value |
|-------|-------|
| **Template Code** | `CONTRACT_CREATED` |
| **Trigger** | `ContractCreated` domain event |
| **Channels** | Email + SMS |
| **Priority** | High |

**Variables**: `customer_name`, `contract_number`, `principal`, `currency`, `term_months`, `product_name`

#### SMS — Arabic

```
{{customer_name}}، تم إنشاء عقدك رقم {{contract_number}} بمبلغ {{principal}} {{currency}} لمدة {{term_months}} شهر. سيتم التواصل معك قريباً.
```

#### SMS — English

```
Dear {{customer_name}}, your contract {{contract_number}} for {{principal}} {{currency}} over {{term_months}} months has been created. We will be in touch soon.
```

#### Email — Arabic

**الموضوع**: تأكيد إنشاء العقد رقم {{contract_number}}

```
السلام عليكم {{customer_name}}،

نفيدكم بأنه تم إنشاء عقدكم المالي بالتفاصيل التالية:

• رقم العقد: {{contract_number}}
• المنتج: {{product_name}}
• المبلغ الأصلي: {{principal}} {{currency}}
• مدة العقد: {{term_months}} شهر

العقد حالياً في حالة "مسودة" وسيتم مراجعته وتفعيله بعد استكمال جميع المتطلبات.

في حالة وجود أي استفسار، يرجى التواصل مع فريق خدمة العملاء.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Contract {{contract_number}} Created Successfully

```
Dear {{customer_name}},

We are pleased to inform you that your financial contract has been created with the following details:

• Contract Number: {{contract_number}}
• Product: {{product_name}}
• Principal Amount: {{principal}} {{currency}}
• Term: {{term_months}} months

Your contract is currently in "Draft" status and will be reviewed and activated once all requirements are fulfilled.

If you have any questions, please contact our customer service team.

Best regards,
{{tenant_name}}
```

---

### 3.2 Contract Activated / Funds Disbursed

| Field | Value |
|-------|-------|
| **Template Code** | `FUNDS_DISBURSED` |
| **Trigger** | `FundsDisbursed` domain event |
| **Channels** | SMS + Email + Push |
| **Priority** | Critical |

**Variables**: `customer_name`, `contract_number`, `amount`, `currency`, `bank_account`, `first_due_date`, `installment_amount`

#### SMS — Arabic

```
{{customer_name}}، تم تحويل {{amount}} {{currency}} لحسابكم {{bank_account}} بموجب العقد {{contract_number}}. أول قسط بتاريخ {{first_due_date}}.
```

#### SMS — English

```
{{customer_name}}, {{amount}} {{currency}} has been disbursed to {{bank_account}} for contract {{contract_number}}. First installment due {{first_due_date}}.
```

#### Email — Arabic

**الموضوع**: تم صرف مبلغ العقد رقم {{contract_number}}

```
السلام عليكم {{customer_name}}،

يسرنا إبلاغكم بأنه تم تفعيل عقدكم وتحويل المبلغ بنجاح:

• رقم العقد: {{contract_number}}
• المبلغ المحول: {{amount}} {{currency}}
• الحساب المستفيد: {{bank_account}}
• تاريخ أول قسط: {{first_due_date}}
• قيمة القسط: {{installment_amount}} {{currency}}

يرجى الالتزام بمواعيد السداد المحددة تجنباً لأي رسوم تأخير.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Funds Disbursed — Contract {{contract_number}}

```
Dear {{customer_name}},

We are pleased to confirm that your contract has been activated and the funds have been disbursed successfully:

• Contract Number: {{contract_number}}
• Amount Disbursed: {{amount}} {{currency}}
• Beneficiary Account: {{bank_account}}
• First Installment Date: {{first_due_date}}
• Installment Amount: {{installment_amount}} {{currency}}

Please ensure timely payments to avoid any late fees.

Best regards,
{{tenant_name}}
```

#### Push — Arabic

```
تم تحويل {{amount}} {{currency}} لحسابكم بموجب العقد {{contract_number}} ✓
```

#### Push — English

```
{{amount}} {{currency}} disbursed to your account for contract {{contract_number}}
```

---

### 3.3 Installment Due Reminder (3 Days Before)

| Field | Value |
|-------|-------|
| **Template Code** | `INSTALLMENT_DUE_REMINDER` |
| **Trigger** | Scheduled job — 3 days before `installment.due_on` |
| **Channels** | SMS + Push |
| **Priority** | High |

**Variables**: `customer_name`, `installment_number`, `amount_due`, `due_date`, `currency`, `contract_number`

#### SMS — Arabic

```
{{customer_name}}، تذكير: القسط رقم {{installment_number}} بمبلغ {{amount_due}} {{currency}} يستحق بتاريخ {{due_date}}. يرجى السداد في الموعد.
```

#### SMS — English

```
{{customer_name}}, reminder: installment #{{installment_number}} of {{amount_due}} {{currency}} is due on {{due_date}}. Please pay on time.
```

#### Push — Arabic

```
تذكير: القسط رقم {{installment_number}} بمبلغ {{amount_due}} {{currency}} يستحق خلال 3 أيام
```

#### Push — English

```
Reminder: Installment #{{installment_number}} of {{amount_due}} {{currency}} is due in 3 days
```

---

### 3.4 Payment Received

| Field | Value |
|-------|-------|
| **Template Code** | `PAYMENT_RECEIVED` |
| **Trigger** | `PaymentReceived` domain event |
| **Channels** | SMS + Push |
| **Priority** | Medium |

**Variables**: `customer_name`, `amount_paid`, `currency`, `remaining_balance`, `next_due_date`, `contract_number`, `payment_date`

#### SMS — Arabic

```
{{customer_name}}، تم استلام دفعتكم بمبلغ {{amount_paid}} {{currency}}. الرصيد المتبقي: {{remaining_balance}} {{currency}}. القسط القادم: {{next_due_date}}.
```

#### SMS — English

```
{{customer_name}}, payment of {{amount_paid}} {{currency}} received. Balance: {{remaining_balance}} {{currency}}. Next due: {{next_due_date}}.
```

#### Push — Arabic

```
تم استلام دفعة {{amount_paid}} {{currency}} بنجاح. الرصيد المتبقي: {{remaining_balance}} {{currency}}
```

#### Push — English

```
Payment of {{amount_paid}} {{currency}} received successfully. Remaining: {{remaining_balance}} {{currency}}
```

---

### 3.5 Late Payment Warning (After Grace Period)

| Field | Value |
|-------|-------|
| **Template Code** | `LATE_PAYMENT_WARNING` |
| **Trigger** | `AgingBucketChanged` event — bucket transitions to `30` |
| **Channels** | SMS + Email |
| **Priority** | Critical |

**Variables**: `customer_name`, `contract_number`, `overdue_amount`, `currency`, `days_overdue`, `penalty_amount`, `total_due`

#### SMS — Arabic

```
{{customer_name}}، عقدكم {{contract_number}} متأخر {{days_overdue}} يوم. المبلغ المستحق: {{total_due}} {{currency}} شاملاً غرامة {{penalty_amount}}. يرجى السداد فوراً.
```

#### SMS — English

```
{{customer_name}}, contract {{contract_number}} is {{days_overdue}} days overdue. Total due: {{total_due}} {{currency}} incl. {{penalty_amount}} penalty. Pay immediately.
```

#### Email — Arabic

**الموضوع**: تنبيه تأخر سداد — العقد رقم {{contract_number}}

```
السلام عليكم {{customer_name}}،

نود إشعاركم بأن هناك مبالغ متأخرة على عقدكم المالي:

• رقم العقد: {{contract_number}}
• المبلغ المتأخر: {{overdue_amount}} {{currency}}
• عدد أيام التأخير: {{days_overdue}} يوم
• غرامة التأخير: {{penalty_amount}} {{currency}}
• إجمالي المبلغ المستحق: {{total_due}} {{currency}}

نرجو منكم المبادرة بسداد المبلغ المستحق في أقرب وقت ممكن لتجنب إجراءات التصعيد وزيادة غرامات التأخير.

للتواصل مع قسم التحصيل، يرجى الاتصال على: {{collection_phone}}

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Overdue Payment Notice — Contract {{contract_number}}

```
Dear {{customer_name}},

This is to notify you that your financial contract has overdue amounts:

• Contract Number: {{contract_number}}
• Overdue Amount: {{overdue_amount}} {{currency}}
• Days Overdue: {{days_overdue}} days
• Late Penalty: {{penalty_amount}} {{currency}}
• Total Amount Due: {{total_due}} {{currency}}

Please arrange for immediate payment to avoid escalation actions and additional late penalties.

To reach our collections department, please call: {{collection_phone}}

Best regards,
{{tenant_name}}
```

---

### 3.6 Escalation Notices (60 / 90 / 180+ Days)

#### 3.6.1 Second Escalation — 60 Days Overdue

| Field | Value |
|-------|-------|
| **Template Code** | `ESCALATION_60_DAYS` |
| **Trigger** | `AgingBucketChanged` event — bucket transitions to `60` |
| **Channels** | SMS + Email |
| **Priority** | Critical |

**Variables**: `customer_name`, `contract_number`, `overdue_amount`, `currency`, `penalty_amount`, `total_due`

##### SMS — Arabic

```
تنبيه عاجل: {{customer_name}}، عقدكم {{contract_number}} متأخر 60 يوماً. المستحق: {{total_due}} {{currency}}. قد يتم تعليق الخدمات. تواصلوا معنا فوراً.
```

##### SMS — English

```
URGENT: {{customer_name}}, contract {{contract_number}} is 60 days overdue. Due: {{total_due}} {{currency}}. Services may be suspended. Contact us now.
```

##### Email — Arabic

**الموضوع**: إشعار تصعيد — تأخر 60 يوماً — العقد {{contract_number}}

```
السلام عليكم {{customer_name}}،

هذا إشعار تصعيد بشأن المبالغ المتأخرة على عقدكم المالي رقم {{contract_number}}.

لقد مضى 60 يوماً على تاريخ الاستحقاق دون سداد المبلغ المطلوب:

• إجمالي المبلغ المستحق: {{total_due}} {{currency}}
• منها غرامات تأخير: {{penalty_amount}} {{currency}}

في حالة عدم السداد خلال 30 يوماً:
— سيتم تعليق جميع الخدمات المرتبطة بالعقد
— قد يتم الإبلاغ لجهات الائتمان المختصة

نحثكم على التواصل معنا لإيجاد حل مناسب لتسوية المبلغ المستحق.

مع أطيب التحيات،
قسم التحصيل — {{tenant_name}}
```

##### Email — English

**Subject**: Escalation Notice — 60 Days Overdue — Contract {{contract_number}}

```
Dear {{customer_name}},

This is an escalation notice regarding the overdue balance on your financial contract {{contract_number}}.

It has been 60 days since the due date without payment:

• Total Amount Due: {{total_due}} {{currency}}
• Including Late Penalties: {{penalty_amount}} {{currency}}

If payment is not received within 30 days:
— All services linked to this contract will be suspended
— The matter may be reported to credit bureaus

We strongly encourage you to contact us to arrange a suitable settlement plan.

Best regards,
Collections Department — {{tenant_name}}
```

#### 3.6.2 Third Escalation — 90 Days Overdue

| Field | Value |
|-------|-------|
| **Template Code** | `ESCALATION_90_DAYS` |
| **Trigger** | `AgingBucketChanged` event — bucket transitions to `90` |
| **Channels** | SMS + Email |
| **Priority** | Critical |

**Variables**: `customer_name`, `contract_number`, `overdue_amount`, `currency`, `penalty_amount`, `total_due`

##### SMS — Arabic

```
{{customer_name}}، عقدكم {{contract_number}} متأخر 90 يوماً. تم تعليق الخدمات. المستحق: {{total_due}} {{currency}}. تواصلوا معنا لتسوية الحساب.
```

##### SMS — English

```
{{customer_name}}, contract {{contract_number}} is 90 days overdue. Services suspended. Due: {{total_due}} {{currency}}. Contact us to settle.
```

##### Email — Arabic

**الموضوع**: إشعار تعليق خدمات — تأخر 90 يوماً — العقد {{contract_number}}

```
السلام عليكم {{customer_name}}،

نأسف لإبلاغكم بأنه تم تعليق جميع الخدمات المرتبطة بعقدكم رقم {{contract_number}} بسبب تأخر السداد لمدة 90 يوماً.

• إجمالي المبلغ المستحق: {{total_due}} {{currency}}
• منها غرامات تأخير: {{penalty_amount}} {{currency}}

الإجراءات المتخذة:
— تعليق جميع الخدمات المرتبطة بالعقد
— تسجيل الملاحظة في السجل الائتماني

في حالة عدم السداد خلال 90 يوماً إضافياً، سيتم شطب العقد وقد يتم تحويل الملف إلى الجهات القانونية.

لا يزال بإمكانكم التواصل معنا لترتيب خطة سداد مناسبة.

مع أطيب التحيات،
قسم التحصيل — {{tenant_name}}
```

##### Email — English

**Subject**: Services Suspended — 90 Days Overdue — Contract {{contract_number}}

```
Dear {{customer_name}},

We regret to inform you that all services linked to your contract {{contract_number}} have been suspended due to non-payment for 90 days.

• Total Amount Due: {{total_due}} {{currency}}
• Including Late Penalties: {{penalty_amount}} {{currency}}

Actions taken:
— All contract-linked services have been suspended
— A note has been recorded on your credit file

If no payment is received within an additional 90 days, the contract will be written off and the case may be referred to legal proceedings.

You may still contact us to arrange a suitable repayment plan.

Best regards,
Collections Department — {{tenant_name}}
```

#### 3.6.3 Write-Off Notice — 180+ Days Overdue

| Field | Value |
|-------|-------|
| **Template Code** | `ESCALATION_WRITE_OFF` |
| **Trigger** | `AgingBucketChanged` event — bucket transitions to `180` |
| **Channels** | Email (formal letter) |
| **Priority** | Critical |

**Variables**: `customer_name`, `contract_number`, `total_due`, `currency`, `write_off_date`

##### Email — Arabic

**الموضوع**: إشعار شطب عقد — العقد {{contract_number}}

```
السلام عليكم {{customer_name}}،

نفيدكم بأنه تم شطب عقدكم المالي رقم {{contract_number}} بتاريخ {{write_off_date}} بسبب عدم السداد لمدة تجاوزت 180 يوماً.

• إجمالي المبلغ المشطوب: {{total_due}} {{currency}}

هذا لا يعني إعفاءكم من المبلغ المستحق. سيتم اتخاذ الإجراءات القانونية اللازمة لتحصيل المبلغ.

للاستفسار أو لترتيب تسوية، يرجى التواصل مع القسم القانوني.

مع أطيب التحيات،
الإدارة القانونية — {{tenant_name}}
```

##### Email — English

**Subject**: Write-Off Notice — Contract {{contract_number}}

```
Dear {{customer_name}},

This is to inform you that your financial contract {{contract_number}} has been written off as of {{write_off_date}} due to non-payment exceeding 180 days.

• Total Written-Off Amount: {{total_due}} {{currency}}

This does not constitute a waiver of the outstanding amount. Legal proceedings will be initiated to recover the balance owed.

For inquiries or to arrange a settlement, please contact our legal department.

Best regards,
Legal Department — {{tenant_name}}
```

---

### 3.7 Early Settlement Confirmation

| Field | Value |
|-------|-------|
| **Template Code** | `EARLY_SETTLEMENT` |
| **Trigger** | `EarlySettlement` domain event |
| **Channels** | Email + SMS |
| **Priority** | High |

**Variables**: `customer_name`, `contract_number`, `settlement_amount`, `currency`, `original_remaining`, `discount_amount`, `settlement_date`

#### SMS — Arabic

```
{{customer_name}}، تمت تسوية عقدكم {{contract_number}} مبكراً بمبلغ {{settlement_amount}} {{currency}}. شكراً لالتزامكم.
```

#### SMS — English

```
{{customer_name}}, contract {{contract_number}} settled early for {{settlement_amount}} {{currency}}. Thank you for your commitment.
```

#### Email — Arabic

**الموضوع**: تأكيد التسوية المبكرة — العقد {{contract_number}}

```
السلام عليكم {{customer_name}}،

يسرنا تأكيد إتمام التسوية المبكرة لعقدكم المالي بنجاح:

• رقم العقد: {{contract_number}}
• المبلغ الأصلي المتبقي: {{original_remaining}} {{currency}}
• خصم التسوية المبكرة: {{discount_amount}} {{currency}}
• مبلغ التسوية النهائي: {{settlement_amount}} {{currency}}
• تاريخ التسوية: {{settlement_date}}

تم إغلاق العقد بنجاح. نشكركم على ثقتكم ونتطلع لخدمتكم مستقبلاً.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Early Settlement Confirmation — Contract {{contract_number}}

```
Dear {{customer_name}},

We are pleased to confirm the successful early settlement of your financial contract:

• Contract Number: {{contract_number}}
• Original Remaining Balance: {{original_remaining}} {{currency}}
• Early Settlement Discount: {{discount_amount}} {{currency}}
• Final Settlement Amount: {{settlement_amount}} {{currency}}
• Settlement Date: {{settlement_date}}

Your contract has been closed successfully. Thank you for your trust, and we look forward to serving you in the future.

Best regards,
{{tenant_name}}
```

---

### 3.8 Contract Closed

| Field | Value |
|-------|-------|
| **Template Code** | `CONTRACT_CLOSED` |
| **Trigger** | `ContractClosed` domain event |
| **Channels** | Email + SMS |
| **Priority** | Medium |

**Variables**: `customer_name`, `contract_number`, `total_paid`, `currency`, `closed_date`, `term_months`, `opened_date`

#### SMS — Arabic

```
{{customer_name}}، تم إغلاق عقدكم {{contract_number}} بتاريخ {{closed_date}}. إجمالي المدفوع: {{total_paid}} {{currency}}. شكراً لكم.
```

#### SMS — English

```
{{customer_name}}, contract {{contract_number}} closed on {{closed_date}}. Total paid: {{total_paid}} {{currency}}. Thank you.
```

#### Email — Arabic

**الموضوع**: إغلاق العقد رقم {{contract_number}} — شهادة إخلاء طرف

```
السلام عليكم {{customer_name}}،

نفيدكم بأنه تم إغلاق عقدكم المالي بعد استكمال جميع المدفوعات:

• رقم العقد: {{contract_number}}
• تاريخ الافتتاح: {{opened_date}}
• تاريخ الإغلاق: {{closed_date}}
• إجمالي المبلغ المسدد: {{total_paid}} {{currency}}

هذا الإشعار بمثابة شهادة إخلاء طرف من الالتزامات المترتبة على العقد المذكور.

نشكركم على ثقتكم ونتمنى لكم التوفيق.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Contract {{contract_number}} Closed — Clearance Certificate

```
Dear {{customer_name}},

We confirm that your financial contract has been closed after all payments have been completed:

• Contract Number: {{contract_number}}
• Opening Date: {{opened_date}}
• Closing Date: {{closed_date}}
• Total Amount Paid: {{total_paid}} {{currency}}

This notice serves as a clearance certificate for all obligations under the above contract.

Thank you for your trust, and we wish you all the best.

Best regards,
{{tenant_name}}
```

---

## 4. Reservation Notifications

### 4.1 Reservation Hold Created

| Field | Value |
|-------|-------|
| **Template Code** | `RESERVATION_HOLD` |
| **Trigger** | `ReservationCreated` domain event (status = `HOLD`) |
| **Channels** | SMS + Push |
| **Priority** | High |

**Variables**: `customer_name`, `reservation_number`, `product_name`, `slot_from`, `slot_to`, `hold_until`, `deposit_amount`, `currency`

#### SMS — Arabic

```
{{customer_name}}، تم حجز {{product_name}} مؤقتاً من {{slot_from}} إلى {{slot_to}}. أكّد حجزك قبل {{hold_until}} بدفع {{deposit_amount}} {{currency}}.
```

#### SMS — English

```
{{customer_name}}, {{product_name}} held from {{slot_from}} to {{slot_to}}. Confirm by {{hold_until}} with {{deposit_amount}} {{currency}} deposit.
```

#### Push — Arabic

```
تم حجز {{product_name}} مؤقتاً. أكّد قبل {{hold_until}} لضمان حجزك
```

#### Push — English

```
{{product_name}} is on hold for you. Confirm by {{hold_until}} to secure your reservation
```

---

### 4.2 Reservation Confirmed

| Field | Value |
|-------|-------|
| **Template Code** | `RESERVATION_CONFIRMED` |
| **Trigger** | `ReservationConfirmed` domain event |
| **Channels** | Email + SMS + Push |
| **Priority** | High |

**Variables**: `customer_name`, `reservation_number`, `product_name`, `slot_from`, `slot_to`, `confirmation_code`, `location`, `currency`, `total_amount`

#### SMS — Arabic

```
{{customer_name}}، تم تأكيد حجزكم لـ{{product_name}} بتاريخ {{slot_from}}. رمز التأكيد: {{confirmation_code}}.
```

#### SMS — English

```
{{customer_name}}, your {{product_name}} reservation on {{slot_from}} is confirmed. Code: {{confirmation_code}}.
```

#### Email — Arabic

**الموضوع**: تأكيد الحجز — {{product_name}} — {{confirmation_code}}

```
السلام عليكم {{customer_name}}،

يسرنا تأكيد حجزكم بالتفاصيل التالية:

• رقم الحجز: {{reservation_number}}
• رمز التأكيد: {{confirmation_code}}
• الخدمة / المنتج: {{product_name}}
• من: {{slot_from}}
• إلى: {{slot_to}}
• الموقع: {{location}}
• المبلغ الإجمالي: {{total_amount}} {{currency}}

يرجى الاحتفاظ برمز التأكيد وإبرازه عند الوصول.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Reservation Confirmed — {{product_name}} — {{confirmation_code}}

```
Dear {{customer_name}},

We are pleased to confirm your reservation with the following details:

• Reservation Number: {{reservation_number}}
• Confirmation Code: {{confirmation_code}}
• Service / Product: {{product_name}}
• From: {{slot_from}}
• To: {{slot_to}}
• Location: {{location}}
• Total Amount: {{total_amount}} {{currency}}

Please keep your confirmation code and present it upon arrival.

Best regards,
{{tenant_name}}
```

#### Push — Arabic

```
تم تأكيد حجزكم لـ{{product_name}}. رمز التأكيد: {{confirmation_code}}
```

#### Push — English

```
Your {{product_name}} reservation is confirmed. Code: {{confirmation_code}}
```

---

### 4.3 Hold Expiry Warning (1 Hour Before)

| Field | Value |
|-------|-------|
| **Template Code** | `HOLD_EXPIRY_WARNING` |
| **Trigger** | Scheduled job — 1 hour before `reservation.hold_until` |
| **Channels** | Push + SMS |
| **Priority** | High |

**Variables**: `customer_name`, `reservation_number`, `product_name`, `hold_until`, `deposit_amount`, `currency`

#### SMS — Arabic

```
{{customer_name}}، حجزكم المؤقت لـ{{product_name}} ينتهي خلال ساعة ({{hold_until}}). أكّدوا الآن بدفع {{deposit_amount}} {{currency}} قبل فوات الأوان.
```

#### SMS — English

```
{{customer_name}}, your hold on {{product_name}} expires in 1 hour ({{hold_until}}). Pay {{deposit_amount}} {{currency}} now to confirm.
```

#### Push — Arabic

```
تنبيه: حجزكم لـ{{product_name}} ينتهي خلال ساعة واحدة. أكّدوا الآن
```

#### Push — English

```
Alert: Your {{product_name}} hold expires in 1 hour. Confirm now to keep it
```

---

### 4.4 Reservation Expired

| Field | Value |
|-------|-------|
| **Template Code** | `RESERVATION_EXPIRED` |
| **Trigger** | `ReservationExpired` domain event |
| **Channels** | SMS |
| **Priority** | Medium |

**Variables**: `customer_name`, `reservation_number`, `product_name`

#### SMS — Arabic

```
{{customer_name}}، نأسف لإبلاغكم بأن حجزكم رقم {{reservation_number}} لـ{{product_name}} قد انتهت صلاحيته لعدم التأكيد في الوقت المحدد.
```

#### SMS — English

```
{{customer_name}}, your reservation {{reservation_number}} for {{product_name}} has expired as it was not confirmed in time.
```

---

### 4.5 Cancellation with Penalty

| Field | Value |
|-------|-------|
| **Template Code** | `RESERVATION_CANCELLED_PENALTY` |
| **Trigger** | `ReservationCancelled` domain event (with penalty) |
| **Channels** | Email + SMS |
| **Priority** | High |

**Variables**: `customer_name`, `reservation_number`, `product_name`, `penalty_amount`, `refund_amount`, `currency`, `original_amount`, `cancellation_date`

#### SMS — Arabic

```
{{customer_name}}، تم إلغاء حجزكم {{reservation_number}}. خصم إلغاء: {{penalty_amount}} {{currency}}. مبلغ الاسترداد: {{refund_amount}} {{currency}}.
```

#### SMS — English

```
{{customer_name}}, reservation {{reservation_number}} cancelled. Penalty: {{penalty_amount}} {{currency}}. Refund: {{refund_amount}} {{currency}}.
```

#### Email — Arabic

**الموضوع**: تأكيد إلغاء الحجز رقم {{reservation_number}}

```
السلام عليكم {{customer_name}}،

نفيدكم بأنه تم إلغاء حجزكم وفقاً لسياسة الإلغاء المعتمدة:

• رقم الحجز: {{reservation_number}}
• الخدمة / المنتج: {{product_name}}
• تاريخ الإلغاء: {{cancellation_date}}
• المبلغ الأصلي: {{original_amount}} {{currency}}
• رسوم الإلغاء: {{penalty_amount}} {{currency}}
• مبلغ الاسترداد: {{refund_amount}} {{currency}}

سيتم تحويل مبلغ الاسترداد إلى حسابكم خلال 5-7 أيام عمل.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Cancellation Confirmation — Reservation {{reservation_number}}

```
Dear {{customer_name}},

Your reservation has been cancelled per the applicable cancellation policy:

• Reservation Number: {{reservation_number}}
• Service / Product: {{product_name}}
• Cancellation Date: {{cancellation_date}}
• Original Amount: {{original_amount}} {{currency}}
• Cancellation Fee: {{penalty_amount}} {{currency}}
• Refund Amount: {{refund_amount}} {{currency}}

The refund will be transferred to your account within 5-7 business days.

Best regards,
{{tenant_name}}
```

---

## 5. System Notifications

### 5.1 Welcome / Account Created

| Field | Value |
|-------|-------|
| **Template Code** | `WELCOME` |
| **Trigger** | `CustomerCreated` domain event |
| **Channels** | Email + SMS |
| **Priority** | Medium |

**Variables**: `customer_name`, `tenant_name`, `support_phone`, `portal_url`

#### SMS — Arabic

```
أهلاً {{customer_name}}، مرحباً بكم في {{tenant_name}}. لبدء الاستخدام، قوموا بزيارة {{portal_url}} أو تواصلوا معنا على {{support_phone}}.
```

#### SMS — English

```
Welcome {{customer_name}}! Thank you for joining {{tenant_name}}. Get started at {{portal_url}} or call {{support_phone}}.
```

#### Email — Arabic

**الموضوع**: مرحباً بكم في {{tenant_name}}

```
السلام عليكم {{customer_name}}،

أهلاً وسهلاً بكم في {{tenant_name}}. يسعدنا انضمامكم إلينا.

للبدء في استخدام خدماتنا:
1. قوموا بزيارة البوابة الإلكترونية: {{portal_url}}
2. أكملوا بيانات حسابكم الشخصي
3. استعرضوا المنتجات والخدمات المتاحة

في حالة احتياجكم لأي مساعدة، فريق الدعم متاح على الرقم {{support_phone}}.

نتمنى لكم تجربة ممتعة.

مع أطيب التحيات،
{{tenant_name}}
```

#### Email — English

**Subject**: Welcome to {{tenant_name}}

```
Dear {{customer_name}},

Welcome to {{tenant_name}}. We are delighted to have you on board.

To get started:
1. Visit our portal: {{portal_url}}
2. Complete your profile information
3. Browse our available products and services

If you need any assistance, our support team is available at {{support_phone}}.

We hope you enjoy your experience.

Best regards,
{{tenant_name}}
```

---

### 5.2 KYC Level Updated

| Field | Value |
|-------|-------|
| **Template Code** | `KYC_UPDATED` |
| **Trigger** | `KycLevelChanged` domain event |
| **Channels** | Push + In-App |
| **Priority** | Low |

**Variables**: `customer_name`, `old_level`, `new_level`, `unlocked_features`

#### Push — Arabic

```
{{customer_name}}، تم ترقية مستوى التحقق إلى "{{new_level}}". يمكنكم الآن الوصول لخدمات إضافية
```

#### Push — English

```
{{customer_name}}, your verification level has been upgraded to "{{new_level}}". New features unlocked
```

#### In-App — Arabic

```
تم تحديث مستوى التحقق (KYC) الخاص بكم من "{{old_level}}" إلى "{{new_level}}".

الخدمات الجديدة المتاحة:
{{unlocked_features}}
```

#### In-App — English

```
Your KYC verification level has been updated from "{{old_level}}" to "{{new_level}}".

Newly available services:
{{unlocked_features}}
```

---

### 5.3 Product Activated (to Product Manager)

| Field | Value |
|-------|-------|
| **Template Code** | `PRODUCT_ACTIVATED` |
| **Trigger** | `ProductStatusChanged` domain event (to `ACTIVE`) |
| **Channels** | Email + In-App |
| **Priority** | Medium |
| **Recipient** | Product Manager (internal) |

**Variables**: `manager_name`, `product_name`, `product_code`, `approved_by`, `activation_date`

#### Email — Arabic

**الموضوع**: تم تفعيل المنتج — {{product_name}}

```
السلام عليكم {{manager_name}}،

نفيدكم بأنه تم تفعيل المنتج التالي بنجاح:

• اسم المنتج: {{product_name}}
• كود المنتج: {{product_code}}
• تمت الموافقة بواسطة: {{approved_by}}
• تاريخ التفعيل: {{activation_date}}

المنتج متاح الآن في جميع القنوات المفعّلة.

مع أطيب التحيات،
النظام
```

#### Email — English

**Subject**: Product Activated — {{product_name}}

```
Dear {{manager_name}},

The following product has been activated successfully:

• Product Name: {{product_name}}
• Product Code: {{product_code}}
• Approved By: {{approved_by}}
• Activation Date: {{activation_date}}

The product is now available across all enabled channels.

Best regards,
System
```

#### In-App — Arabic

```
تم تفعيل المنتج "{{product_name}}" ({{product_code}}) بواسطة {{approved_by}} بتاريخ {{activation_date}}.
```

#### In-App — English

```
Product "{{product_name}}" ({{product_code}}) activated by {{approved_by}} on {{activation_date}}.
```

---

### 5.4 Maker-Checker Approval Required

| Field | Value |
|-------|-------|
| **Template Code** | `APPROVAL_REQUIRED` |
| **Trigger** | `ApprovalRequested` domain event |
| **Channels** | Email + Push + In-App |
| **Priority** | High |
| **Recipient** | Checker / Approver (internal) |

**Variables**: `approver_name`, `maker_name`, `entity_type`, `entity_name`, `entity_id`, `action`, `approval_url`

#### SMS — Arabic

```
{{approver_name}}، يوجد طلب موافقة بانتظاركم: {{action}} {{entity_type}} "{{entity_name}}" بواسطة {{maker_name}}. راجعوا الطلب الآن.
```

#### SMS — English

```
{{approver_name}}, approval needed: {{maker_name}} requests to {{action}} {{entity_type}} "{{entity_name}}". Please review now.
```

#### Email — Arabic

**الموضوع**: مطلوب موافقتكم — {{action}} {{entity_type}} "{{entity_name}}"

```
السلام عليكم {{approver_name}}،

يوجد طلب بانتظار موافقتكم:

• نوع الإجراء: {{action}}
• نوع الكيان: {{entity_type}}
• اسم الكيان: {{entity_name}}
• المعرّف: {{entity_id}}
• مقدم الطلب: {{maker_name}}

للمراجعة والموافقة أو الرفض:
{{approval_url}}

مع أطيب التحيات،
النظام
```

#### Email — English

**Subject**: Approval Required — {{action}} {{entity_type}} "{{entity_name}}"

```
Dear {{approver_name}},

An action is pending your approval:

• Action: {{action}}
• Entity Type: {{entity_type}}
• Entity Name: {{entity_name}}
• ID: {{entity_id}}
• Requested By: {{maker_name}}

To review and approve or reject:
{{approval_url}}

Best regards,
System
```

#### Push — Arabic

```
طلب موافقة جديد: {{action}} {{entity_type}} "{{entity_name}}" — من {{maker_name}}
```

#### Push — English

```
New approval request: {{action}} {{entity_type}} "{{entity_name}}" — by {{maker_name}}
```

---

## 6. Template Configuration

Templates are stored in the database and cached in Redis. Each template is identified by `template_code + channel + locale`.

### Storage Schema

```json
{
  "template_code": "INSTALLMENT_DUE_REMINDER",
  "channel": "SMS",
  "locale": "ar",
  "subject": null,
  "body": "{{customer_name}}، تذكير: القسط رقم {{installment_number}} بمبلغ {{amount_due}} {{currency}} يستحق بتاريخ {{due_date}}. يرجى السداد في الموعد.",
  "variables": [
    "customer_name",
    "installment_number",
    "amount_due",
    "due_date",
    "currency",
    "contract_number"
  ],
  "priority": "HIGH",
  "tenant_id": 1,
  "is_active": true,
  "version": 3,
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-02-01T14:30:00Z"
}
```

### Full Template Record Example (Email)

```json
{
  "template_code": "CONTRACT_CREATED",
  "channel": "EMAIL",
  "locale": "ar",
  "subject": "تأكيد إنشاء العقد رقم {{contract_number}}",
  "body": "السلام عليكم {{customer_name}}،\n\nنفيدكم بأنه تم إنشاء عقدكم المالي بالتفاصيل التالية:\n\n• رقم العقد: {{contract_number}}\n• المنتج: {{product_name}}\n• المبلغ الأصلي: {{principal}} {{currency}}\n• مدة العقد: {{term_months}} شهر\n\nالعقد حالياً في حالة \"مسودة\" وسيتم مراجعته وتفعيله بعد استكمال جميع المتطلبات.\n\nفي حالة وجود أي استفسار، يرجى التواصل مع فريق خدمة العملاء.\n\nمع أطيب التحيات،\n{{tenant_name}}",
  "variables": [
    "customer_name",
    "contract_number",
    "product_name",
    "principal",
    "currency",
    "term_months",
    "tenant_name"
  ],
  "priority": "HIGH",
  "tenant_id": 1,
  "is_active": true,
  "version": 1,
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-01-15T08:00:00Z"
}
```

### Template Versioning

- Every update increments the `version` field.
- The system always uses the latest active version.
- Previous versions are retained in `notification_template_history` for audit purposes.

### Template Override Hierarchy

1. **Tenant-specific template** (highest priority)
2. **Product-type template** (e.g., `FINANCIAL` products get different wording)
3. **System default template** (fallback)

---

## 7. Notification Preferences

Each customer may configure per-channel notification preferences. Preferences are stored as JSONB on the customer record or in a dedicated `notification_preference` table.

### Preference Schema

```json
{
  "customer_id": 48201,
  "tenant_id": 1,
  "preferences": {
    "SMS": {
      "enabled": true,
      "quiet_hours": {
        "start": "22:00",
        "end": "08:00",
        "timezone": "Asia/Aden"
      }
    },
    "EMAIL": {
      "enabled": true,
      "address_override": null
    },
    "PUSH": {
      "enabled": true,
      "device_tokens": [
        "fcm_token_abc123",
        "fcm_token_def456"
      ]
    },
    "IN_APP": {
      "enabled": true
    }
  },
  "language": "ar",
  "do_not_disturb": false,
  "unsubscribed_templates": [],
  "updated_at": "2026-02-01T10:00:00Z"
}
```

### Preference Rules

- **Critical notifications** (OTP, overdue alerts, security) **cannot** be disabled by the customer.
- Customers may opt out of promotional and low-priority notifications only.
- Language preference determines which locale template is used.
- If the preferred channel is disabled, the fallback chain is used.

### Opt-Out Categories

| Category | Can Opt Out | Examples |
|----------|-------------|----------|
| `SECURITY` | No | OTP, password reset, suspicious activity |
| `TRANSACTIONAL` | No | Payment received, contract activated, reservation confirmed |
| `REMINDER` | Yes | Installment due, hold expiry |
| `PROMOTIONAL` | Yes | New products, offers, surveys |
| `INFORMATIONAL` | Yes | KYC updates, system maintenance |

---

## 8. Delivery Rules

### 8.1 Quiet Hours

- **SMS**: No delivery between **10:00 PM and 8:00 AM** (customer's local timezone).
- **Push**: No delivery between **11:00 PM and 7:00 AM** unless priority is `CRITICAL`.
- **Email**: No restrictions.
- **In-App**: No restrictions (stored silently, displayed on next session).

Messages queued during quiet hours are delivered at the start of the next allowed window.

### 8.2 Fallback Chain

When the primary channel fails or is unavailable, the system follows a fallback chain:

```
Push (failed/disabled) → SMS → Email
SMS (failed/disabled)  → Email
Email (failed)         → In-App (with visual alert)
```

Fallback is triggered after the retry policy is exhausted for the primary channel.

### 8.3 Retry Policy

| Attempt | Delay | Notes |
|---------|-------|-------|
| 1st retry | 30 seconds | Immediate retry on transient failure |
| 2nd retry | 2 minutes | Exponential backoff |
| 3rd retry | 10 minutes | Final attempt before fallback |

- Maximum **3 retries** per channel per notification.
- After 3 failures, the system moves to the next channel in the fallback chain.
- Permanent failures (invalid phone number, bounced email) skip retries and trigger fallback immediately.
- Failed deliveries are logged in `audit_log` with error details.

### 8.4 Deduplication

- **Window**: 5 minutes.
- Duplicate detection key: `SHA256(tenant_id + customer_id + template_code + channel + variable_hash)`.
- Within the deduplication window, identical notifications are suppressed.
- The deduplication cache is stored in Redis with TTL = 5 minutes.

### 8.5 Rate Limiting

| Channel | Limit | Window |
|---------|-------|--------|
| SMS | 10 messages | per customer per hour |
| Push | 20 notifications | per customer per hour |
| Email | 50 emails | per customer per day |
| In-App | Unlimited | — |

### 8.6 Priority Escalation

| Priority | Behavior |
|----------|----------|
| `CRITICAL` | Bypasses quiet hours. No rate limiting. Immediate delivery. |
| `HIGH` | Respects quiet hours but placed at front of queue. |
| `MEDIUM` | Standard queue processing. |
| `LOW` | Batched delivery (aggregated every 15 minutes). |

---

## Appendix A: Template Code Reference

| Template Code | Section | Channels | Priority |
|---------------|---------|----------|----------|
| `CONTRACT_CREATED` | 3.1 | Email, SMS | HIGH |
| `FUNDS_DISBURSED` | 3.2 | SMS, Email, Push | CRITICAL |
| `INSTALLMENT_DUE_REMINDER` | 3.3 | SMS, Push | HIGH |
| `PAYMENT_RECEIVED` | 3.4 | SMS, Push | MEDIUM |
| `LATE_PAYMENT_WARNING` | 3.5 | SMS, Email | CRITICAL |
| `ESCALATION_60_DAYS` | 3.6.1 | SMS, Email | CRITICAL |
| `ESCALATION_90_DAYS` | 3.6.2 | SMS, Email | CRITICAL |
| `ESCALATION_WRITE_OFF` | 3.6.3 | Email | CRITICAL |
| `EARLY_SETTLEMENT` | 3.7 | Email, SMS | HIGH |
| `CONTRACT_CLOSED` | 3.8 | Email, SMS | MEDIUM |
| `RESERVATION_HOLD` | 4.1 | SMS, Push | HIGH |
| `RESERVATION_CONFIRMED` | 4.2 | Email, SMS, Push | HIGH |
| `HOLD_EXPIRY_WARNING` | 4.3 | Push, SMS | HIGH |
| `RESERVATION_EXPIRED` | 4.4 | SMS | MEDIUM |
| `RESERVATION_CANCELLED_PENALTY` | 4.5 | Email, SMS | HIGH |
| `WELCOME` | 5.1 | Email, SMS | MEDIUM |
| `KYC_UPDATED` | 5.2 | Push, In-App | LOW |
| `PRODUCT_ACTIVATED` | 5.3 | Email, In-App | MEDIUM |
| `APPROVAL_REQUIRED` | 5.4 | Email, Push, In-App | HIGH |

## Appendix B: Variable Reference

| Variable | Type | Example Value | Used In |
|----------|------|---------------|---------|
| `customer_name` | String | عبدالله محمد الحارثي | All customer-facing |
| `contract_number` | String | FIN-2026-001482 | Contract templates |
| `reservation_number` | String | RSV-2026-007891 | Reservation templates |
| `principal` | Money | 5,000,000.00 | CONTRACT_CREATED |
| `amount_due` | Money | 125,000.00 | INSTALLMENT_DUE_REMINDER |
| `amount_paid` | Money | 125,000.00 | PAYMENT_RECEIVED |
| `remaining_balance` | Money | 3,750,000.00 | PAYMENT_RECEIVED |
| `overdue_amount` | Money | 250,000.00 | LATE_PAYMENT_WARNING |
| `penalty_amount` | Money | 12,500.00 | Escalation, Cancellation |
| `settlement_amount` | Money | 2,800,000.00 | EARLY_SETTLEMENT |
| `deposit_amount` | Money | 50,000.00 | Reservation templates |
| `refund_amount` | Money | 35,000.00 | RESERVATION_CANCELLED_PENALTY |
| `total_paid` | Money | 5,250,000.00 | CONTRACT_CLOSED |
| `total_due` | Money | 262,500.00 | Escalation templates |
| `currency` | Enum | YER, USD, SAR | All monetary templates |
| `term_months` | Integer | 36 | CONTRACT_CREATED |
| `installment_number` | Integer | 7 | INSTALLMENT_DUE_REMINDER |
| `days_overdue` | Integer | 32 | LATE_PAYMENT_WARNING |
| `due_date` | Date | 2026-03-15 | INSTALLMENT_DUE_REMINDER |
| `next_due_date` | Date | 2026-04-15 | PAYMENT_RECEIVED |
| `closed_date` | Date | 2026-02-09 | CONTRACT_CLOSED |
| `slot_from` | DateTime | 2026-03-20 14:00 | Reservation templates |
| `slot_to` | DateTime | 2026-03-20 18:00 | Reservation templates |
| `hold_until` | DateTime | 2026-03-18 23:59 | RESERVATION_HOLD |
| `confirmation_code` | String | CONF-7X2K9M | RESERVATION_CONFIRMED |
| `product_name` | String | قاعة المؤتمرات الكبرى | Reservation, Product |
| `bank_account` | String | ****4821 | FUNDS_DISBURSED |
| `tenant_name` | String | بنك الأمل للتمويل الأصغر | All templates |
| `portal_url` | URL | https://portal.example.com | WELCOME |
| `support_phone` | Phone | +967-1-234567 | WELCOME |
| `collection_phone` | Phone | +967-1-234999 | Escalation templates |
| `approval_url` | URL | https://admin.example.com/approvals/482 | APPROVAL_REQUIRED |
| `maker_name` | String | سارة أحمد | APPROVAL_REQUIRED |
| `approver_name` | String | محمد علي | APPROVAL_REQUIRED |
| `manager_name` | String | خالد العمري | PRODUCT_ACTIVATED |
