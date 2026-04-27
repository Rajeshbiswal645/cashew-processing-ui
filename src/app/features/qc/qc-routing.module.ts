import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QcComponent } from './qc.component';

const routes: Routes = [{ path: '', component: QcComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcRoutingModule { }
