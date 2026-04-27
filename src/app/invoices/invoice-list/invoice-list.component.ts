import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceFormComponent } from '../invoice-form/invoice-form.component';

export interface Invoice {
  invoice_id: string;
  invoice_no: string;
  customer: string;
  invoice_date: string;
  total_amount: number;
  status: string;
}

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent {

  searchText = '';
  filterStatus = '';

  displayedColumns = [
    'invoice_no',
    'customer',
    'invoice_date',
    'amount',
    'status',
    'actions'
  ];

  invoiceList: Invoice[] = [
    { invoice_id: 'INV001', invoice_no: '1001', customer: 'ABC Traders', invoice_date: '2025-01-10', total_amount: 12000, status: 'PAID' },
    { invoice_id: 'INV002', invoice_no: '1002', customer: 'Green Mart', invoice_date: '2025-01-12', total_amount: 8500, status: 'PENDING' },
    { invoice_id: 'INV003', invoice_no: '1003', customer: 'Sunrise Store', invoice_date: '2025-01-13', total_amount: 6500, status: 'OVERDUE' }
  ];

  constructor(private dialog: MatDialog) {}

  // Filter logic
  get filteredInvoices() {
    return this.invoiceList.filter(inv =>
      (inv.invoice_no.toLowerCase().includes(this.searchText.toLowerCase()) ||
        inv.customer.toLowerCase().includes(this.searchText.toLowerCase()))
      && (this.filterStatus === '' || inv.status === this.filterStatus)
    );
  }

  openCreate() {
    const dialogRef = this.dialog.open(InvoiceFormComponent, {
      width: '650px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.invoiceList.push(result);
    });
  }

  openEdit(invoice: Invoice) {
    const dialogRef = this.dialog.open(InvoiceFormComponent, {
      width: '650px',
      data: invoice
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const i = this.invoiceList.findIndex(x => x.invoice_id === invoice.invoice_id);
        this.invoiceList[i] = result;
      }
    });
  }

  deleteInvoice(invoice: Invoice) {
    this.invoiceList = this.invoiceList.filter(i => i.invoice_id !== invoice.invoice_id);
  }
}
