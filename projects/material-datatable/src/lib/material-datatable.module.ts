import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { FormioModule } from '@formio/angular';
import { ActionDialogComponent } from './dialog/action-dialog.component';
import { BaseDialogComponent } from './dialog/base-dialog.component';
import { FormDialogComponent } from './dialog/form-dialog.component';
import { FormRendererComponent } from './formio/form-renderer.component';
// Import all components (only the concrete standalone components, not the abstract base class)
import { BasicDataTableComponent } from './mui-datatable/basic-datatable.component';
import { RemoteDataTableComponent } from './mui-datatable/remote-datatable.component';
// Import pipes
import { CastPipe, FilterEntriesPipe } from './pipes';
import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormioModule,
    // Standalone components and pipes
    BasicDataTableComponent,
    RemoteDataTableComponent,
    SearchBarComponent,
    ActionDialogComponent,
    FormDialogComponent,
    BaseDialogComponent,
    FormRendererComponent,
    CastPipe,
    FilterEntriesPipe,
  ],
  exports: [
    // Standalone components - these are imported and re-exported
    BasicDataTableComponent,
    RemoteDataTableComponent,
    SearchBarComponent,
    ActionDialogComponent,
    FormDialogComponent,
    BaseDialogComponent,
    FormRendererComponent,
    // Traditional Angular pipe
    CastPipe,
    FilterEntriesPipe,
  ],
})
export class MaterialDatatableModule {}
