import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedShellComponent } from '../shared-shell/shared-shell.component';

@Component({
  selector: 'app-qc-page',
  standalone: true,
  imports: [RouterModule, SharedShellComponent],
  template: `
    <app-shared-shell-page
      title="Quality Control"
      subtitle="Track sample inspections and approvals"
      description="Use this module to review intake quality checks, moisture validation, and release decisions for inbound lots."
      icon="fact_check"
    ></app-shared-shell-page>
  `
})
export class QcComponent {}
