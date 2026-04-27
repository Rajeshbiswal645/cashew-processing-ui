import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, switchMap } from 'rxjs/operators';
import { AccountsService } from './accounts.service';
import { InvoiceDetail, PaymentFormValue } from './accounts.models';
import { PaymentFormComponent } from './payment-form.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatSnackBarModule,
    PaymentFormComponent
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent {
  invoice: InvoiceDetail | null = null;
  isLoading = true;
  isSavingPayment = false;
  paymentDrawerOpen = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accountsService: AccountsService,
    private readonly snackBar: MatSnackBar
  ) {
    this.route.paramMap
      .pipe(switchMap((params) => this.accountsService.getInvoiceById(params.get('id') ?? '')))
      .subscribe((invoice) => {
        this.invoice = invoice ?? null;
        this.isLoading = false;

        if (!invoice) {
          this.snackBar.open('Invoice not found.', 'Close', { duration: 2400 });
          void this.router.navigate(['/accounts']);
        }
      });
  }

  openPaymentDrawer(): void {
    this.paymentDrawerOpen = true;
  }

  closePaymentDrawer(): void {
    this.paymentDrawerOpen = false;
  }

  recordPayment(payload: PaymentFormValue): void {
    if (!this.invoice) {
      return;
    }

    this.isSavingPayment = true;
    this.accountsService
      .recordPayment(this.invoice.id, payload)
      .pipe(finalize(() => (this.isSavingPayment = false)))
      .subscribe({
        next: (invoice) => {
          this.invoice = invoice;
          this.closePaymentDrawer();
          this.snackBar.open(`Payment recorded for ${invoice.id}.`, 'Close', { duration: 2400 });
        },
        error: (error: Error) => this.snackBar.open(error.message, 'Close', { duration: 2600 })
      });
  }
}
