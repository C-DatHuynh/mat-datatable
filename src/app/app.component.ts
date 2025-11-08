import { Component } from '@angular/core';
import {
  BasicDataTableComponent,
  RemoteDataTableComponent,
  ColumnDefinition,
  TableOptions,
  MaterialDatatableModule,
} from '../../projects/material-datatable/src/public-api';

@Component({
  selector: 'app-root',
  template: `
    <h1>Material Datatable Demo</h1>
    <p>This app demonstrates the library components.</p>
    <!-- Add your demo components here -->
  `,
  standalone: true,
  imports: [MaterialDatatableModule],
})
export class AppComponent {
  title = 'material-datatable';
}
