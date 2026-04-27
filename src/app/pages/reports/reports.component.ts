import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedShellComponent } from '../shared-shell/shared-shell.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [RouterModule, SharedShellComponent],
  template: `
    <app-shared-shell-page
      title="Reports"
      subtitle="Access operational and financial reporting"
      description="Generate plant-level reports for procurement, processing throughput, inventory movement, and commercial activity."
      icon="assessment"
    ></app-shared-shell-page>
  `
})
export class ReportsComponent {}
