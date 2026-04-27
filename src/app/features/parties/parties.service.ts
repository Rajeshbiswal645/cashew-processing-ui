import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import { Party, PartyActivity, PartyApiDto, PartyCategory, PartyFilters, PartyUpsertPayload } from './party.model';

@Injectable()
export class PartiesService {
  private readonly endpoint = 'parties';

  constructor(private readonly api: ApiService) {}

  list(filters: PartyFilters = {}): Observable<Party[]> {
    return this.api
      .get<PartyApiDto[]>(this.endpoint, {
        type: filters.type,
        status: filters.status === 'All' ? undefined : filters.status,
        search: filters.search?.trim() || undefined
      })
      .pipe(map((response) => response.map((item) => this.normalizeParty(item))));
  }

  getById(id: string): Observable<Party> {
    return this.api.get<PartyApiDto>(`${this.endpoint}/${id}`).pipe(map((response) => this.normalizeParty(response)));
  }

  create(payload: PartyUpsertPayload): Observable<Party> {
    return this.api
      .post<PartyApiDto>(this.endpoint, this.toApiPayload(payload))
      .pipe(map((response) => this.normalizeParty(response)));
  }

  update(id: string, payload: PartyUpsertPayload): Observable<Party> {
    return this.api
      .put<PartyApiDto>(`${this.endpoint}/${id}`, this.toApiPayload(payload))
      .pipe(map((response) => this.normalizeParty(response)));
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  private toApiPayload(payload: PartyUpsertPayload): PartyApiDto {
    return {
      id: payload.id ? Number(payload.id) : undefined,
      partyType: payload.category,
      uniqueName: payload.uniqueName,
      legalName: payload.legalName || payload.uniqueName,
      classification: payload.classification,
      contactInfo: [payload.contactPerson, payload.phone, payload.email].filter(Boolean).join(' | '),
      gstin: payload.gstin,
      bankDetails: [payload.bankDetails.bankName, payload.bankDetails.accountNumber, payload.bankDetails.ifscCode]
        .filter(Boolean)
        .join(' | '),
      bankName: payload.bankDetails.bankName,
      accountName: payload.bankDetails.accountName,
      accountNumber: payload.bankDetails.accountNumber,
      ifscCode: payload.bankDetails.ifscCode,
      status: payload.status,
      email: payload.email,
      phone: payload.phone,
      contactPerson: payload.contactPerson,
      origin: payload.origin,
      rating: payload.rating ?? 4,
      contractTitle: payload.contract.title,
      contractReference: payload.contract.reference,
      contractStatus: payload.contract.status,
      notes: payload.notes
    };
  }

  private normalizeParty(item: PartyApiDto): Party {
    const category = this.normalizeCategory(item.partyType);
    const uniqueName = item.uniqueName || 'Unnamed Party';
    const createdAt = item.createdAt || new Date().toISOString();
    const updatedAt = item.updatedAt || createdAt;

    return {
      id: String(item.id ?? ''),
      code: this.createCode(category, item.id),
      category,
      uniqueName,
      legalName: item.legalName || uniqueName,
      classification: this.normalizeClassification(item.classification),
      gstin: item.gstin || '',
      email: item.email || '',
      phone: item.phone || '',
      contactPerson: item.contactPerson || '',
      status: this.normalizeStatus(item.status),
      origin: Array.isArray(item.origin) ? item.origin : [],
      rating: Number(item.rating ?? 4),
      contract: {
        title: item.contractTitle || 'Supply Agreement',
        reference: item.contractReference || this.createContractCode(category, item.id),
        status: this.normalizeContractStatus(item.contractStatus)
      },
      bankDetails: {
        bankName: item.bankName || '',
        accountName: item.accountName || '',
        accountNumber: item.accountNumber || '',
        ifscCode: item.ifscCode || ''
      },
      notes: item.notes || '',
      createdAt,
      updatedAt,
      activity: this.buildActivity(category, uniqueName, updatedAt)
    };
  }

  private normalizeCategory(value: string): PartyCategory {
    return `${value}`.toLowerCase().startsWith('b') ? 'Buyer' : 'Vendor';
  }

  private normalizeClassification(value: string): Party['classification'] {
    if (value === 'Medium' || value === 'Enterprise') {
      return value;
    }

    return 'Small';
  }

  private normalizeStatus(value: string): Party['status'] {
    if (value === 'Inactive' || value === 'Pending Review') {
      return value;
    }

    return 'Active';
  }

  private normalizeContractStatus(value?: string): Party['contract']['status'] {
    if (value === 'Draft' || value === 'Expired') {
      return value;
    }

    return 'Linked';
  }

  private createCode(category: PartyCategory, id?: number): string {
    const prefix = category === 'Vendor' ? 'VND' : 'BUY';
    return `${prefix}${String(id ?? 0).padStart(3, '0')}`;
  }

  private createContractCode(category: PartyCategory, id?: number): string {
    const prefix = category === 'Vendor' ? 'CNT' : 'AGR';
    return `${prefix}-${String(id ?? 0).padStart(4, '0')}`;
  }

  private buildActivity(category: PartyCategory, uniqueName: string, updatedAt: string): PartyActivity[] {
    return [
      {
        id: `${category}-${updatedAt}-1`,
        icon: 'sync',
        title: `${uniqueName} profile synced`,
        detail: `${category} master data is now served by the backend API.`,
        time: this.formatActivityTime(updatedAt)
      }
    ];
  }

  private formatActivityTime(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Recently updated' : date.toLocaleString();
  }
}
