import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedShellComponent } from '../shared-shell/shared-shell.component';

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [RouterModule, SharedShellComponent],
  template: `
    <app-shared-shell-page
      title="Inventory"
      subtitle="Manage stock visibility across the plant"
      description="Review raw stock, work-in-progress, and finished goods inventory with a clean operational summary."
      icon="warehouse"
    ></app-shared-shell-page>
  `
})
export class InventoryComponent {}
