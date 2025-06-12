// mui-datatable.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit, AfterViewInit, inject, input, computed } from '@angular/core';
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
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AddEditDialogComponent, ConfirmDeleteDialogComponent, FilterDialogComponent } from '../dialog';
import { DynamicFormControlOptions } from '../dynamic-form';
import { Action, ColumnDefinition, DataModel, RowAction, TableOptions } from '../types';
import { BasicDataSource, RemoteDataSource } from './datasource';
import { DataService, DataTableService } from './mui-datatable.service';

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
];

const defaultTableOptions: TableOptions = {
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
  providers: [DataTableService],
})
export class DataTableComponent<TModel extends DataModel> implements OnInit, AfterViewInit {
  readonly dataTableService = inject(DataTableService<TModel>);
  readonly data = input<TModel[]>([]);
  readonly title = input.required<string>();
  readonly columns = input.required<ColumnDefinition[]>();
  readonly options = input.required<TableOptions>();
  readonly tableOptions = computed(() => ({
    ...defaultTableOptions,
    ...this.options(),
  }));
  readonly columnsToDisplay = computed(() => this.columns().filter(col => col.options.display !== false));
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

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<TModel>;
  @ViewChild(MatInput) searchInput!: MatInput;
  filterDialog = inject(MatDialog);

  protected dataSource!: BasicDataSource<TModel>;
  expandedElement!: TModel | null;

  ngOnInit(): void {
    this.dataSource = new BasicDataSource<TModel>(this.data(), this.columns());
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applySearch(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = JSON.stringify({
      textSearch: filterValue.trim().toLowerCase(),
    });

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
      .filter(column => column.options.filter !== false)
      .reduce(
        (acc, col) => ({
          ...acc,
          [col.name]: col.options.filterOptions ?? defaultControlOption,
        }),
        {}
      );
    console.log('columnConfig', columnConfig);
    const dialogRef = this.filterDialog.open(FilterDialogComponent, {
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
        [col.name]: col.options.editOptions ?? defaultControlOption,
      }),
      {}
    );
    const dialogRef = this.filterDialog.open(AddEditDialogComponent, {
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
        this.dataSource.updateInDataSource(result, index);
      } else {
        this.dataSource.addToDataSource(result);
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
    const dialogRef = this.filterDialog.open(ConfirmDeleteDialogComponent, {
      data: {
        title: `Confirm delete ${item.name}`,
        columnConfig: columnConfig,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.dataSource.removeFromDataSource(index);
    });
  }

  getPageList() {
    const numberOfPages = this.paginator?.getNumberOfPages();
    if (!numberOfPages) {
      return [];
    }
    return Array.from({ length: numberOfPages }, (_, i) => i + 1);
  }

  onRowActionClicked(event: Event, action: RowAction, item: TModel, index: number): void {
    event.stopPropagation();
    action.onClick(item, index);
  }
}

@Component({
  selector: 'app-mui-datatable-remote',
  templateUrl: './mui-datatable.component.html',
  styleUrls: ['./mui-datatable.component.scss'],
  standalone: true,
  imports: SHARE_IMPORTS,
  providers: [DataTableService],
})
export class RemoteDatatableComponent<TModel extends DataModel> extends DataTableComponent<TModel> implements OnInit {
  declare protected dataSource: RemoteDataSource<TModel>;
  private readonly dataService = inject(DataService<TModel>);

  override ngOnInit(): void {
    this.dataSource = new RemoteDataSource<TModel>(this.dataService, this.columns());
    this.dataSource.loadAll();
  }
}
