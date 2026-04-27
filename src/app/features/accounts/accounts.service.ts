import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';
import {
  InvoiceDetail,
  InvoiceFilterValue,
  InvoiceFormValue,
  InvoiceParty,
  InvoiceRecord,
  LedgerEntry,
  PaymentFormValue,
  SalesOrderOption
} from './accounts.models';

interface InvoiceLineItemApiDto {
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  amount: number;
}

interface InvoicePaymentApiDto {
  id?: number;
  paymentDate: string;
  paymentMode: string;
  amountPaid: number;
  referenceNumber: string;
}

interface InvoicePartyApiDto {
  id: string;
  name: string;
  kind: 'BUYER' | 'VENDOR';
  contactPerson: string;
  location: string;
}

interface LedgerEntryApiDto {
  date: string;
  referenceId: string;
  type: 'INVOICE' | 'PAYMENT';
  partyName: string;
  invoiceType: 'SALES' | 'PURCHASE';
  debit: number;
  credit: number;
  balance: number;
}

interface SalesOrderOptionApiDto {
  id: number;
  buyerName: string;
  totalAmount: number;
}

interface InvoiceApiDto {
  id?: number;
  partyId: number;
  partyName?: string;
  invoiceType: 'SALES' | 'PURCHASE';
  linkedSalesOrderId?: number | null;
  invoiceDate: string;
  lineItems: InvoiceLineItemApiDto[];
  subtotal?: number;
  gstPercent: number;
  gstAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  status?: 'PENDING' | 'PAID' | 'OVERDUE';
  party?: InvoicePartyApiDto;
  payments?: InvoicePaymentApiDto[];
}

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly endpoint = 'invoices';

  constructor(private readonly api: ApiService) {}

  getParties(): Observable<InvoiceParty[]> {
    return this.api.get<InvoicePartyApiDto[]>(`${this.endpoint}/parties`).pipe(
      map((parties) =>
        parties.map((party) => ({
          id: party.id,
          name: party.name,
          kind: party.kind,
          contactPerson: party.contactPerson,
          location: party.location
        }))
      )
    );
  }

  getSalesOrders(): Observable<SalesOrderOption[]> {
    return this.api.get<SalesOrderOptionApiDto[]>(`${this.endpoint}/sales-orders`).pipe(
      map((orders) =>
        orders.map((order) => ({
          id: String(order.id),
          buyerName: order.buyerName,
          totalAmount: Number(order.totalAmount ?? 0)
        }))
      )
    );
  }

  getInvoices(filters?: InvoiceFilterValue): Observable<InvoiceRecord[]> {
    return this.api
      .get<InvoiceApiDto[]>(this.endpoint, {
        search: filters?.search,
        invoiceType: filters?.invoiceType === 'ALL' ? undefined : filters?.invoiceType,
        status: filters?.status === 'ALL' ? undefined : filters?.status,
        startDate: filters?.startDate || undefined,
        endDate: filters?.endDate || undefined
      })
      .pipe(map((invoices) => invoices.map((invoice) => this.toRecord(invoice))));
  }

  getInvoiceById(invoiceId: string): Observable<InvoiceDetail | undefined> {
    return this.api.get<InvoiceApiDto>(`${this.endpoint}/${invoiceId}`).pipe(map((invoice) => this.toDetail(invoice)));
  }

  getLedgerEntries(filters?: InvoiceFilterValue): Observable<LedgerEntry[]> {
    return this.api
      .get<LedgerEntryApiDto[]>(`${this.endpoint}/ledger`, {
        search: filters?.search,
        invoiceType: filters?.invoiceType === 'ALL' ? undefined : filters?.invoiceType,
        status: filters?.status === 'ALL' ? undefined : filters?.status,
        startDate: filters?.startDate || undefined,
        endDate: filters?.endDate || undefined
      })
      .pipe(
        map((entries) =>
          entries.map((entry) => ({
            date: entry.date,
            referenceId: entry.referenceId,
            type: entry.type,
            partyName: entry.partyName,
            invoiceType: entry.invoiceType,
            debit: Number(entry.debit ?? 0),
            credit: Number(entry.credit ?? 0),
            balance: Number(entry.balance ?? 0)
          }))
        )
      );
  }

  createInvoice(payload: InvoiceFormValue): Observable<InvoiceRecord> {
    return this.api.post<InvoiceApiDto>(this.endpoint, this.toInvoicePayload(payload)).pipe(map((invoice) => this.toRecord(invoice)));
  }

  recordPayment(invoiceId: string, payload: PaymentFormValue): Observable<InvoiceDetail> {
    return this.api
      .post<InvoiceApiDto>(`${this.endpoint}/${invoiceId}/payments`, {
        paymentDate: payload.paymentDate,
        paymentMode: payload.paymentMode,
        amountPaid: Number(payload.amountPaid),
        referenceNumber: payload.referenceNumber.trim()
      })
      .pipe(map((invoice) => this.toDetail(invoice)));
  }

  private toInvoicePayload(payload: InvoiceFormValue): InvoiceApiDto {
    return {
      partyId: Number(payload.partyId),
      invoiceType: payload.invoiceType,
      linkedSalesOrderId: payload.linkedSalesOrderId ? Number(payload.linkedSalesOrderId) : null,
      invoiceDate: payload.invoiceDate,
      gstPercent: Number(payload.gstPercent),
      lineItems: payload.lineItems.map((item) => ({
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        pricePerUnit: Number(item.pricePerUnit),
        amount: Number(item.amount)
      }))
    };
  }

  private toRecord(invoice: InvoiceApiDto): InvoiceRecord {
    return {
      id: String(invoice.id ?? ''),
      partyId: String(invoice.partyId),
      partyName: invoice.partyName ?? '',
      invoiceType: invoice.invoiceType,
      linkedSalesOrderId: invoice.linkedSalesOrderId ? String(invoice.linkedSalesOrderId) : null,
      invoiceDate: invoice.invoiceDate,
      lineItems: (invoice.lineItems ?? []).map((item) => ({
        itemName: item.itemName,
        quantity: Number(item.quantity ?? 0),
        pricePerUnit: Number(item.pricePerUnit ?? 0),
        amount: Number(item.amount ?? 0)
      })),
      subtotal: Number(invoice.subtotal ?? 0),
      gstPercent: Number(invoice.gstPercent ?? 0),
      gstAmount: Number(invoice.gstAmount ?? 0),
      totalAmount: Number(invoice.totalAmount ?? 0),
      paidAmount: Number(invoice.paidAmount ?? 0),
      balanceAmount: Number(invoice.balanceAmount ?? 0),
      status: invoice.status ?? 'PENDING'
    };
  }

  private toDetail(invoice: InvoiceApiDto): InvoiceDetail {
    const record = this.toRecord(invoice);
    return {
      ...record,
      party: invoice.party
        ? {
            id: invoice.party.id,
            name: invoice.party.name,
            kind: invoice.party.kind,
            contactPerson: invoice.party.contactPerson,
            location: invoice.party.location
          }
        : {
            id: record.partyId,
            name: record.partyName,
            kind: record.invoiceType === 'SALES' ? 'BUYER' : 'VENDOR',
            contactPerson: '',
            location: ''
          },
      payments: (invoice.payments ?? []).map((payment) => ({
        id: String(payment.id ?? ''),
        invoiceId: record.id,
        paymentDate: payment.paymentDate,
        paymentMode: payment.paymentMode as any,
        amountPaid: Number(payment.amountPaid ?? 0),
        referenceNumber: payment.referenceNumber
      }))
    };
  }
}
