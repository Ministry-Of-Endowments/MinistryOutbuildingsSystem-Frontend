// Enums matching backend
export const OutbuildingType = {
  Shop: 0,
  Apartment: 1,
} as const;

export type OutbuildingType = typeof OutbuildingType[keyof typeof OutbuildingType];

export const OutbuildingPurpose = {
  QuranOffices: 1,              // مكاتب تحفيظ القرآن
  Nurseries: 2,                 // حضانات
  SewingWorkshops: 3,           // مشاغل خياطة
  EducationalCenters: 4,        // مراكز تعليمية (لغات - كمبيوتر - إلخ)
  SpeechAndSkillsCenters: 5,    // مراكز التخاطب وتنمية المهارات
  ClinicsAndMedicalCenters: 6,  // عيادات ومراكز طبية
  Other: 99,                    // أخرى
} as const;

export type OutbuildingPurpose = typeof OutbuildingPurpose[keyof typeof OutbuildingPurpose];

export const LegalStatus = {
  Litigation: 1,   // نزاع قضائي
  Encroachment: 2, // تعدي
  Stable: 3,       // مستقر
} as const;

export type LegalStatus = typeof LegalStatus[keyof typeof LegalStatus];

// Helper functions for labels
export function getOutbuildingTypeLabel(type: OutbuildingType): string {
  switch (type) {
    case OutbuildingType.Shop:
      return 'محل';
    case OutbuildingType.Apartment:
      return 'شقة';
    default:
      return 'غير محدد';
  }
}

export function getOutbuildingPurposeLabel(purpose: OutbuildingPurpose): string {
  switch (purpose) {
    case OutbuildingPurpose.QuranOffices:
      return 'مكاتب تحفيظ القرآن';
    case OutbuildingPurpose.Nurseries:
      return 'حضانات';
    case OutbuildingPurpose.SewingWorkshops:
      return 'مشاغل خياطة';
    case OutbuildingPurpose.EducationalCenters:
      return 'مراكز تعليمية (لغات - كمبيوتر - إلخ)';
    case OutbuildingPurpose.SpeechAndSkillsCenters:
      return 'مراكز التخاطب وتنمية المهارات';
    case OutbuildingPurpose.ClinicsAndMedicalCenters:
      return 'عيادات ومراكز طبية';
    case OutbuildingPurpose.Other:
      return 'أخرى';
    default:
      return 'غير محدد';
  }
}

export function getLegalStatusLabel(status: LegalStatus): string {
  switch (status) {
    case LegalStatus.Litigation:
      return 'نزاع قضائي';
    case LegalStatus.Encroachment:
      return 'تعدي';
    case LegalStatus.Stable:
      return 'مستقر';
    default:
      return 'غير محدد';
  }
}

export interface Sheikhdom {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
  sheikhdoms: Sheikhdom[];
}

export interface Governorate {
  id: number;
  name: string;
  departments: Department[];
}

export interface Administration {
  id: number;
  name: string;
}

export interface Directorate {
  id: number;
  name: string;
  administrations: Administration[];
}

export interface Mosque {
  id: number;
  name: string;
  address: string;
  street?: string;
  notes: string;
  administrationId: number;
  administrationName: string;
  directorateId: number;
  directorateName: string;
  governorateId: number;
  governorateName?: string;
  departmentId: number;
  departmentName?: string;
  sheikhdomId: number;
  sheikhdomName?: string;
}

export interface Outbuilding {
  id: number;
  description: string;
  address: string;
  street?: string;
  governorateId: number;
  departmentId: number;
  sheikhdomId: number;
  governorateName?: string;
  departmentName?: string;
  sheikhdomName?: string;
  type: OutbuildingType;
  status: boolean;
  startDate?: string;
  endDate?: string;
  acceptanceDate?: string;
  price: number;
  space: number;
  notes: string;
  contractUrl?: string;
  tenantName?: string;
  tenantNationalId?: string;
  purpose: OutbuildingPurpose;
  customPurpose?: string;
  purposeText: string;
  legalStatus?: LegalStatus;
  legalStatusText?: string;
  hasElectricityMeter?: boolean;
  hasWaterMeter?: boolean;
}

export interface OutbuildingWithMosque extends Outbuilding {
  mosqueId?: number;
  mosqueName?: string;
  mosqueAddress?: string;
  administrationId?: number;
  administrationName?: string;
  directorateId?: number;
  directorateName?: string;
}

export interface PurposeOption {
  value: number;
  label: string;
  isCustom?: boolean;
}

// DTOs for creating/updating
export interface CreateOutbuildingDto {
  description: string;
  address: string;
  street?: string;
  governorateId: number;
  departmentId: number;
  sheikhdomId: number;
  type: OutbuildingType;
  price: number;
  space: number;
  notes?: string;
  purpose: OutbuildingPurpose;
  customPurpose?: string;
  legalStatus?: LegalStatus;
  hasElectricityMeter?: boolean;
  hasWaterMeter?: boolean;
}

export interface UpdateOutbuildingDto {
  description: string;
  address: string;
  street?: string;
  governorateId: number;
  departmentId: number;
  sheikhdomId: number;
  type: OutbuildingType;
  status: boolean;
  startDate?: string;
  endDate?: string;
  acceptanceDate?: string;
  price: number;
  space: number;
  notes?: string;
  purpose: OutbuildingPurpose;
  customPurpose?: string;
  legalStatus?: LegalStatus;
  hasElectricityMeter?: boolean;
  hasWaterMeter?: boolean;
}

export interface OutbuildingFilter {
  directorateName?: string;
  administrationName?: string;
  mosqueName?: string;
  governorateName?: string;
  departmentName?: string;
  sheikhdomName?: string;
  status?: boolean;
  purpose?: OutbuildingPurpose;
  legalStatus?: LegalStatus;
}

// Dashboard DTOs
export interface OverviewCardsDto {
  totalOutbuildings: number;
  totalMosques: number;
  vacantOutbuildingsCount: number;
  activeRentTotal: number;
  criticalLegalCasesCount: number;
}

export interface PurposeDistributionItemDto {
  purposeValue: number;
  purposeLabel: string;
  count: number;
}

export interface OccupancyDistributionDto {
  occupiedCount: number;
  vacantCount: number;
}

export interface OverviewChartsDto {
  purposeDistribution: PurposeDistributionItemDto[];
  occupancyDistribution: OccupancyDistributionDto;
}

export interface LegalCriticalRowDto {
  outbuildingId: number;
  outbuildingDescription?: string;
  mosqueName?: string;
  governorateName?: string;
  directorateName?: string;
  administrationName?: string;
  legalStatusText: string;
  notes?: string;
}

export interface ExpiringRentRowDto {
  outbuildingId: number;
  outbuildingDescription?: string;
  mosqueName?: string;
  tenantName?: string;
  rentValue?: number;
  endDate?: string;
  daysLeft: number;
  governorateName?: string;
  directorateName?: string;
  administrationName?: string;
}
