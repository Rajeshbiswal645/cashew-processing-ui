import { Component } from '@angular/core';
import { ProcessingPipelineComponent } from '../../features/processing/processing-pipeline.component';

@Component({
  selector: 'app-processing-page',
  standalone: true,
  imports: [ProcessingPipelineComponent],
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent {}
