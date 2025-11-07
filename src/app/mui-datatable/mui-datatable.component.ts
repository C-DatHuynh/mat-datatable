// mui-datatable.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, AfterViewInit, inject, input, computed, Inject, OnDestroy, effect, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { catchError, finalize, merge, Observable, of, startWith, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { AddEditDialogComponent, ConfirmDeleteDialogComponent, FilterDialogComponent } from '../dialog';
import { DynamicFormControlOptions } from '../dynamic-form';
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

const defaultControlOption: DynamicFormControlOptions = {
  controlType: 'textbox',
  type: 'text',
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
        onClick: (item: object, index: number) => this.openAddEditDialog(item as TModel, getTrueIndex(index)),
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

  private readonly destroyRef = inject(DestroyRef);
  error = signal<string | null>(null).asReadonly();
  loading = signal<boolean>(false).asReadonly();

  constructor(
    @Inject(API_SERVICE_TOKEN) private readonly apiService: ApiService<TModel>,
    private readonly dataTableService: DataTableService<TModel>,
    private readonly dataStoreService: DataStoreService<TModel>,
    private readonly notificationService: NotificationService,
    private readonly dialogService: MatDialog
  ) {
    this.subscribeToState();
  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<TModel>;
  @ViewChild(MatInput) searchInput!: MatInput;

  dataSource = new MatTableDataSource<TModel>([]);
  expandedElement!: TModel | null;

  ngAfterViewInit(): void {
    this.initializeComponent();
  }

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

    // Subscribe to pagination
    this.paginator.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(pageEvent => {
      this.dataStoreService.setPagination({
        page: pageEvent.pageIndex,
        pageSize: pageEvent.pageSize,
        total: pageEvent.length,
        totalPages: Math.ceil(pageEvent.length / pageEvent.pageSize),
      });
    });
    this.sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() =>
      this.dataStoreService.setSorting({
        column: this.sort.active,
        direction: this.sort.direction as 'asc' | 'desc',
      })
    );
  }

  private subscribeToState(): void {
    effect(() => {
      const filteredData = this.dataStoreService.filteredData();
      this.updateTableData(filteredData);
    });
    effect(() => {
      const pagination = this.dataStoreService.pagination();
      const sorting = this.dataStoreService.sorting();
      const filter = this.dataStoreService.filters();
      const settings = this.dataStoreService.settings();
      if (settings?.table.remote) {
        this.callApi(this.apiService.listRemote(pagination, filter, sorting)).subscribe((result: { data: TModel[]; total: number }) => {
          this.dataStoreService.setData(result.data);
          this.paginator.length = result.total;
        });
      }
      return;
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
    this.callApi(this.apiService.list()).subscribe((resources: TModel[]) => this.dataStoreService.setData(resources));
  }

  toggle(element: TModel): void {
    this.toggleExpand(element);
  }

  /** Checks whether an element is expanded. */
  isExpanded(element: TModel) {
    return this.expandedElement === element;
  }

  /** Toggles the expanded state of an element. */
  toggleExpand(element: TModel) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  jumpToPage(event: MatSelect) {
    const value = parseInt(event.value, 10);
    if (!isNaN(value)) {
      this.paginator.pageIndex = value;
      this.paginator._changePageSize(this.paginator.pageSize);
    }
  }

  openFilterDialog(): void {
    const { formSearch = {} } = this.dataSource.filter ? JSON.parse(this.dataSource.filter) : {};
    const columnConfig = this.columns()
      .filter(column => column.filter !== false)
      .reduce(
        (acc, col) => ({
          ...acc,
          [col.name]: col.filterOptions ?? defaultControlOption,
        }),
        {}
      );
    const dialogRef = this.dialogService.open(FilterDialogComponent, {
      data: {
        columnConfig: columnConfig,
        formValue: formSearch,
        title: 'Filter',
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.searchInput.value = '';
      this.dataSource.filter = JSON.stringify({
        formSearch: result,
      });
    });
  }

  openAddEditDialog(item?: TModel, index?: number): void {
    const columnConfig = this.columns().reduce(
      (acc, col) => ({
        ...acc,
        [col.name]: col.editOptions ?? defaultControlOption,
      }),
      {}
    );
    const dialogRef = this.dialogService.open(AddEditDialogComponent, {
      data: {
        columnConfig: columnConfig,
        formValue: item,
        title: item ? `Edit ${item.name}` : `Add item`,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      if (index !== undefined) {
        //this.dataSource.updateInDataSource(result, index);
      } else {
        //this.dataSource.addToDataSource(result);
      }
    });
  }

  openDeleteConfirmDialog(item: TModel, index: number): void {
    const columnConfig: Record<string, DynamicFormControlOptions> = {
      confirm: {
        label: 'Type "delete" to confirm',
        controlType: 'textbox',
        type: 'text',
        validators: [Validators.required, Validators.pattern(/^delete$/i)],
      },
    };
    const dialogRef = this.dialogService.open(ConfirmDeleteDialogComponent, {
      data: {
        title: `Confirm delete ${item.name}`,
        columnConfig: columnConfig,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      //this.dataSource.removeFromDataSource(index);
    });
  }

  getPageList() {
    const numberOfPages = this.paginator?.getNumberOfPages();
    if (!numberOfPages) {
      return [];
    }
    return Array.from({ length: numberOfPages }, (_, i) => i);
  }

  onRowActionClicked(event: Event, action: RowAction, item: TModel, index: number): void {
    event.stopPropagation();
    action.onClick(item, index);
  }

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

  callApi<T>(apiCall: Observable<T>): Observable<T> {
    this.dataStoreService.setLoading(true);
    this.dataStoreService.clearError();

    return apiCall.pipe(
      catchError(error => {
        const errorMsg = error?.message || 'An error occurred';
        this.dataStoreService.setError(errorMsg);
        console.error('API Error:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.dataStoreService.setLoading(false);
      })
    );
  }
}
