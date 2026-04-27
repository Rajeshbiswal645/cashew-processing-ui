import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PipelineJob } from './processing.models';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.scss']
})
export class JobCardComponent {
  @Input({ required: true }) job!: PipelineJob;
  @Input() disabled = false;
  @Input() selected = false;
  @Output() jobSelect = new EventEmitter<void>();

  get statusLabel(): string {
    return this.job.status === 'IN_PROGRESS'
      ? 'Running'
      : this.job.status === 'COMPLETED'
        ? 'Completed'
        : 'Pending';
  }
}
