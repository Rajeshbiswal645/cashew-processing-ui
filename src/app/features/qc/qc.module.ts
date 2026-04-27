import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QcRoutingModule } from './qc-routing.module';
import { QcComponent } from './qc.component';


@NgModule({
  declarations: [
    QcComponent
  ],
  imports: [
    CommonModule,
    QcRoutingModule
  ]
})
export class QcModule { }
