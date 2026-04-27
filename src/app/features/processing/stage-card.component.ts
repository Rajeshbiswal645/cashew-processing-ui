import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PipelineStage } from './processing.models';

@Component({
  selector: 'app-stage-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stage-card.component.html',
  styleUrls: ['./stage-card.component.scss']
})
export class StageCardComponent {
  @Input({ required: true }) stage!: PipelineStage;
  @Input() active = false;
  @Input() expanded = false;
  @Output() stageSelect = new EventEmitter<void>();

  get statusLabel(): string {
    return this.stage.status === 'IN_PROGRESS'
      ? 'Running'
      : this.stage.status === 'COMPLETED'
        ? 'Completed'
        : 'Pending';
  }

  get statusClass(): string {
    return this.stage.status.toLowerCase().replace('_', '-');
  }
}
