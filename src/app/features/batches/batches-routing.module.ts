import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BatchesComponent } from './batches.component';
import { BoilingComponent } from './boiling/boiling.component';
import { CuttingComponent } from './cutting/cutting.component';
import { KernelComponent } from './kernel/kernel.component';
import { PeelingComponent } from './peeling/peeling.component';
import { SortingComponent } from './sorting/sorting.component';
import { PackingComponent } from './packing/packing.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { BatchDetailComponent } from './batch-detail/batch-detail.component';
import { RcnListComponent } from './rcn/rcn-list.component';

const routes: Routes = [
  {
    path: '',
    component: BatchesComponent,
    children: [
      { path: '', redirectTo: 'rcn', pathMatch: 'full' },
      { path: 'rcn', component: RcnListComponent },
      { path: 'boiling', component: BoilingComponent },
      { path: 'cutting', component: CuttingComponent },
      { path: 'kernel', component: KernelComponent },
      { path: 'peeling', component: PeelingComponent },
      { path: 'sorting', component: SortingComponent },
      { path: 'packing', component: PackingComponent },
      { path: 'pipeline', component: PipelineComponent },
      { path: 'detail/:id', component: BatchDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BatchesRoutingModule { }
