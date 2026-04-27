import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PartyListComponent } from './parties/party-list/party-list.component';
import { PartyFormComponent } from './parties/party-form/party-form.component';
import { RcnBatchComponent } from './batches/rcn-batch/rcn-batch.component';
import { BoilingBatchComponent } from './batches/boiling-batch/boiling-batch.component';
import { CuttingBatchComponent } from './batches/cutting-batch/cutting-batch.component';
import { KernelBatchComponent } from './batches/kernel-batch/kernel-batch.component';
import { PeelingBatchComponent } from './batches/peeling-batch/peeling-batch.component';
import { PackingBatchComponent } from './batches/packing-batch/packing-batch.component';
import { BatchDetailComponent } from './batches/batch-detail/batch-detail.component';
import { InvoiceListComponent } from './invoices/invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoices/invoice-form/invoice-form.component';
import { SortingBatchComponent } from './batches/sorting-batch/sorting-batch.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BatchPipelineComponent } from './batches/batch-pipeline-component/batch-pipeline-component.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from './shared/shared.module';
import { LoginComponent } from './auth/login/login.component';
import { HrmModule } from './features/hrm/hrm.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent,
    PartyListComponent,
    PartyFormComponent,
    RcnBatchComponent,
    BoilingBatchComponent,
    CuttingBatchComponent,
    KernelBatchComponent,
    PeelingBatchComponent,
    BoilingBatchComponent,
    PackingBatchComponent,
    BatchDetailComponent,
    InvoiceListComponent,
    InvoiceFormComponent,
    SortingBatchComponent,
    BatchPipelineComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatExpansionModule,
    MatCardModule,
    MatTableModule,
     MatFormFieldModule,
     ReactiveFormsModule,
     FormsModule,
     MatSelectModule,
     HttpClientModule,
     FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
     MatPaginatorModule,
     MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SharedModule,
    HrmModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
