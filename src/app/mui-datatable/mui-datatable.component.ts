// mui-datatable.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  AfterViewInit,
  inject,
  input,
  computed,
  Inject,
  effect,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormDialogComponent, ActionDialogComponent, FormDialogData, ActionDialogData, DialogAction } from '../dialog';
import { Action, ColumnDefinition, RowAction, TableOptions } from '../interfaces';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { API_SERVICE_TOKEN, ApiService, DataStoreService, DataTableService, NotificationService } from '../services';
import { DataModel } from '../types';

const SHARE_IMPORTS = [
  CommonModule,
  MatTableModule,
  MatFormFieldModule,
  MatInputModule,
  MatSortModule,
  MatPaginatorModule,
  MatButtonModule,
  MatIconModule,
  MatSelectModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  SearchBarComponent,
];

const defaultTableOptions: TableOptions = {
  remote: false,
  searchPlaceholder: 'Type to filter...',
  rowsPerPageOptions: [5, 10, 25],
  expandableRows: true,
  customActions: [],
  customRowActions: [],
  rowsPerPage: 5,
  canAdd: true,
  canPrint: true,
  canExport: true,
  canEdit: true,
  canDelete: true,
  canFilter: true,
  jumpToPage: false,
  selectableRows: 'none',
};

@Component({
  selector: 'app-mui-datatable',
  templateUrl: './mui-datatable.component.html',
  styleUrls: ['./mui-datatable.component.scss'],
  standalone: true,
  imports: SHARE_IMPORTS,
  providers: [DataTableService, DataStoreService],
})
export class DataTableComponent<TModel extends DataModel> implements AfterViewInit {
  //#region Signals
  readonly data = input<TModel[]>();
  readonly title = input.required<string>();
  readonly columns = input.required<ColumnDefinition[]>();
  readonly options = input.required<TableOptions>();
  readonly tableOptions = computed(() => ({
    ...defaultTableOptions,
    ...this.options(),
  }));
  readonly columnsToDisplay = computed(() => this.columns().filter(col => col.display !== false));
  readonly columnNamesToDisplay = computed(() => [
    ...(this.tableOptions().expandableRows === true ? ['expand'] : []),
    ...this.columnsToDisplay().map(col => col.name),
    ...(this.rowActions().length > 0 ? ['rowActions'] : []),
  ]);
  readonly actions = computed(() => {
    const allActions: Action[] = [];
    const { canAdd, canPrint, canExport, canFilter, customActions = [] } = this.tableOptions();
    if (canAdd) {
      allActions.push({
        label: 'Add',
        icon: 'add',
        onClick: () => this.openAddEditDialog(),
      });
    }
    if (canPrint) {
      allActions.push({
        label: 'Print',
        icon: 'print',
        onClick: () => this.dataTableService.printTable(this.title()),
      });
    }
    if (canExport) {
      allActions.push({
        label: 'Export',
        icon: 'save_alt',
        onClick: () => this.dataTableService.exportToCsv(this.title(), this.columns(), this.dataSource.data),
      });
    }
    if (canFilter) {
      allActions.push({
        label: 'Filter',
        icon: 'filter_list',
        onClick: () => this.openFilterDialog(),
      });
    }
    return [...allActions, ...customActions];
  });
  readonly rowActions = computed(() => {
    const allActions: RowAction[] = [];
    const getTrueIndex = (index: number) => {
      const { pageIndex } = this.paginator;
      return pageIndex > 0 ? pageIndex * this.paginator.pageSize + index : index;
    };
    const { canEdit, canDelete, customRowActions = [] } = this.tableOptions();
    if (canEdit) {
      allActions.push({
        label: 'Edit',
        icon: 'edit',
        onClick: (item: object, index: number) => this.openAddEditDialog(item as TModel),
      });
    }
    if (canDelete) {
      allActions.push({
        label: 'Delete',
        icon: 'delete',
        onClick: (item: object, index: number) => this.openDeleteConfirmDialog(item as TModel, getTrueIndex(index)),
      });
    }
    return [...customRowActions, ...allActions];
  });
  //#endregion

  private readonly destroyRef = inject(DestroyRef);
  error = signal<string | null>(null).asReadonly();
  loading = signal<boolean>(false).asReadonly();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<TModel>;

  dataSource = new MatTableDataSource<TModel>([]);
  expandedElement!: TModel | null;

  constructor(
    private readonly dataTableService: DataTableService<TModel>,
    private readonly dataStoreService: DataStoreService<TModel>,
    private readonly notificationService: NotificationService,
    private readonly dialogService: MatDialog
  ) {
    this.subscribeToState();
  }

  ngAfterViewInit(): void {
    this.initializeComponent();
  }

  //#region State management
  private initializeComponent(): void {
    // Set the DataStoreService settings for filtering
    this.dataStoreService.setSettings({
      columns: this.columns(),
      table: this.tableOptions(),
    });

    if (!this.tableOptions().remote) {
      this.loadInitialData();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }

    // Subscribe to pagination & sorting changes
    this.paginator.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(pageEvent => {
      this.dataStoreService.setPagination({
        page: pageEvent.pageIndex,
        pageSize: pageEvent.pageSize,
        total: pageEvent.length,
        totalPages: Math.ceil(pageEvent.length / pageEvent.pageSize),
      });
    });
    this.sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.paginator.firstPage();
      this.dataStoreService.setSorting({
        column: this.sort.active,
        direction: this.sort.direction as 'asc' | 'desc',
      });
    });
  }

  private subscribeToState(): void {
    effect(() => {
      const filteredData = this.dataStoreService.filteredData();
      this.updateTableData(filteredData);
    });

    effect(() => {
      const totalItems = this.dataStoreService.totalItems();
      if (this.paginator && this.paginator.length !== totalItems) {
        this.paginator.length = totalItems;
      }
    });

    effect(() => {
      const pagination = this.dataStoreService.pagination();
      const sorting = this.dataStoreService.sorting();
      const filter = this.dataStoreService.filters();
      const settings = this.dataStoreService.settings();
      if (settings?.table.remote) {
        this.dataTableService.populateItems(pagination, filter, sorting);
      }
    });

    // Subscribe to loading state
    this.loading = this.dataStoreService.loading;

    // Subscribe to error
    this.error = this.dataStoreService.error;
  }

  private updateTableData(data: TModel[]): void {
    const tableData: TModel[] = data.filter(resource => resource && resource.id); // Filter out null/undefined resources
    this.dataSource.data = tableData;
  }

  private loadInitialData(): void {
    const inputData = this.data();
    if (inputData) {
      this.dataStoreService.setData(inputData);
      return;
    }
    this.dataTableService.populateAllItems();
  }
  //#endregion

  //#region Feature: Expandable Rows

  isExpanded(element: TModel) {
    return this.expandedElement === element;
  }

  toggleExpand(element: TModel) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  toggle(element: TModel): void {
    this.toggleExpand(element);
  }

  //#endregion

  //#region Feature: Pagination

  jumpToPage(event: MatSelect) {
    const value = parseInt(event.value, 10);
    if (!isNaN(value)) {
      this.paginator.pageIndex = value;
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }

  getPageList() {
    const numberOfPages = this.paginator?.getNumberOfPages();
    if (!numberOfPages) {
      return [];
    }
    return Array.from({ length: numberOfPages }, (_, i) => i);
  }

  //#endregion

  //#region Feature: Popups
  openFilterDialog(): void {
    const { filter = {} } = this.dataStoreService.filters();
    const formComponents = this.dataTableService.buildFormComponents('filter');

    this.openFormDialog({
      formComponents,
      formValue: filter,
      title: 'Filter',
      actionLabel: 'Apply',
      onResult: ({ action, data }) => (action.type === 'ok' ? this.dataStoreService.setFilterForm(data) : null),
    });
  }

  openAddEditDialog(item?: TModel): void {
    const formComponents = this.dataTableService.buildFormComponents('edit');
    const isEdit = !!item;

    this.openFormDialog({
      formComponents,
      formValue: item,
      title: isEdit ? `Edit ${item.name}` : 'Add item',
      actionLabel: isEdit ? 'Save' : 'Add',
      onResult: ({ action, data }) => {
        console.log('Dialog result action:', action, data, isEdit);
        if (action.type !== 'ok') {
          return;
        }
        if (isEdit && data.id) {
          console.log(action, data, isEdit);
          this.dataTableService.updateItem(data, !!this.data());
        } else if (!isEdit) {
          this.dataTableService.addItem(data, !!this.data());
        }
      },
    });
  }

  openDeleteConfirmDialog(item: TModel, index: number): void {
    this.openActionDialog({
      title: `Delete ${item.name}`,
      message: 'Are you sure you want to delete this item?',
      onResult: action => (action.type === 'ok' ? this.dataTableService.deleteItem(item.id, !!this.data()) : null),
    });
  }

  private openFormDialog(config: {
    formComponents: any[];
    formValue: any;
    title: string;
    actionLabel: string;
    onResult: (result: { action: DialogAction; data: any }) => void;
  }): void {
    const dialogRef = this.dialogService.open(FormDialogComponent, {
      data: {
        formComponents: config.formComponents,
        formValue: config.formValue,
        title: config.title,
        actions: [
          {
            label: config.actionLabel,
            type: 'ok',
            color: 'primary',
            variant: 'stroked',
          },
        ],
      } as FormDialogData,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        config.onResult(result);
      }
    });
  }

  private openActionDialog(config: { title: string; message: string; onResult: (action: DialogAction) => void }): void {
    const dialogRef = this.dialogService.open(ActionDialogComponent, {
      data: {
        title: config.title,
        message: config.message,
        actions: [],
      } as ActionDialogData,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        config.onResult(result);
      }
    });
  }

  //#endregion

  //#region Feature: Filter
  applySearch(value: string): void {
    // Update the DataStoreService with the search text
    this.dataStoreService.setTextSearch(value);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSearchClear(): void {
    // Clear the DataStoreService search text
    this.dataStoreService.clearTextSearch();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  //#endregion

  onRowActionClicked(event: Event, action: RowAction, item: TModel, index: number): void {
    event.stopPropagation();
    action.onClick(item, index);
  }

  //#region Helper

  //#endregion
}
