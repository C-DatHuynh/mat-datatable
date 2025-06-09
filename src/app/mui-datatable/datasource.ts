import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, catchError, finalize, of } from 'rxjs';
import { ColumnDefinition, DataModel, FilterPayload, PrimitiveType, SelectOptionType } from '../types';
import { isNonEmpty } from '../utils';
import { DataService } from './mui-datatable.service';

export class BasicDataSource<TModel extends DataModel> extends MatTableDataSource<TModel> {
  // Loading state observable
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();
  public columns: ColumnDefinition[] = [];

  constructor(initialData: TModel[], columns: ColumnDefinition[] = []) {
    super(initialData);
    this.columns = [...columns];
    this.updateColumnSelectionOptions(initialData);
  }

  override set data(data: TModel[]) {
    super.data = data;
    this.updateColumnSelectionOptions(data);
  }

  override get data(): TModel[] {
    return super.data;
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

  private createSelectOptions(columnName: string, data: TModel[], renderLabel?: (value: PrimitiveType) => string): SelectOptionType[] {
    return data.map(item => {
      const value = item[columnName as keyof TModel] as PrimitiveType;
      const key = renderLabel ? renderLabel(value) : value;
      return { key, value };
    }) as SelectOptionType[];
  }

  private updateColumnSelectionOptions(data: TModel[]) {
    const updateOptions = (key: 'filterOptions' | 'editOptions') => {
      this.columns
        .filter(col => col.options[key]?.controlType === 'dropdown' || col.options[key]?.controlType === 'multiselect')
        .forEach(col => {
          const opts = col.options[key] ?? {};
          const { selectOptions, renderLabel } = opts;
          col.options[key] = {
            ...opts,
            selectOptions: selectOptions ?? this.createSelectOptions(col.name, data, renderLabel),
          };
        });
    };
    updateOptions('filterOptions');
    updateOptions('editOptions');
  }

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
    columns: ColumnDefinition[]
  ) {
    super([]);
    this.columns = [...columns];
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
