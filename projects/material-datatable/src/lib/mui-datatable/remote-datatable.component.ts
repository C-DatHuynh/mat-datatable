import { Component, effect, input, output, AfterViewInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ColumnDefinition, TableOptions } from '../interfaces';
import { DataStoreService, NotificationService, RemoteDataTableService } from '../services';
import { DataModel } from '../types';
import { DataTableComponent, SHARE_IMPORTS } from './mui-datatable.component';

@Component({
  selector: 'app-remote-mui-datatable',
  templateUrl: './mui-datatable.component.html',
  styleUrls: ['./mui-datatable.component.scss'],
  standalone: true,
  imports: SHARE_IMPORTS,
  providers: [RemoteDataTableService, DataStoreService],
})
export class RemoteDataTableComponent<TModel extends DataModel>
  extends DataTableComponent<TModel>
  implements AfterViewInit
{
  override readonly title = input.required<string>();
  override readonly columns = input.required<ColumnDefinition[]>();
  override readonly options = input.required<TableOptions>();
  apiResult = output<boolean | Error>();

  constructor(
    private remoteDataTableService: RemoteDataTableService<TModel>,
    protected override dataStoreService: DataStoreService<TModel>,
    protected override notificationService: NotificationService,
    protected override dialogService: MatDialog
  ) {
    super(remoteDataTableService, dataStoreService, notificationService, dialogService);
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    // Subscribe to apiResult after component is fully initialized
    this.remoteDataTableService.apiResult.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      this.apiResult.emit(result as boolean | Error);
    });
  }

  loadInitialData(): void {
    this.remoteDataTableService.populateAllItems();
  }

  changeFilter(data: any): void {
    this.dataStoreService.setFilterForm(data);
  }

  addItem(item: TModel): void {
    this.remoteDataTableService.addItem(item);
  }

  updateItem(item: TModel): void {
    this.remoteDataTableService.updateItem(item);
  }

  deleteItem(item: TModel): void {
    this.remoteDataTableService.deleteItem(item.id);
  }

  override subscribeToState(): void {
    super.subscribeToState();

    effect(() => {
      const pagination = this.dataStoreService.pagination();
      const sorting = this.dataStoreService.sorting();
      const filter = this.dataStoreService.filters();
      const settings = this.dataStoreService.settings();
      if (settings?.table.remote) {
        this.remoteDataTableService.populateItems(pagination, filter, sorting);
      }
    });
  }
}
