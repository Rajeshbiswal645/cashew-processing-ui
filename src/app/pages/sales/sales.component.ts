import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedShellComponent } from '../shared-shell/shared-shell.component';

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [RouterModule, SharedShellComponent],
  template: `
    <app-shared-shell-page
      title="Sales"
      subtitle="Track customer orders and fulfilment"
      description="Manage order intake, dispatch planning, and downstream sales operations from the ERP shell."
      icon="local_mall"
    ></app-shared-shell-page>
  `
})
export class SalesComponent {}
