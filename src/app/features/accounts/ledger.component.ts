import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LedgerEntry } from './accounts.models';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.scss']
})
export class LedgerComponent {
  @Input() entries: LedgerEntry[] = [];
}
