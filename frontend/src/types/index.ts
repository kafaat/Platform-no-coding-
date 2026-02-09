/**
 * Barrel file re-exporting all types from the Dynamic Product System.
 * ملف تصدير مركزي لجميع انواع نظام المنتجات الديناميكي
 *
 * Usage:
 *   import type { Product, Contract, Reservation } from '@/types';
 *   import { PRODUCT_TYPE_LABELS } from '@/types';
 */

// Common types: pagination, errors, channels, charges, accounting, numbering, audit
export type {
  PaginatedResponse,
  ApiError,
  ApiErrorDetail,
  ApiErrorCode,
  ApiErrorResponse,
  Currency,
  Channel,
  ProductChannelConfig,
  ChargeKind,
  ChargeTimingEvent,
  ChargeBasis,
  ChargeFrequency,
  Charge,
  ProductChargeLink,
  AccountingTemplateEntry,
  AccountingTemplate,
  ProductAccountingMap,
  GapPolicy,
  NumberingScheme,
  NumberingSequence,
  ReserveNumberRequest,
  ReserveNumberResponse,
  AuditAction,
  AuditLog,
  StateTransition,
  DomainEvent,
  Tenant,
} from './common';

// Product types: products, versions, categories, composition, units, identifiers
export type {
  ProductType,
  ProductStatus,
  Product,
  ProductSummary,
  ProductVersion,
  ProductCategory,
  CompositionPolicy,
  ProductComposition,
  UnitOfMeasure,
  UomConversion,
  ProductUnit,
  IdentifierType,
  ProductIdentifier,
  CreateProductRequest,
  UpdateProductRequest,
  ProductCreatedResponse,
  ChangeProductStatusRequest,
  ProductStatusResponse,
  CreateProductVersionRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  VersionFieldChange,
  VersionDiff,
} from './product';

// Contract types: contracts, installments, payments, penalties, subledger, settlement
export type {
  ContractStatus,
  InterestType,
  DayCount,
  InstallmentStatus,
  AgingBucket,
  Contract,
  Installment,
  PaymentEvent,
  PenaltyEvent,
  SubledgerEntry,
  EarlySettlement,
  StatementEntry,
  ContractStatement,
  ScheduleSummary,
  ContractSchedule,
  ContractTerms,
  CreateContractRequest,
  ContractCreatedResponse,
  PaymentAmounts,
  RecordPaymentRequest,
  PaymentResponse,
  EarlySettlementRequest,
  GenerateScheduleRequest,
} from './contract';

// Reservation types: reservations, cancellation policies, availability
export type {
  ReservationStatus,
  Reservation,
  CancellationPolicy,
  CancellationRule,
  CancellationPolicyDetail,
  AvailabilitySlot,
  AvailabilityResponse,
  CancellationPenalty,
  CreateReservationRequest,
  ConfirmReservationRequest,
  ReservationCancelledResponse,
  AvailabilityQuery,
  ReservationListQuery,
} from './reservation';

// Pricing types: price lists, rules, quotes, snapshots
export type {
  PriceList,
  PriceListProduct,
  PriceRule,
  PriceQuoteRequest,
  PriceQuoteResponse,
  SnapshotContextType,
  PricingSnapshot,
  CreatePriceListRequest,
  UpdatePriceListRequest,
} from './pricing';

// Attribute types: definitions, sets, values, snapshots
export type {
  AttributeDatatype,
  AttributeDefinition,
  AttributeSetItem,
  AttributeSet,
  AttributeValue,
  AttributeSnapshot,
  CategoryAttributeSet,
  ProductAttributeSet,
  CreateAttributeDefinitionRequest,
  UpdateAttributeDefinitionRequest,
  AttributeSetItemInput,
  CreateAttributeSetRequest,
  UpdateAttributeSetRequest,
  AttributeValueInput,
  SetProductAttributesRequest,
} from './attribute';

// Customer types: customers and KYC
export type {
  KYCLevel,
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerCreatedResponse,
  CustomerDeactivatedResponse,
} from './customer';

// Eligibility types: rules, document/collateral requirements, product links, schedule templates
// انواع الاهلية: القواعد، متطلبات المستندات/الضمانات، روابط المنتجات، قوالب الجدولة
export type {
  EligibilityRule,
  DocumentRequirement,
  CollateralRequirement,
  ProductEligibilityLink,
  ProductDocumentLink,
  ProductCollateralLink,
  ScheduleTemplate,
} from './eligibility';

// ============================================================
// UI-Specific Types (Navigation)
// انواع خاصة بواجهة المستخدم
// ============================================================

export type ScreenId =
  | 'dashboard'
  | 'categories'
  | 'products'
  | 'product-editor'
  | 'manufacturing'
  | 'traceability'
  | 'pricing'
  | 'numbering'
  | 'contracts'
  | 'customers'
  | 'reservations'
  | 'channels'
  | 'audit'
  | 'reports';

export interface NavItem {
  id: ScreenId;
  label: string;
  icon: string;
  badge?: number;
}

// ============================================================
// Bilingual Label Constants
// ثوابت التسميات ثنائية اللغة
// ============================================================

import type { ProductType, ProductStatus } from './product';
import type { ContractStatus, InstallmentStatus } from './contract';
import type { ReservationStatus } from './reservation';

/** Product type labels (Arabic/English) / تسميات انواع المنتجات */
export const PRODUCT_TYPE_LABELS: Record<ProductType, { ar: string; en: string }> = {
  PHYSICAL: { ar: 'مادي', en: 'Physical' },
  DIGITAL: { ar: 'رقمي', en: 'Digital' },
  SERVICE: { ar: 'خدمة', en: 'Service' },
  RESERVATION: { ar: 'حجز', en: 'Reservation' },
  FINANCIAL: { ar: 'مالي', en: 'Financial' },
};

/** Product status labels with color classes / تسميات حالات المنتج */
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, { ar: string; en: string; color: string }> = {
  DRAFT: { ar: 'مسودة', en: 'Draft', color: 'bg-gray-100 text-gray-700' },
  ACTIVE: { ar: 'نشط', en: 'Active', color: 'bg-green-100 text-green-700' },
  SUSPENDED: { ar: 'معلق', en: 'Suspended', color: 'bg-yellow-100 text-yellow-700' },
  RETIRED: { ar: 'متقاعد', en: 'Retired', color: 'bg-red-100 text-red-700' },
};

/** Contract status labels with color classes / تسميات حالات العقد */
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, { ar: string; en: string; color: string }> = {
  DRAFT: { ar: 'مسودة', en: 'Draft', color: 'bg-gray-100 text-gray-700' },
  ACTIVE: { ar: 'نشط', en: 'Active', color: 'bg-green-100 text-green-700' },
  IN_ARREARS: { ar: 'متأخر', en: 'In Arrears', color: 'bg-orange-100 text-orange-700' },
  RESTRUCTURED: { ar: 'مُعاد هيكلته', en: 'Restructured', color: 'bg-blue-100 text-blue-700' },
  WRITTEN_OFF: { ar: 'مشطوب', en: 'Written Off', color: 'bg-red-100 text-red-700' },
  CLOSED: { ar: 'مغلق', en: 'Closed', color: 'bg-slate-100 text-slate-700' },
};

/** Reservation status labels with color classes / تسميات حالات الحجز */
export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, { ar: string; en: string; color: string }> = {
  HOLD: { ar: 'محجوز مؤقتاً', en: 'Hold', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { ar: 'مؤكد', en: 'Confirmed', color: 'bg-green-100 text-green-700' },
  CANCELLED: { ar: 'ملغى', en: 'Cancelled', color: 'bg-red-100 text-red-700' },
  EXPIRED: { ar: 'منتهي', en: 'Expired', color: 'bg-gray-100 text-gray-700' },
  COMPLETED: { ar: 'مكتمل', en: 'Completed', color: 'bg-blue-100 text-blue-700' },
};

/** Installment status labels with color classes / تسميات حالات القسط */
export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, { ar: string; en: string; color: string }> = {
  DUE: { ar: 'مستحق', en: 'Due', color: 'bg-blue-100 text-blue-700' },
  PAID: { ar: 'مدفوع', en: 'Paid', color: 'bg-green-100 text-green-700' },
  PARTIAL: { ar: 'جزئي', en: 'Partial', color: 'bg-yellow-100 text-yellow-700' },
  LATE: { ar: 'متأخر', en: 'Late', color: 'bg-red-100 text-red-700' },
  WAIVED: { ar: 'معفى', en: 'Waived', color: 'bg-gray-100 text-gray-700' },
};
