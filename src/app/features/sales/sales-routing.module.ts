import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DispatchComponent } from './dispatch.component';
import { SalesDetailComponent } from './sales-detail.component';
import { SalesListComponent } from './sales-list.component';

const routes: Routes = [
  { path: '', component: SalesListComponent },
  { path: ':id/dispatch', component: DispatchComponent },
  { path: ':id', component: SalesDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
