import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedShellComponent } from '../shared-shell/shared-shell.component';

@Component({
  selector: 'app-accounts-page',
  standalone: true,
  imports: [RouterModule, SharedShellComponent],
  template: `
    <app-shared-shell-page
      title="Accounts"
      subtitle="Review finance and invoice operations"
      description="Use the accounts area for receivables, payables, invoice review, and financial reconciliation workflows."
      icon="account_balance_wallet"
    ></app-shared-shell-page>
  `
})
export class AccountsComponent {}
