export type InvoiceType = 'SALES' | 'PURCHASE';
export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI';

export interface InvoiceParty {
  id: string;
  name: string;
  kind: 'BUYER' | 'VENDOR';
  contactPerson: string;
  location: string;
}

export interface InvoiceLineItem {
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  paymentDate: string;
  paymentMode: PaymentMode;
  amountPaid: number;
  referenceNumber: string;
}

export interface InvoiceRecord {
  id: string;
  partyId: string;
  partyName: string;
  invoiceType: InvoiceType;
  linkedSalesOrderId?: string | null;
  invoiceDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
}

export interface InvoiceDetail extends InvoiceRecord {
  party: InvoiceParty;
  payments: PaymentRecord[];
}

export interface InvoiceFormValue {
  invoiceType: InvoiceType;
  partyId: string;
  linkedSalesOrderId?: string | null;
  invoiceDate: string;
  lineItems: InvoiceLineItem[];
  gstPercent: number;
}

export interface PaymentFormValue {
  paymentDate: string;
  paymentMode: PaymentMode;
  amountPaid: number;
  referenceNumber: string;
}

export interface InvoiceFilterValue {
  search: string;
  invoiceType: 'ALL' | InvoiceType;
  status: 'ALL' | InvoiceStatus;
  startDate: string | null;
  endDate: string | null;
}

export interface SalesOrderOption {
  id: string;
  buyerName: string;
  totalAmount: number;
}

export interface LedgerEntry {
  date: string;
  referenceId: string;
  type: 'INVOICE' | 'PAYMENT';
  partyName: string;
  invoiceType: InvoiceType;
  debit: number;
  credit: number;
  balance: number;
}
