// mui-datatable.component.ts
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ViewChild,
  AfterViewInit,
  inject,
  input,
  computed,
  effect,
  signal,
  DestroyRef,
  Directive,
  ViewContainerRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
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
import { ExtendedComponentSchema } from '@formio/angular';
import { FormDialogComponent, ActionDialogComponent, FormDialogData, ActionDialogData, DialogAction } from '../dialog';
import { Action, ColumnDefinition, RowAction, TableOptions } from '../interfaces';
import { FilterEntriesPipe } from '../pipes';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { DataStoreService, DataTableService, NotificationService } from '../services';
import { DataFilters } from '../services/datastore.service';
import { DataModel } from '../types';

export const SHARE_IMPORTS = [
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
  MatChipsModule,
  FilterEntriesPipe,
  DragDropModule,
];

const defaultTableOptions: TableOptions = {
  remote: false,
  searchPlaceholder: 'Type to filter...',
  rowsPerPageOptions: [5, 10, 25],
  expandableRows: false,
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

@Directive()
export abstract class DataTableComponent<TModel extends DataModel> implements AfterViewInit {
  //#region Signals
  readonly title = input.required<string>();
  readonly columns = input.required<ColumnDefinition[]>();
  readonly options = input.required<TableOptions>();
  readonly tableOptions = computed(() => ({
    filterForm: this.dataTableService.createDefaultFormInput(this.columns().filter(col => col.filter !== false)),
    editForm: this.dataTableService.createDefaultFormInput(this.columns().filter(col => col.editable !== false)),
    ...defaultTableOptions,
    ...this.options(),
  }));
  readonly columnsToDisplay = computed(() => this.columns().filter(col => col.display !== false));
  readonly columnNamesToDisplay = computed(() => [
    ...(this.tableOptions().reorder === true ? ['dragHandle'] : []),
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
      if (!this.paginator) return index;
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
  componentError: string | null = null;
  loading = signal<boolean>(false).asReadonly();
  filters = signal<DataFilters>({ search: null, filter: null }).asReadonly();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<TModel>;

  dataSource = new MatTableDataSource<TModel>([]);
  expandedElement = signal<TModel | null>(null);
  expandedComponentRef?: ComponentRef<any>;
  protected environmentInjector = inject(EnvironmentInjector);

  constructor(
    protected readonly dataTableService: DataTableService<TModel>,
    protected readonly dataStoreService: DataStoreService<TModel>,
    protected readonly notificationService: NotificationService,
    protected readonly dialogService: MatDialog
  ) {
    this.subscribeToState();
  }

  ngAfterViewInit(): void {
    this.initializeComponent();
  }

  //#region State management
  private initializeComponent(): void {
    try {
      const filterableColumns = this.columns().filter(col => col.filter !== false);
      this.dataTableService.validateFormInput(filterableColumns, this.tableOptions().filterForm);
    } catch (error: any) {
      this.componentError = `Error with FilterForm input: ${error.message}`;
      return;
    }

    try {
      const editableColumns = this.columns().filter(col => col.editable !== false);
      this.dataTableService.validateFormInput(editableColumns, this.tableOptions().editForm);
    } catch (error: any) {
      this.componentError = `Error with EditForm input: ${error.message}`;
      return;
    }

    // Set the DataStoreService settings for filtering
    this.dataStoreService.setSettings({
      columns: this.columns(),
      table: this.tableOptions(),
    });

    if (!this.tableOptions().remote) {
      this.loadInitialData();
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator || null;
    }

    // Subscribe to pagination & sorting changes
    this.paginator?.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(pageEvent => {
      this.dataStoreService.setPagination({
        page: pageEvent.pageIndex,
        pageSize: pageEvent.pageSize,
        total: pageEvent.length,
        totalPages: Math.ceil(pageEvent.length / pageEvent.pageSize),
      });
    });
    this.sort.sortChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.paginator?.firstPage();
      this.dataStoreService.setSorting({
        column: this.sort.active,
        direction: this.sort.direction as 'asc' | 'desc',
      });
    });
  }

  protected subscribeToState(): void {
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

    // Subscribe to loading state
    this.loading = this.dataStoreService.loading;

    // Subscribe to error
    this.error = this.dataStoreService.error;

    // Subscribe to filters
    this.filters = this.dataStoreService.filters;
  }

  private updateTableData(data: TModel[]): void {
    const tableData: TModel[] = data.filter(resource => resource && resource.id); // Filter out null/undefined resources
    this.dataSource.data = tableData;
  }

  abstract loadInitialData(): void;
  //#endregion

  //#region Feature: Expandable Rows

  isExpanded(element: TModel) {
    return this.expandedElement() === element;
  }

  toggleExpand(element: TModel) {
    const newExpandedElement = this.isExpanded(element) ? null : element;
    this.expandedElement.set(newExpandedElement);
  }

  toggle(element: TModel): void {
    this.toggleExpand(element);
  }

  getExpandedComponentInputs(element: TModel): Record<string, any> {
    const inputs: Record<string, any> = {
      data: element,
    };

    // Merge additional inputs if provided
    const additionalInputs = this.tableOptions().expandableRowComponentInputs;
    if (additionalInputs) {
      Object.assign(inputs, additionalInputs);
    }

    return inputs;
  }

  createExpandedComponent(container: ViewContainerRef, element: TModel): void {
    const componentType = this.tableOptions().expandableRowComponent;
    if (!componentType) return;

    // Clear any existing component
    container.clear();
    if (this.expandedComponentRef) {
      this.expandedComponentRef.destroy();
    }

    // Create the component
    this.expandedComponentRef = createComponent(componentType, {
      environmentInjector: this.environmentInjector,
      hostElement: container.element.nativeElement,
    });

    // Set the row data as input
    this.expandedComponentRef.setInput('data', element);

    // Set additional inputs if provided
    const additionalInputs = this.tableOptions().expandableRowComponentInputs;
    if (additionalInputs) {
      Object.entries(additionalInputs).forEach(([key, value]) => {
        this.expandedComponentRef!.setInput(key, value);
      });
    }

    // Attach the component to the container
    container.insert(this.expandedComponentRef.hostView);
  }

  //#endregion

  //#region Feature: Pagination

  jumpToPage(event: MatSelect) {
    const value = parseInt(event.value, 10);
    if (!isNaN(value) && this.paginator) {
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

  abstract changeFilter(data: any): void;
  abstract addItem(item: TModel): void;
  abstract updateItem(item: TModel): void;
  abstract deleteItem(item: TModel): void;

  openFilterDialog(): void {
    const { filter } = this.dataStoreService.filters();
    const formComponents = this.dataStoreService.settings()?.table.filterForm;

    this.openFormDialog({
      formComponents,
      formValue: filter,
      title: 'Filter',
      actionLabel: 'Apply',
      onResult: ({ action, data }) => (action.type === 'ok' ? this.changeFilter(data) : null),
    });
  }

  openAddEditDialog(item?: TModel): void {
    const formComponents = this.dataStoreService.settings()?.table.editForm;
    const isEdit = !!item;

    this.openFormDialog({
      formComponents,
      formValue: item,
      title: isEdit ? `Edit ${item.name}` : 'Add item',
      actionLabel: isEdit ? 'Save' : 'Add',
      onResult: ({ action, data }) => {
        if (action.type !== 'ok') {
          return;
        }
        if (isEdit && data.id) {
          this.updateItem(data);
        } else if (!isEdit) {
          this.addItem(data);
        }
      },
    });
  }

  openDeleteConfirmDialog(item: TModel, index: number): void {
    this.openActionDialog({
      title: `Delete ${item.name}`,
      message: 'Are you sure you want to delete this item?',
      onResult: action => (action.type === 'ok' ? this.deleteItem(item) : null),
    });
  }

  private openFormDialog(config: {
    formComponents: ExtendedComponentSchema[] | undefined;
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

  removeFilterEntry(entry: [string, any]): void {
    const currentFilters = this.dataStoreService.filters().filter || {};
    const { [entry[0]]: _, ...updatedFilters } = currentFilters;
    this.changeFilter(updatedFilters);
  }

  clearFilterEntries(): void {
    this.changeFilter({});
  }
  //#endregion

  //#region Feature: Row Reordering
  dropTable(event: CdkDragDrop<TModel[]>) {
    if (this.tableOptions().reorder !== true) return;

    const data = [...this.dataSource.data];
    moveItemInArray(data, event.previousIndex, event.currentIndex);
    this.dataSource.data = data;

    // Update the data store if not in remote mode
    if (!this.tableOptions().remote) {
      this.dataStoreService.setData(data);
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
