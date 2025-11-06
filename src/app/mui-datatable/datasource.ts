import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { DataService } from '../services/datatable.service';
import { ColumnDefinition, DataModel, FilterPayload, PrimitiveType } from '../types';
import { isNonEmpty } from '../utils';

export class BasicDataSource<TModel extends DataModel> extends MatTableDataSource<TModel> {
  // Loading state observable
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  constructor(
    initialData: TModel[],
    protected readonly columns: ColumnDefinition[]
  ) {
    super(initialData);
  }

  override filterPredicate = (data: TModel, filter: string): boolean => {
    const { textSearch, formSearch } = JSON.parse(filter) as FilterPayload;
    const allowedColumns = this.columns.filter(col => col.options.filter !== false);
    if (textSearch !== undefined) {
      const filterValue = textSearch.trim().toLowerCase();
      // Loops over the values in the array and returns true if any of them match the filter string
      return allowedColumns.some(column => {
        const itemValue = data[column.name as keyof TModel] as PrimitiveType;
        return `${itemValue}`.toLowerCase().includes(filterValue);
      });
    }
    if (formSearch !== undefined) {
      return allowedColumns
        .filter(column => isNonEmpty(formSearch[column.name]))
        .every(column => {
          const {
            name,
            options: { filterOptions },
          } = column;
          const filterValue = formSearch[name];
          const itemValue = data[name as keyof TModel] as PrimitiveType;
          if (filterOptions?.logic) {
            return filterOptions.logic(itemValue, filterValue, data);
          }
          return itemValue === filterValue || (Array.isArray(filterValue) && filterValue.includes(itemValue));
        });
    }
    throw new Error('Invalid filter payload');
  };

  addToDataSource(data: TModel) {
    this.data = [...this.data, data];
  }

  updateInDataSource(data: TModel, index: number) {
    const updatedData = [...this.data];
    updatedData[index] = data;
    this.data = updatedData;
  }

  removeFromDataSource(index: number) {
    const updatedData = [...this.data];
    updatedData.splice(index, 1);
    this.data = updatedData;
  }
}

export class RemoteDataSource<TModel extends DataModel, TDto extends TModel = TModel> extends BasicDataSource<TModel> {
  constructor(
    private readonly dataService: DataService<TModel>,
    protected override readonly columns: ColumnDefinition[]
  ) {
    super([], columns);
  }

  loadAll() {
    this.loadingSubject.next(true);
    this.dataService
      ?.getList()
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        this.data = data;
      });
  }

  add(dto: TDto) {
    this.dataService
      .add(dto)
      .pipe(
        catchError(() => of(null)), // Handle error gracefully
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((data: TModel | null) => {
        if (data) {
          this.addToDataSource(data);
        }
      });
  }

  update(dto: TDto, index: number) {
    this.dataService
      .update(dto)
      .pipe(
        catchError(() => of(null)), // Handle error gracefully
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((data: TModel | null) => {
        if (data) {
          this.updateInDataSource(data, index);
        }
      });
  }

  remove(id: number, index: number) {
    this.dataService
      .remove(id)
      .pipe(
        catchError(() => of(null)), // Handle error gracefully
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((data: number | null) => {
        if (data !== null) {
          this.removeFromDataSource(index);
        }
      });
  }
}
