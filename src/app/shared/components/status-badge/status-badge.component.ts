import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss']
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get badgeClass(): string {
    return this.status ? this.status.toLowerCase().replace(/\s+/g, '-') : '';
  }
}
