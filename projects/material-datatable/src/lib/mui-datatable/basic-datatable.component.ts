import { Component, effect, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ColumnDefinition, TableOptions } from '../interfaces';
import { BasicDataTableService, DataStoreService, NotificationService } from '../services';
import { DataModel } from '../types';
import { DataTableComponent, SHARE_IMPORTS } from './mui-datatable.component';

@Component({
  selector: 'app-mui-datatable',
  templateUrl: './mui-datatable.component.html',
  styleUrls: ['./mui-datatable.component.scss'],
  standalone: true,
  imports: SHARE_IMPORTS,
  providers: [BasicDataTableService, DataStoreService],
})
export class BasicDataTableComponent<TModel extends DataModel> extends DataTableComponent<TModel> {
  readonly data = input.required<TModel[]>();
  override readonly title = input.required<string>();
  override readonly columns = input.required<ColumnDefinition[]>();
  override readonly options = input.required<TableOptions>();

  readonly onAddItem = output<TModel>();
  readonly onUpdateItem = output<TModel>();
  readonly onDeleteItem = output<TModel>();
  readonly onFilterChange = output<any>();

  constructor(
    protected override dataTableService: BasicDataTableService<TModel>,
    protected override dataStoreService: DataStoreService<TModel>,
    protected override notificationService: NotificationService,
    protected override dialogService: MatDialog
  ) {
    super(dataTableService, dataStoreService, notificationService, dialogService);
  }

  protected override subscribeToState(): void {
    super.subscribeToState();
    effect(() => {
      const data = this.data();
      this.dataStoreService.setData(data || []);
    });
  }

  loadInitialData(): void {
    return;
  }

  changeFilter(data: any): void {
    this.dataStoreService.setFilterForm(data);
    this.onFilterChange.emit(data);
  }

  addItem(item: TModel): void {
    this.onAddItem.emit(item);
  }

  updateItem(index: number, item: TModel): void {
    this.onUpdateItem.emit(item);
  }

  deleteItem(index: number, item: TModel): void {
    this.onDeleteItem.emit(item);
  }
}
