import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { AccountsService } from './accounts.service';
import { InvoiceFilterValue, InvoiceParty, InvoiceRecord, InvoiceStatus, InvoiceType, LedgerEntry, PaymentFormValue, SalesOrderOption } from './accounts.models';
import { InvoiceFormComponent } from './invoice-form.component';
import { LedgerComponent } from './ledger.component';
import { PaymentFormComponent } from './payment-form.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    InvoiceFormComponent,
    PaymentFormComponent,
    LedgerComponent
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent {
  readonly filtersForm = this.formBuilder.group({
    search: [''],
    invoiceType: ['ALL' as 'ALL' | InvoiceType],
    status: ['ALL' as 'ALL' | InvoiceStatus],
    startDate: [null as Date | null],
    endDate: [null as Date | null]
  });

  viewMode: 'INVOICE' | 'LEDGER' = 'INVOICE';
  invoices: InvoiceRecord[] = [];
  ledgerEntries: LedgerEntry[] = [];
  parties: InvoiceParty[] = [];
  salesOrders: SalesOrderOption[] = [];
  selectedInvoice: InvoiceRecord | null = null;
  isLoading = true;
  isSavingInvoice = false;
  isSavingPayment = false;
  invoiceDrawerOpen = false;
  paymentDrawerOpen = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly accountsService: AccountsService,
    private readonly snackBar: MatSnackBar
  ) {
    this.filtersForm.valueChanges.subscribe(() => this.loadData());
    this.loadReferenceData();
    this.loadData();
  }

  openInvoiceDrawer(): void {
    this.invoiceDrawerOpen = true;
  }

  closeInvoiceDrawer(): void {
    this.invoiceDrawerOpen = false;
  }

  openPaymentDrawer(invoice: InvoiceRecord): void {
    this.selectedInvoice = invoice;
    this.paymentDrawerOpen = true;
  }

  closePaymentDrawer(): void {
    this.selectedInvoice = null;
    this.paymentDrawerOpen = false;
  }

  changeView(mode: 'INVOICE' | 'LEDGER'): void {
    this.viewMode = mode;
  }

  viewInvoice(invoice: InvoiceRecord): void {
    void this.router.navigate(['/accounts', invoice.id]);
  }

  downloadInvoice(invoice: InvoiceRecord): void {
    this.snackBar.open(`PDF download queued for ${invoice.id}.`, 'Close', { duration: 2200 });
  }

  saveInvoice(payload: any): void {
    this.isSavingInvoice = true;
    this.accountsService
      .createInvoice(payload)
      .pipe(finalize(() => (this.isSavingInvoice = false)))
      .subscribe({
        next: (invoice) => {
          this.closeInvoiceDrawer();
          this.snackBar.open(`${invoice.id} created successfully.`, 'Close', { duration: 2400 });
          this.loadData();
        },
        error: (error: Error) => this.snackBar.open(error.message, 'Close', { duration: 2600 })
      });
  }

  recordPayment(payload: PaymentFormValue): void {
    if (!this.selectedInvoice) {
      return;
    }

    this.isSavingPayment = true;
    this.accountsService
      .recordPayment(this.selectedInvoice.id, payload)
      .pipe(finalize(() => (this.isSavingPayment = false)))
      .subscribe({
        next: (invoice) => {
          this.closePaymentDrawer();
          this.snackBar.open(`Payment recorded for ${invoice.id}.`, 'Close', { duration: 2400 });
          this.loadData();
        },
        error: (error: Error) => this.snackBar.open(error.message, 'Close', { duration: 2600 })
      });
  }

  getStatusClass(status: InvoiceStatus): string {
    return status.toLowerCase();
  }

  getStatusLabel(status: InvoiceStatus): string {
    return status === 'PAID' ? 'Paid' : status === 'OVERDUE' ? 'Overdue' : 'Pending';
  }

  getInvoiceTypeLabel(type: InvoiceType): string {
    return type === 'SALES' ? 'Sales Invoice' : 'Purchase Invoice';
  }

  private loadReferenceData(): void {
    this.accountsService.getParties().subscribe((parties) => (this.parties = parties));
    this.accountsService.getSalesOrders().subscribe((orders) => (this.salesOrders = orders));
  }

  private loadData(): void {
    const filters = this.getFilters();
    this.isLoading = true;

    this.accountsService.getInvoices(filters).subscribe((invoices) => {
      this.invoices = invoices;
      this.isLoading = false;
    });

    this.accountsService.getLedgerEntries(filters).subscribe((entries) => {
      this.ledgerEntries = entries;
    });
  }

  private getFilters(): InvoiceFilterValue {
    const raw = this.filtersForm.getRawValue();
    return {
      search: (raw.search ?? '').trim(),
      invoiceType: raw.invoiceType ?? 'ALL',
      status: raw.status ?? 'ALL',
      startDate: raw.startDate ? new Date(raw.startDate).toISOString().slice(0, 10) : null,
      endDate: raw.endDate ? new Date(raw.endDate).toISOString().slice(0, 10) : null
    };
  }
}
