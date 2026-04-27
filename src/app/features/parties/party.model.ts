export type PartyCategory = 'Vendor' | 'Buyer';
export type PartyStatus = 'Active' | 'Inactive' | 'Pending Review';
export type PartyClassification = 'Small' | 'Medium' | 'Enterprise';

export interface PartyContract {
  title: string;
  reference: string;
  status: 'Linked' | 'Draft' | 'Expired';
}

export interface PartyBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface PartyActivity {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
}

export interface Party {
  id: string;
  code: string;
  category: PartyCategory;
  uniqueName: string;
  legalName: string;
  classification: PartyClassification;
  gstin: string;
  email: string;
  phone: string;
  contactPerson: string;
  status: PartyStatus;
  origin: string[];
  rating: number;
  contract: PartyContract;
  bankDetails: PartyBankDetails;
  notes: string;
  createdAt: string;
  updatedAt: string;
  activity: PartyActivity[];
}

export interface PartyApiDto {
  id?: number;
  partyType: string;
  uniqueName: string;
  legalName: string;
  classification: string;
  contactInfo?: string;
  gstin?: string;
  bankDetails?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  status: string;
  email: string;
  phone: string;
  contactPerson: string;
  origin: string[];
  rating: number;
  contractTitle?: string;
  contractReference?: string;
  contractStatus?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartyFilters {
  type?: PartyCategory;
  status?: PartyStatus | 'All';
  search?: string;
}

export type PartyUpsertPayload = Omit<Party, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'activity'> & {
  id?: string;
  code?: string;
  createdAt?: string;
  updatedAt?: string;
  activity?: PartyActivity[];
};
