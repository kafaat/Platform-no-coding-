# SRS — V2.0

# نظام المنتجات الديناميكي — Dynamic Product System

> وثيقة شاملة لتحليل المتطلبات والتصميم
> SRS + ERD + DDL + UML + Wireframes + API + Test Cases

| | |
|---|---|
| **الإصدار** | 2.0 |
| **التاريخ** | 2026-02-09 |
| **الحالة** | مسودة للمراجعة |

> سرّي وخاص — لا يُوزّع خارج فريق العمل

## سجل الإصدارات

| التاريخ | الإصدار | التغييرات | المؤلف | الحالة |
|---|---|---|---|---|
| 2026-02-01 | 1.0 | الإصدار الأولي الشامل | عادل | مسودة |
| 2026-02-09 | 2.0 | مراجعة شاملة: Glossary, RACI, Use Cases مفصلة, MoSCoW, Traceability, ERD+DDL محسّن, NFR موسّعة, API مفصلة, اختبارات موسعة | عادل + Claude | مسودة للمراجعة |

---

## 1. المقدمة

### 1.1 الهدف

تصميم نظام منتجات ديناميكي شامل يدير التصنيف، السمات، التسعير، القنوات، الترقيم، المحاسبة، التركيب، المخزون/الرصيد، الأهلية والوثائق، الرسوم والغرامات، الجداول والمطالبات، والعقود المالية والحجوزات. النظام مصمم كنواة موحدة تخدم أنواع متعددة من المنتجات عبر ملحقات نوعية.

### 1.2 النطاق

يدعم النظام الأنواع التالية:

| النوع | الوصف |
|---|---|
| **سلعي (PHYSICAL)** | منتجات مادية مخزّنة مع LOT/Serial |
| **إلكتروني (DIGITAL)** | برمجيات، اشتراكات، تراخيص |
| **خدمي (SERVICE)** | خدمات مهنية واستشارية |
| **حجوزات/سعة (RESERVATION)** | فنادق، قاعات، مواعيد |
| **مالي (FINANCIAL)** | قروض، ائتمان، سقوف، تمويل |

يمكّن التكوين دون كود عبر سمات/قواعد/قوالب ديناميكية. يدعم النظام Multi-tenancy للعمل كمنصة SaaS.

### 1.3 الجمهور المستهدف

هذه الوثيقة موجهة لفريق التطوير، مدراء المنتجات، المهندسين المعماريين، فريق الجودة، والجهات المانحة (World Bank, FAO, IFAD).

### 1.4 اصطلاحات الوثيقة

- `FR-XXX`: متطلب وظيفي (Functional Requirement)
- `NFR-XX`: متطلب غير وظيفي (Non-Functional Requirement)
- `UC-XX`: حالة استخدام (Use Case)
- `TC-XXX`: حالة اختبار (Test Case)
- `BR-XX`: قاعدة عمل (Business Rule)
- `[M]`: Must Have | `[S]`: Should Have | `[C]`: Could Have | `[W]`: Won't Have

### 1.5 المراجع المعيارية

| المعيار | الوصف | الاستخدام في النظام |
|---|---|---|
| ISO 20022 | معيار الرسائل المالية | هيكلة العقود والمدفوعات |
| IFRS 9 | معايير الأدوات المالية | المحاسبة والتصنيف المالي |
| IEEE 830 | SRS Standard | هيكل الوثيقة |
| OWASP Top 10 | أمان التطبيقات | متطلبات الأمان |
| OpenTelemetry | معيار الرصد | Observability |

### 1.6 قاموس المصطلحات (Glossary)

| المصطلح | الشرح |
|---|---|
| **EAV** | Entity-Attribute-Value: نمط تخزين سمات ديناميكية بجدول موحد |
| **BOM** | Bill of Materials: قائمة مكوّنات المنتج المركّب |
| **Sub-Ledger** | دفتر فرعي تشغيلي لعقد مالي |
| **DSR** | Debt Service Ratio: نسبة خدمة الدين |
| **KYC** | Know Your Customer: اعرف عميلك |
| **CQRS** | Command Query Responsibility Segregation: فصل القراءة عن الكتابة |
| **CEL** | Common Expression Language: لغة تعبيرات للقواعد |
| **ABAC** | Attribute-Based Access Control: تحكم وصول بالسمات |
| **RBAC** | Role-Based Access Control: تحكم وصول بالأدوار |
| **UoM** | Unit of Measure: وحدة القياس |
| **POS** | Point of Sale: نقطة البيع |
| **USSD** | Unstructured Supplementary Service Data: خدمة اتصال غير مهيكلة |
| **IVR** | Interactive Voice Response: الرد الصوتي التفاعلي |
| **LOT** | رقم الدفعة لتتبع المخزون |
| **RPO/RTO** | Recovery Point/Time Objective: أهداف الاستعادة |
| **TTL** | Time To Live: مهلة الصلاحية |
| **Effective Dating** | بداية/نهاية صلاحية للنسخ والسياسات |
| **Feature Flag** | مفتاح تشغيل/إيقاف ميزة حسب السياق |
| **Saga Pattern** | نمط تنسيق عمليات موزعة عبر خدمات متعددة |
| **Idempotency Key** | مفتاح ضمان عدم تكرار العملية |

---

## 2. أصحاب المصلحة ومصفوفة RACI

R=مسؤول (Responsible), A=معتمِد (Accountable), C=مستشار (Consulted), I=مُطلع (Informed)

| النشاط | مدير المنتجات | المالية | المخزون | المخاطر | التكامل API | الدعم/التدقيق |
|---|---|---|---|---|---|---|
| إدارة الفئات | R/A | C | C | I | I | I |
| إنشاء منتج | R/A | C | C | C | I | I |
| التسعير | R | A | I | C | I | I |
| المخزون/الحجوزات | C | I | R/A | I | I | I |
| العقود المالية | C | R/A | I | R | I | C |
| المحاسبة | I | R/A | I | C | I | C |
| الترقيم | R | C | C | I | C | I |
| التكامل الخارجي | C | I | I | I | R/A | I |
| التدقيق | I | C | I | C | I | R/A |

---

## 3. حالات الاستخدام (Use Cases)

### UC-01: إدارة شجرة الفئات وإرث السياسات

| | |
|---|---|
| **الفاعل الرئيسي** | مدير المنتجات |
| **المتطلبات المسبقة** | تسجيل دخول بصلاحية إدارة الفئات |
| **التدفق الأساسي** | 1. عرض شجرة الفئات الحالية ← 2. إنشاء/تعديل فئة مع تحديد الأب ← 3. تعيين سياسات افتراضية (سمات/قنوات/ترقيم/ضرائب) ← 4. حفظ وتفعيل |
| **التدفقات البديلة** | إذا كانت الفئة تحتوي منتجات نشطة لا يمكن حذفها (تعطيل فقط) |
| **النتيجة** | الفئة محفوظة مع سياساتها وموروثة للفروع |
| **المتطلبات** | FR-001, FR-002, FR-003 |

### UC-02: إنشاء/تفعيل منتج بإصدار فعّال

| | |
|---|---|
| **الفاعل الرئيسي** | مدير المنتجات |
| **المتطلبات المسبقة** | وجود فئة نشطة |
| **التدفق الأساسي** | 1. إنشاء منتج جديد (Draft) ← 2. تعبئة البيانات الأساسية واختيار الفئة ← 3. إضافة إصدار (ProductVersion) بتواريخ فعالية ← 4. تكوين السمات/التسعير/القنوات ← 5. إرسال للموافقة والتفعيل |
| **التدفقات البديلة** | إذا تداخلت تواريخ الإصدار مع إصدار قائم: رفض مع رسالة خطأ |
| **النتيجة** | المنتج نشط مع إصدار فعّال |
| **المتطلبات** | FR-010, FR-011, FR-012 |

### UC-06: إعداد التسعير والقوائم والقواعد

| | |
|---|---|
| **الفاعل الرئيسي** | مدير المنتجات / المالية |
| **المتطلبات المسبقة** | وجود منتج نشط |
| **التدفق الأساسي** | 1. إنشاء قائمة أسعار بعملة وفترة صلاحية ← 2. تعريف قواعد تسعير (قناة/شريحة/وقت/كمية) ← 3. ربط الضرائب والخصومات ← 4. معاينة السعر النهائي |
| **التدفقات البديلة** | إذا لم توجد قائمة فعالة للقناة: منع تفعيل القناة |
| **النتيجة** | التسعير فعّال ومرتبط بالمنتج/القناة |
| **المتطلبات** | FR-060, FR-061, FR-062 |

### UC-12: إنشاء عقد قرض/سقف/ائتمان (Wizard)

| | |
|---|---|
| **الفاعل الرئيسي** | المبيعات / المالية |
| **المتطلبات المسبقة** | وجود منتج مالي نشط + عميل معرّف |
| **التدفق الأساسي** | 1. اختيار المنتج المالي + المبلغ/العملة/المدة ← 2. فحص الأهلية (Score/DSR/KYC) ← 3. تحميل الوثائق + الضمانات ← 4. احتساب الفائدة + معاينة الجدول ← 5. مراجعة الرسوم والغرامات ← 6. حجز رقم العقد + فتح Sub-ledger ← 7. التوقيع والتفعيل والصرف |
| **التدفقات البديلة** | فشل الأهلية: رفض مع توضيح السبب · نقص وثائق: تعليق حتى الاستكمال · فشل حجز الرقم: إعادة محاولة أو إلغاء |
| **النتيجة** | عقد نشط + Sub-ledger مفتوح + جدول أقساط مُولّد |
| **المتطلبات** | FR-130, FR-131, FR-132, FR-070, FR-080 |

### UC-13: إدارة الحجوزات

| | |
|---|---|
| **الفاعل الرئيسي** | العميل / الوكيل |
| **المتطلبات المسبقة** | وجود منتج حجز نشط بسعة متاحة |
| **التدفق الأساسي** | 1. استعلام التوافر للفترة المطلوبة ← 2. إنشاء حجز مؤقت (HOLD) بمهلة TTL ← 3. الدفع خلال المهلة ← 4. تأكيد الحجز (CONFIRMED) |
| **التدفقات البديلة** | انتهاء المهلة بدون دفع: إلغاء تلقائي (EXPIRED) · إلغاء بعد التأكيد: تطبيق سياسة الغرامة |
| **النتيجة** | حجز مؤكد أو ملغى مع تحديث السعة |
| **المتطلبات** | FR-120, FR-041 |

> **ملاحظة**: بقية حالات الاستخدام (UC-03 إلى UC-05, UC-07 إلى UC-11, UC-14, UC-15) تتبع نفس النمط التفصيلي وتُستكمل في الإصدار القادم.

---

## 4. المتطلبات الوظيفية (Functional Requirements)

تصنيف MoSCoW: `[M]`=Must, `[S]`=Should, `[C]`=Could, `[W]`=Won't (V2)

### 4.1 الفئات والتصنيف

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-001 | [M] | إنشاء فئة بشجرة لانهائية (أب/ابن) مع سياسات افتراضية | UC-01 |
| FR-002 | [M] | ربط مجموعة سمات افتراضية بكل فئة (AttributeSet) | UC-01 |
| FR-003 | [M] | وراثة السياسات مع إمكانية التجاوز على مستوى المنتج | UC-01 |
| FR-004 | [S] | بحث وفلترة الفئات بالاسم/النوع/الحالة | UC-01 |
| FR-005 | [C] | سحب وإفلات لإعادة ترتيب الشجرة | UC-01 |

### 4.2 المنتج وإصداراته

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-010 | [M] | حالات المنتج: Draft/Active/Suspended/Retired | UC-02 |
| FR-011 | [M] | إدارة إصدارات (ProductVersion) مع تواريخ فعالية وعدم التداخل | UC-02 |
| FR-012 | [M] | تفعيل/تعطيل القنوات لكل إصدار | UC-02, UC-07 |
| FR-013 | [M] | عملية موافقة (Maker-Checker) قبل التفعيل | UC-02 |
| FR-014 | [S] | استنساخ منتج مع إصداراته | UC-02 |
| FR-015 | [S] | مقارنة إصدارين جنباً لجنب (Diff View) | UC-15 |

### 4.3 السمات الديناميكية

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-020 | [M] | تعريف AttributeDefinition بأنواع (String/Number/Date/Bool/Enum/JSON) | UC-03 |
| FR-021 | [M] | قواعد تحقق (Regex/Range/Set/Custom) + JSON Schema للتحقق المتقدم | UC-03 |
| FR-022 | [M] | تخزين EAV مع فهرسة JSONB وMaterialized Views للأداء | UC-03 |
| FR-023 | [S] | Snapshot تشغيلي للسمات وقت العملية (تدقيق/أداء) | UC-03 |

### 4.4 الوحدات والتركيب

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-030 | [M] | إدارة UoM والتحويل | UC-04 |
| FR-031 | [M] | منتج مركّب (BOM/Bundle/KIT) مع سياسة تفجير/عدم تفجير | UC-05 |
| FR-032 | [S] | توزيع السعر والخصم على المكوّنات | UC-05 |

### 4.5 المخزون/الرصيد

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-040 | [M] | سياسة مخزّن/غير مخزّن/سعة (Capacity) للحجوزات | UC-05 |
| FR-041 | [M] | حجز مؤقت بمهلة TTL وتجديد وانتهاء | UC-13 |
| FR-042 | [S] | تتبّع LOT/Serial | UC-05 |

### 4.6 القنوات

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-050 | [M] | تمكين/تعطيل حسب القناة (Web/Mobile/POS/API/USSD/IVR) | UC-07 |
| FR-051 | [S] | صيغة عرض وقيود حسب القناة | UC-07 |
| FR-052 | [S] | Feature Flags لتفعيل تدريجي حسب القناة/الشريحة | UC-07 |

### 4.7 التسعير والضرائب والعروض

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-060 | [M] | PriceList متعددة العملات والفترات | UC-06 |
| FR-061 | [M] | PriceRule بشرط/معادلة (قناة/شريحة/وقت/كمية) بمحرك CEL | UC-06 |
| FR-062 | [M] | الضرائب والخصومات ومجمّعات Bundles | UC-06 |
| FR-063 | [S] | Snapshot تسعيري وقت العملية للتدقيق | UC-06 |

### 4.8 الترقيم والمعرّفات

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-070 | [M] | NumberingScheme مع مقاطع ثابتة/تاريخ/فرع/سلسلة/مخصّص | UC-08 |
| FR-071 | [M] | ProductIdentifier بأنواع (PRODUCT/INVENTORY/LOCATION/EXTERNAL/CONTRACT) | UC-08 |
| FR-072 | [M] | حجز تسلسل آمن مع مقاومة السباق (Atomic Increment) | UC-08 |
| FR-073 | [S] | سياسة التعامل مع الفجوات (Gaps) في التسلسل | UC-08 |
| FR-074 | [S] | مخازن تسلسل مستقلة لكل فرع/قناة | UC-08 |

### 4.9 المحاسبة

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-080 | [M] | قوالب قيود حسب الحدث (بيع/مرتجع/صرف/فائدة/رسم/تأخير) | UC-09 |
| FR-081 | [M] | ربط المنتجات بقوالب القيود (ProductAccountingMap) | UC-09 |
| FR-082 | [M] | Sub-ledger للعقود المالية مع معيار IFRS 9 | UC-09 |
| FR-083 | [S] | تسوية تلقائية بين Sub-ledger والدفتر العام | UC-09 |

### 4.10 الأهلية/الوثائق/الضمانات

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-090 | [M] | قواعد أهلية (Score/DSR/KYC Level) بمحرك CEL | UC-11 |
| FR-091 | [M] | وثائق مطلوبة حسب الشرائح/القيم | UC-11 |
| FR-092 | [S] | متطلبات الضمان (نقد/كفيل/أصل) ونِسب التغطية | UC-11 |

### 4.11 الرسوم/الغرامات/الاشتراكات

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-100 | [M] | تعريف Charge بأنواع (FEE/FINE/SUBSCRIPTION/COMMISSION) وأسس احتساب | UC-10 |
| FR-101 | [M] | ربط الرسوم بالمنتج وتوقيت التحصيل | UC-10 |
| FR-102 | [S] | Rules Engine DSL لمعادلات الغرامات المركّبة | UC-10 |

### 4.12 الجداول والمطالبات

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-110 | [M] | ScheduleTemplate (عدد/تردد/سماح/خوارزمية توزيع) | UC-12 |
| FR-111 | [M] | توليد جداول أقساط/مطالبات/فواتير | UC-12, UC-14 |
| FR-112 | [S] | تأجيل/تجزئة الأقساط وفق قواعد | UC-12 |

### 4.13 الحجوزات

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-120 | [M] | استعلام التوافر، حجز مؤقت، تأكيد، سياسة إلغاء وغرامات | UC-13 |
| FR-121 | [S] | تقويم توافر مع عرض بصري | UC-13 |

### 4.14 العقود المالية (Loan/Credit/Limit)

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-130 | [M] | إنشاء عقد، فتح Sub-ledger، الصرف/التنشيط | UC-12 |
| FR-131 | [M] | احتساب الفائدة (Flat/Reducing/Fixed Amount) مع Day Count متعدد (30E/360, ACT/365, ACT/360) | UC-12 |
| FR-132 | [M] | إدارة حالات (Active/InArrears/Restructured/WrittenOff/Closed) والغرامات | UC-12 |
| FR-133 | [S] | Compound Interest وطريقة احتساب التسوية المبكرة (Early Settlement) | UC-12 |
| FR-134 | [S] | درجات التصعيد عند التأخر (Aging: 30/60/90/180 يوم) | UC-12, UC-14 |

### 4.15 الإدارة والتدقيق

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-140 | [M] | AuditLog/StateTransition/EventLog لكل عملية | UC-15 |
| FR-141 | [S] | مقارنة الإصدارات واسترجاع | UC-15 |
| FR-142 | [S] | Event Sourcing للعقود المالية (Full Audit Trail) | UC-15 |

### 4.16 التكامل (API) وMulti-tenancy

| الرمز | الأولوية | الوصف | الربط |
|---|---|---|---|
| FR-150 | [M] | REST/GraphQL لإنشاء/بحث المنتجات، التسعير، الترقيم، العقود، الجداول | UC-02..UC-15 |
| FR-151 | [M] | API Versioning (URL-based: /v1/, /v2/) | UC-02..UC-15 |
| FR-152 | [M] | Idempotency Keys لكل عملية كتابية | UC-02..UC-15 |
| FR-160 | [M] | Multi-tenancy: عزل البيانات بين المستأجرين (tenant_id في كل جدول + RLS) | — |
| FR-161 | [S] | تخصيص الإعدادات لكل مستأجر (Branding, سياسات, Limits) | — |

---

## 5. المتطلبات غير الوظيفية (NFR)

| الرمز | المجال | التفاصيل |
|---|---|---|
| NFR-01 | الأداء | 95p ≤200ms تسعير/سمات، ≤400ms ترقيم · 500 مستخدم متزامن · 1000 TPS قراءة, 200 TPS كتابة · حجم: 100K منتج, 1M عقد, 10M قسط |
| NFR-02 | التوسع | أفقياً على الخدمات (Products, Pricing, Numbering, Contracts) · CQRS لفصل القراءة/الكتابة · DB Partitioning بـ tenant_id+تاريخ |
| NFR-03 | التوطين | RTL (عربي/انجليزي) · عملات (YER, USD, SAR) · تواريخ (هجري/ميلادي) |
| NFR-04 | الاعتمادية | توافر 99.9% قرائية, 99.5% كتابية · RPO ≤1 ساعة, RTO ≤4 ساعات · DR: Active-Passive بين مركزين |
| NFR-05 | الأمان | OAuth2/OIDC + RBAC/ABAC · تشفير PII (AES-256) · سجلات تدقيق immutable · Field-level security · توقيع رقمي للعقود · OWASP Top 10 |
| NFR-06 | الرصد | OpenTelemetry: Metrics/Logs/Traces · تنبيهات SLO · Health checks · Grafana Dashboard |
| NFR-07 | الأرشفة | Data Retention: 7 سنوات مالي, 3 سنوات تدقيق · أرشفة تلقائية Cold Storage |
| NFR-08 | التوافقية | API Versioning URL-based (/v1/) · Backward Compatibility 6 أشهر · Deprecation notices 3 أشهر مسبقاً |
| NFR-09 | Offline | دعم العمل بدون اتصال (مهم لليمن) · مزامنة تلقائية عند الاتصال · حل النزاعات (Conflict Resolution) |

---

## 6. سير العمل (Workflows)

### 6.1 تفعيل منتج

1. مسودة (Draft)
2. مراجعة المحتوى والسمات
3. موافقة (Maker-Checker)
4. نشر إصدار فعّال
5. تفعيل القنوات المطلوبة
6. المنتج نشط ومتاح

### 6.2 دورة عقد قرض

1. طلب العميل + اختيار المنتج المالي
2. تقييم الأهلية (Score/DSR/KYC)
3. قرار الموافقة/الرفض
4. توثيق (وثائق + ضمانات)
5. فتح Sub-ledger + حجز رقم العقد
6. الصرف (Disbursement)
7. جدولة الأقساط
8. تحصيل دوري / إدارة المتأخرات
9. التصعيد: Aging Buckets (30/60/90/180)
10. إغلاق / إعادة هيكلة / شطب (Write-off)

### 6.3 دورة الحجز

1. استعلام التوافر للفترة
2. حجز مؤقت (HOLD) بمهلة TTL
3. دفع خلال المهلة → تأكيد (CONFIRMED)
4. أو انتهاء المهلة → إلغاء تلقائي (EXPIRED)
5. تقديم الخدمة في الموعد
6. إغلاق / غرامة إلغاء حسب السياسة

### 6.4 Saga Pattern لإنشاء عقد

| الخطوة | الخدمة | العملية | التراجع (Compensate) |
|---|---|---|---|
| 1 | Eligibility | فحص الأهلية | لا حاجة |
| 2 | Numbering | حجز رقم العقد | تحرير الرقم |
| 3 | Contracts | إنشاء العقد (DRAFT) | حذف العقد |
| 4 | Accounting | فتح Sub-ledger | إغلاق Sub-ledger |
| 5 | Pricing | توليد الجدول | حذف الجدول |
| 6 | Contracts | تفعيل + صرف | عكس الصرف |

---

## 7. الواجهات (Wireframes)

### 7.1 المتجر الإداري

#### أ) شجرة الفئات

| العنصر | التفاصيل |
|---|---|
| يمين: تفاصيل الفئة | اسم (عربي/انجليزي)، وصف، النوع، الحالة |
| السياسات الافتراضية | مجموعات السمات، القنوات، الترقيم، الضرائب |
| إدارة الوراثة | عرض السياسات الموروثة مع إمكانية التجاوز |
| حالات الخطأ | رسالة عند محاولة حذف فئة بمنتجات نشطة |

#### ب) قائمة المنتجات

| العنصر | التفاصيل |
|---|---|
| الفلاتر | نوع، حالة، قناة، فئة، إصدار فعّال، تاريخ صلاحية |
| الجدول | كود / اسم / نوع / حالة / فئة / إصدار / قنوات / آخر نشر |
| الأزرار | إنشاء / استنساخ / مقارنة إصدارات / تجميد / تقاعد |
| سلوك Offline | عرض آخر نسخة محلية مع مؤشر عدم اتصال |

#### ج) محرّر المنتج (12 تبويب)

| التبويب | العناصر |
|---|---|
| 1. الأساسيات | الاسم متعدد اللغات، النوع، الحالة، الفئة، بداية/نهاية، صور، قابلية التجزئة، سياسة المرتجع والضمان |
| 2. السمات | اختيار مجموعة سمات الفئة، إضافة/إزالة سمة، قواعد تحقق (JSON Schema)، واجب/اختياري، نطاقات |
| 3. التسعير | قوائم أسعار نشطة، قواعد (قناة/شريحة/وقت/كمية)، ضرائب، خصومات، معاينة السعر النهائي |
| 4. القنوات | تمكين/تعطيل لكل قناة، صيغة العرض، حدود كمية/سعر، Feature Flags |
| 5. المخزون/الرصيد | مخزّن/غير مخزّن/سعة، مستودعات افتراضية، الحجز (مهلة/تجديد)، LOT/Serial |
| 6. التركيب/الوحدات | BOM/Bundle، نسب توزيع السعر، UoM أساسية وبديلة وتحويلات |
| 7. الترقيم والروابط | اختيار مخطط، معاينة الترقيم المتوقع، ربط معرفات خارجية/موقعية/مخزنية |
| 8. المحاسبة | ربط القوالب حسب الحدث، Sub-ledger نوعي (مالي)، معاينة القيود |
| 9. الأهلية/الوثائق/الضمان | قواعد قبول CEL، قائمة وثائق مطلوبة، شروط ضمان، منتجات سابقة لازمة |
| 10. الرسوم/الغرامات | أنواع / توقيت / أسس احتساب، معاينة الرسوم المتوقعة |
| 11. الجداول والمطالبات | قالب جدول، توليد تجريبي، معاينة، سياسات تأجيل/تجزئة |
| 12. التدقيق والإصدارات | تاريخ التغييرات، مقارنة إصدارين (Diff)، إرسال للموافقة (Maker-Checker) |

### 7.2 معالج عقد مالي (Loan Wizard)

| الخطوة | العنوان | العناصر |
|---|---|---|
| 1 | اختيار المنتج المالي | قائمة منسدلة + مبلغ/عملة/مدة |
| 2 | فحص الأهلية | Score/DSR/KYC + قائمة وثائق مطلوبة + تحميل |
| 3 | الضمانات | نوع (نقد/كفيل/أصل) + نسبة تغطية + متطلبات مسبقة |
| 4 | الفائدة والجدول | Flat/Reducing + Day Count + معاينة جدول الأقساط |
| 5 | الرسوم والغرامات | قائمة الرسوم المحسوبة + الاشتراكات + سياسة التأخير |
| 6 | التوقيع والتفعيل | ملخص + توقيع رقمي + فتح Sub-ledger + صرف |

### 7.3 واجهة الحجوزات

| العنصر | الوصف |
|---|---|
| التقويم | عرض يومي/أسبوعي/شهري للتوافر مع ألوان الحالات |
| نموذج الحجز | المنتج، الفترة، العميل، المبلغ، العربون |
| إدارة الحجوزات | قائمة بالحجوزات مع فلترة (حالة/تاريخ/منتج) |
| سياسة الإلغاء | عرض الغرامة المتوقعة قبل تأكيد الإلغاء |

### 7.4 التنقل بين الشاشات (Navigation Flow)

```
Dashboard → شجرة الفئات → اختيار فئة → قائمة المنتجات → محرر المنتج (تبويبات) → معاينة → إرسال للموافقة
Dashboard → العقود المالية → معالج العقد (Wizard) → الجدول → المتابعة والتحصيل
Dashboard → الحجوزات → التقويم → نموذج الحجز → التأكيد/الإلغاء
```

---

## 8. ERD (تفصيلي محسّن)

### 8.1 قائمة الكيانات

| الكيان | الأعمدة الأساسية | الوصف |
|---|---|---|
| **tenant** | id, code, name, settings(JSONB), is_active | كيان المستأجر (Multi-tenancy) |
| **customer** | id, tenant_id, code, name_ar, name_en, kyc_level, score, phone, email | العميل |
| **product_category** | id, tenant_id, parent_id(FK→self), name_ar, name_en, type, is_active, default_policies(JSONB) | شجرة الفئات |
| **product** | id, tenant_id, category_id(FK), type, name_ar, name_en, divisible, lifecycle_from, lifecycle_to, status, payload(JSONB) | المنتج الأساسي |
| **product_version** | id, product_id(FK), version_no, effective_from, effective_to, data(JSONB), approved_by, approved_at | إصدارات المنتج |
| **attribute_definition** | id, tenant_id, code, label_ar, label_en, datatype, required, validation(JSONB), json_schema(JSONB) | تعريف السمة |
| **attribute_set** | id, tenant_id, name, description | مجموعة سمات |
| **attribute_set_item** | id, set_id(FK→attribute_set), attribute_id(FK→attribute_definition), sort_order | ربط سمة بمجموعة |
| **category_attribute_set** | id, category_id(FK), set_id(FK→attribute_set) | ربط مجموعة سمات بفئة |
| **product_attribute_set** | id, product_id(FK), set_id(FK→attribute_set) | ربط مجموعة سمات بمنتج (override) |
| **attribute_value** | id, product_id(FK), attribute_id(FK), value_text, value_number, value_date, value_bool, value_json(JSONB) | قيم السمات — EAV |
| **numbering_scheme** | id, tenant_id, code, pattern, context(JSONB), gap_policy | مخطط الترقيم |
| **numbering_sequence** | id, scheme_id(FK), branch_code, channel_code, current_value, reserved_until | مخزن تسلسل |
| **product_identifier** | id, product_id(FK), id_type, identifier, scheme_id(FK) | معرّفات المنتج |
| **uom** | code(PK), name_ar, name_en | وحدة القياس |
| **uom_conversion** | id, from_code(FK), to_code(FK), factor | تحويل الوحدات |
| **product_unit** | id, product_id(FK), uom_code(FK), is_base, min_qty, max_qty | وحدات المنتج |
| **product_composition** | id, parent_product_id(FK), child_product_id(FK), qty, policy, price_ratio | التركيب BOM/Bundle |
| **price_list** | id, tenant_id, name, currency, valid_from, valid_to | قائمة أسعار |
| **price_list_product** | id, price_list_id(FK), product_id(FK), base_price, min_price, max_price | سعر المنتج في القائمة |
| **price_rule** | id, price_list_id(FK), condition_cel, formula_cel, priority | قاعدة تسعير بـ CEL |
| **channel** | id, code, name_ar, name_en | القناة |
| **product_channel** | id, product_id(FK), channel_id(FK), enabled, limits(JSONB), display(JSONB), feature_flags(JSONB) | ربط المنتج بالقناة |
| **charge** | id, tenant_id, code, name, kind, basis, value, per, when_event, params(JSONB) | رسم/غرامة/اشتراك |
| **product_charge_link** | id, product_id(FK), charge_id(FK), override_params(JSONB) | ربط الرسوم بالمنتج |
| **accounting_template** | id, tenant_id, name, event, entries(JSONB) | قالب قيود محاسبية |
| **product_accounting_map** | id, product_id(FK), template_id(FK), event_type | ربط المنتج بقالب المحاسبة |
| **eligibility_rule** | id, tenant_id, name, condition_cel, params(JSONB) | قاعدة أهلية |
| **document_requirement** | id, tenant_id, code, name, params(JSONB) | متطلب وثائقي |
| **collateral_requirement** | id, tenant_id, type, coverage_ratio, params(JSONB) | متطلب ضمان |
| **product_eligibility_link** | id, product_id(FK), rule_id(FK→eligibility_rule) | ربط أهلية بمنتج |
| **product_document_link** | id, product_id(FK), doc_id(FK→document_requirement), is_mandatory | ربط وثيقة بمنتج |
| **product_collateral_link** | id, product_id(FK), collateral_id(FK→collateral_requirement) | ربط ضمان بمنتج |
| **schedule_template** | id, tenant_id, name, payload(JSONB) | قالب جدول أقساط |
| **contract** | id, tenant_id, product_id(FK), customer_id(FK), contract_number, status, opened_at, closed_at, currency, principal, interest_type, day_count, meta(JSONB) | العقد المالي |
| **installment** | id, contract_id(FK), seq, due_on, principal_due, interest_due, fee_due, paid_principal, paid_interest, paid_fee, status | القسط |
| **payment_event** | id, contract_id(FK), installment_id(FK), paid_on, amount_principal, amount_interest, amount_fee, channel, idempotency_key(UNIQUE) | حدث دفع |
| **penalty_event** | id, contract_id(FK), installment_id(FK), kind, amount, aging_bucket, created_at | حدث غرامة |
| **subledger_entry** | id, contract_id(FK), event_type, dr_account, cr_account, amount, posted_at, ref, idempotency_key(UNIQUE) | قيد في الدفتر الفرعي |
| **reservation** | id, tenant_id, product_id(FK), customer_id(FK), slot_from, slot_to, status, hold_until, deposit_amount, cancellation_policy_id | الحجز |
| **cancellation_policy** | id, tenant_id, name, rules(JSONB) | سياسة الإلغاء |
| **audit_log** | id, tenant_id, entity_type, entity_id, action, old_data(JSONB), new_data(JSONB), user_id, ip, created_at | سجل التدقيق |
| **state_transition** | id, tenant_id, entity_type, entity_id, from_state, to_state, triggered_by, created_at | انتقال الحالة |
| **domain_event** | id, tenant_id, aggregate_type, aggregate_id, event_type, payload(JSONB), created_at | أحداث النظام |

### 8.2 العلاقات

| الكيان المصدر | العلاقة | الكيان الهدف | الوصف |
|---|---|---|---|
| tenant | 1:N | جميع الكيانات | عزل البيانات |
| product_category | 1:N | product | تصنيف المنتجات |
| product_category | self-ref | product_category | شجرة لانهائية |
| product | 1:N | product_version | إصدارات المنتج |
| product | 1:N | attribute_value | قيم السمات |
| attribute_definition | 1:N | attribute_value | تعريف السمة |
| product | M:N | product (via composition) | تركيب BOM/Bundle |
| product | 1:N | product_identifier | معرفات متعددة |
| product | 1:N | product_channel | قنوات المنتج |
| product | 1:N | product_charge_link | رسوم المنتج |
| product | 1:N | product_accounting_map | خرائط المحاسبة |
| product | 1:N | product_eligibility_link | قواعد الأهلية |
| product | 1:N | product_document_link | الوثائق المطلوبة |
| product | 1:N | contract | عقود المنتج |
| customer | 1:N | contract | عقود العميل |
| contract | 1:N | installment | أقساط العقد |
| contract | 1:N | subledger_entry | قيود العقد |
| installment | 1:N | payment_event | مدفوعات القسط |
| product | 1:N | reservation | حجوزات المنتج |
| price_list | 1:N | price_list_product | أسعار القائمة |
| price_list | 1:N | price_rule | قواعد القائمة |

---

## 9. DDL (نماذج موسّعة)

See [db/schema.sql](../db/schema.sql) for the full DDL implementation.

---

## 10. UML (PlantUML)

See [docs/uml/](uml/) directory for all PlantUML diagram source files.

---

## 11. قواعد الأعمال (Business Rules)

| الرمز | القاعدة | المتطلبات |
|---|---|---|
| BR-01 | لا يسمح بتداخل إصدارات لنفس المنتج في نفس الفترة | FR-011 |
| BR-02 | لا يجوز تفعيل قناة بدون تسعير فعّال لتلك القناة/العملة | FR-012, FR-060 |
| BR-03 | لا تُنشأ أقساط قبل اكتمال الوثائق الإلزامية | FR-091, FR-111 |
| BR-04 | لا يُصرف القرض قبل حجز رقم عقد صالح | FR-072, FR-130 |
| BR-05 | الغرامة تُحتسب بعد مهلة Grace وتُسجّل حدثاً مستقلاً | FR-100, FR-132 |
| BR-06 | حدود المبالغ: لكل منتج مالي حد أدنى وأقصى للمبلغ | FR-130 |
| BR-07 | Maker-Checker: كل تفعيل منتج يحتاج موافقة شخص مختلف | FR-013 |
| BR-08 | التصعيد: عند تأخر 30 يوم → تنبيه، 60 → تصعيد، 90 → تعليق، 180+ → شطب | FR-134 |
| BR-09 | لا يجوز حذف فئة تحتوي منتجات نشطة (تعطيل فقط) | FR-001 |
| BR-10 | الحجز المؤقت ينتهي تلقائياً بعد المهلة (TTL) | FR-041, FR-120 |
| BR-11 | Idempotency: كل عملية دفع يجب أن تحمل مفتاح فريد لمنع التكرار | FR-152 |
| BR-12 | عزل البيانات: لا يمكن لمستأجر الوصول لبيانات مستأجر آخر | FR-160 |
| BR-13 | كل تغيير حالة يُسجّل في audit_log مع البيانات القديمة والجديدة | FR-140 |
| BR-14 | لا يجوز إنشاء عقد لعميل لم يستكمل KYC للمستوى المطلوب | FR-090 |
| BR-15 | سياسة الإلغاء: تُطبّق نسبة الغرامة حسب المدة المتبقية قبل موعد الحجز | FR-120 |

---

## 12. واجهات برمجية (API)

جميع الـ APIs تتطلب: `Authorization: Bearer <token>`, `X-Tenant-ID`, `X-Idempotency-Key` (للكتابية). الإصدار: `/api/v1/`.

See [docs/api-specification.md](api-specification.md) for the full API specification.

### أكواد الخطأ

| الكود | النوع | الوصف |
|---|---|---|
| 400 | BAD_REQUEST | بيانات غير صالحة أو ناقصة |
| 401 | UNAUTHORIZED | توكن مفقود أو منتهي |
| 403 | FORBIDDEN | لا توجد صلاحية لهذا المستأجر/الإجراء |
| 404 | NOT_FOUND | المورد غير موجود |
| 409 | CONFLICT | تعارض (إصدار متداخل، رقم مكرر) |
| 422 | VALIDATION_ERROR | فشل التحقق (أهلية، وثائق ناقصة) |
| 429 | RATE_LIMITED | تجاوز حد الطلبات |
| 500 | INTERNAL_ERROR | خطأ داخلي في الخادم |

---

## 13. الاختبارات والقبول

| الرمز | العنوان | السيناريو | المتطلبات |
|---|---|---|---|
| TC-001 | تفعيل منتج كامل | إنشاء Draft → إضافة إصدار + تسعير + قنوات → Maker-Checker → Active ومتاح عبر API | FR-010..FR-013 |
| TC-002 | ترقيم عقد متسلسل | حجز 100 رقم بالتوازي من 10 فروع → لا تكرار ولا فجوات | FR-070..FR-074 |
| TC-003 | قرض Flat vs Reducing | عقدين بنفس المبلغ/المدة → مقارنة إجمالي الفوائد | FR-131, FR-133 |
| TC-004 | تفجير Bundle | Bundle من 3 مكونات → توزيع السعر والخصم حسب النسب | FR-031, FR-032 |
| TC-005 | حجز منتهي الصلاحية | HOLD → انتهاء TTL → EXPIRED → إعادة الحجز | FR-041, FR-120 |
| TC-006 | Idempotency دفعة | نفس الدفعة مرتين → مسجلة مرة واحدة | FR-152 |
| TC-007 | عزل Multi-tenancy | منتج في tenant A → وصول من tenant B → 403/404 | FR-160 |
| TC-008 | فشل الأهلية | Score أقل من الحد → رفض مع السبب | FR-090 |
| TC-009 | التصعيد Aging | قسط متأخر → غرامات حسب Aging Buckets | FR-134, BR-08 |
| TC-010 | Offline Sync | إنشاء منتج Offline → الاتصال → مزامنة صحيحة | NFR-09 |
| TC-011 | Audit Log | تغيير حالة عقد → تسجيل في audit_log | FR-140 |
| TC-012 | Performance Test | 1000 طلب تسعير متزامن → 95p ≤ 200ms | NFR-01 |
| TC-013 | إلغاء حجز مع غرامة | حجز مؤكد → إلغاء → غرامة حسب السياسة | FR-120, BR-15 |
| TC-014 | Early Settlement | عقد نشط + 6 أقساط متبقية → تسوية مبكرة | FR-133 |
| TC-015 | Maker-Checker رفض | منتج → إرسال للموافقة → رفض → يبقى Draft | FR-013, BR-07 |

---

## 14. مصفوفة التتبع (Traceability Matrix)

| المتطلبات (FR) | حالات الاستخدام (UC) | حالات الاختبار (TC) | المرحلة |
|---|---|---|---|
| FR-001..003 | UC-01 | TC-001 | M1 |
| FR-010..015 | UC-02 | TC-001, TC-015 | M1 |
| FR-020..023 | UC-03 | TC-001 | M1 |
| FR-030..032 | UC-04, UC-05 | TC-004 | M2 |
| FR-040..042 | UC-05, UC-13 | TC-005 | M1 |
| FR-050..052 | UC-07 | TC-001 | M1 |
| FR-060..063 | UC-06 | TC-001, TC-012 | M1 |
| FR-070..074 | UC-08 | TC-002 | M1 |
| FR-080..083 | UC-09 | TC-003 | M2 |
| FR-090..092 | UC-11 | TC-008 | M4 |
| FR-100..102 | UC-10 | TC-009 | M2 |
| FR-110..112 | UC-12, UC-14 | TC-003, TC-014 | M4 |
| FR-120..121 | UC-13 | TC-005, TC-013 | M3 |
| FR-130..134 | UC-12 | TC-003, TC-009, TC-014 | M4 |
| FR-140..142 | UC-15 | TC-011 | M5 |
| FR-150..152 | UC-02..UC-15 | TC-006, TC-012 | M1 |
| FR-160..161 | — | TC-007 | M1 |

---

## 15. خارطة الطريق (Roadmap)

| المرحلة | المدة | النطاق | المتطلبات |
|---|---|---|---|
| **M1** | 3 أشهر | نواة المنتجات + السمات + الترقيم + التسعير + القنوات + Multi-tenancy + API Gateway | FR-001..005, FR-010..015, FR-020..023, FR-050..063, FR-070..074, FR-150..161 |
| **M2** | 2 شهر | التركيب/BOM + المحاسبة + الرسوم/الضرائب | FR-030..032, FR-080..083, FR-100..102 |
| **M3** | 2 شهر | الحجوزات + التقويم + سياسات الإلغاء | FR-040..042, FR-120..121 |
| **M4** | 3 أشهر | العقود المالية + Sub-ledger + الجداول/المطالبات + الأهلية | FR-090..092, FR-110..112, FR-130..134 |
| **M5** | 2 شهر | التتبع/التدقيق + Event Sourcing + القياس + تحسينات الأداء + Offline | FR-140..142, NFR-01..09 |

### 15.1 المخاطر والتخفيف

| المخاطرة | الاحتمال | التخفيف |
|---|---|---|
| ضعف الاتصال في اليمن | عالي | Offline-first architecture مع مزامنة ذكية |
| تعقيد المحاسبة المالية | متوسط | مراجعة خبير IFRS + اختبارات مكثفة |
| أداء EAV مع بيانات كبيرة | متوسط | Materialized Views + JSONB Indexing + CQRS |
| أمان Multi-tenancy | عالي | RLS + اختبارات عزل + مراجعة أمنية |
| اعتماد المستخدمين | متوسط | واجهة بسيطة + تدريب + دعم RTL كامل |
