import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BatchTraceStep } from './inventory.models';

@Component({
  selector: 'app-batch-trace-drawer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './batch-trace-drawer.component.html',
  styleUrls: ['./batch-trace-drawer.component.scss']
})
export class BatchTraceDrawerComponent {
  @Input() batchId = '';
  @Input() steps: BatchTraceStep[] = [];
  @Input() loading = false;

  @Output() closeDrawer = new EventEmitter<void>();
}
