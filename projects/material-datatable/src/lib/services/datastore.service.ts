import { computed, Injectable, signal } from '@angular/core';
import { ColumnDefinition, TableOptions } from '../interfaces';
import { isNonEmpty } from '../utils';

export interface DataFilters {
  search: string | null;
  filter: { [key: string]: any } | null;
}

export interface DataPagination {
  page: number | null;
  pageSize: number | null;
  total: number | null;
  totalPages: number | null;
}

export interface DataSorting {
  column: string;
  direction: 'asc' | 'desc';
}

export interface DataStoreSettings {
  columns: ColumnDefinition[];
  table: TableOptions;
}

@Injectable({
  providedIn: 'root',
})
export class DataStoreService<T> {
  //#region Signals
  $data = signal<T[]>([]);
  $totalItems = signal<number>(0);
  $selectedItem = signal<T | null>(null);
  $selectedItems = signal<T[]>([]);
  $pagination = signal<DataPagination>({
    page: null,
    pageSize: null,
    total: null,
    totalPages: null,
  });
  $sorting = signal<DataSorting | null>(null);
  $loading = signal<boolean>(false);
  $error = signal<string | null>(null);
  $settings = signal<DataStoreSettings | null>(null);
  $filters = signal<DataFilters>({
    search: null,
    filter: this.settings()?.table.filterFormDefaultValues || null,
  });

  $filteredData = computed(() => {
    const data = this.$data();
    const settings = this.$settings();
    if (!settings || settings.table.remote) {
      return data;
    }
    const filters = this.$filters();
    return this.applyFilters(data, filters, settings.columns);
  });
  //#endregion

  //#region Getters
  get filteredData() {
    return this.$filteredData;
  }

  /*get paginatedData() {
    return this.$paginatedData;
  }*/

  get settings() {
    return this.$settings.asReadonly();
  }

  get data() {
    return this.$data.asReadonly();
  }

  get totalItems() {
    return this.$totalItems.asReadonly();
  }

  get selectedItem() {
    return this.$selectedItem.asReadonly();
  }

  get selectedItems() {
    return this.$selectedItems.asReadonly();
  }

  get filters() {
    return this.$filters.asReadonly();
  }

  get pagination() {
    return this.$pagination.asReadonly();
  }

  get sorting() {
    return this.$sorting.asReadonly();
  }

  get error() {
    return this.$error.asReadonly();
  }

  get loading() {
    return this.$loading.asReadonly();
  }
  //#endregion

  //#region Actions

  //#region Settings

  setSettings(settings: DataStoreSettings | null): void {
    this.$settings.set(settings);
  }

  //#endregion

  //#region Indicators

  setLoading(loading: boolean): void {
    this.$loading.set(loading);
  }

  setError(error: string | null): void {
    this.$error.set(error);
  }

  clearError(): void {
    this.$error.set(null);
  }
  //#endregion

  //#region Actions - Data Manipulation

  setData(data: T[]): void {
    this.$data.set(data);
    this.$totalItems.set(data.length);
  }

  setTotalItems(total: number): void {
    this.$totalItems.set(total);
  }

  addDataItem(item: T): void {
    this.$data.update(currentData => [...currentData, item]);
  }

  updateDataItem(index: number, item: T): void {
    this.$data.update(currentData => {
      const updatedData = currentData.map((currentItem, i) =>
        i === index ? { ...currentItem, ...item } : currentItem
      );
      return updatedData;
    });
  }

  removeDataItem(index: number): void {
    this.$data.update(currentData => {
      const filteredData = currentData.filter((_, i) => i !== index);
      return filteredData;
    });
  }
  //#endregion

  // //#region Actions - Selection

  // setSelectedItem(item: T | null): void {
  //   this.$selectedItem.set(item);
  // }

  // setSelectedItems(items: T[]): void {
  //   this.$selectedItems.set(items);
  // }

  // addSelectedItem(item: T): void {
  //   const currentSelected = this.$selectedItems();
  //   if (!currentSelected.find(selected => selected.id === item.id)) {
  //     this.$selectedItems.update(() => [...currentSelected, item]);
  //   }
  // }

  // removeSelectedItem(id: string): void {
  //   const currentSelected = this.$selectedItems();
  //   const filteredSelected = currentSelected.filter(item => item.id !== id);
  //   this.$selectedItems.update(() => filteredSelected);
  // }

  // clearSelection(): void {
  //   this.setSelectedItems([]);
  // }
  // //#endregion

  //#region Actions - Filters

  setTextSearch(search: string): void {
    this.$filters.set({ ...this.$filters(), search });
  }

  clearTextSearch(): void {
    this.$filters.set({ ...this.$filters(), search: null });
  }

  setFilterForm(filter: object): void {
    this.$filters.set({ ...this.$filters(), filter });
  }

  clearFilterForm(): void {
    this.$filters.set({ ...this.$filters(), filter: null });
  }

  private textSearch(data: T, columns: ColumnDefinition[], search: string): boolean {
    const searchTerms = search.trim().toLowerCase();
    return columns.some(column => {
      const itemValue = data[column.name as keyof T];
      return `${itemValue}`.toLowerCase().includes(searchTerms);
    });
  }

  private formFilter(data: T, filter: object, columns: ColumnDefinition[]): boolean {
    return columns
      .filter(column => isNonEmpty(filter[column.name as keyof typeof filter]))
      .every(column => {
        const { name, filterLogic } = column;
        const filterValue = filter[name as keyof typeof filter] as any;
        const itemValue = data[name as keyof T];
        if (filterLogic) {
          return filterLogic(itemValue, filterValue, data as object);
        }
        return itemValue === filterValue || (Array.isArray(filterValue) && filterValue.includes(itemValue));
      });
  }

  private applyFilters(data: T[], filters: DataFilters, settings?: ColumnDefinition[] | null): T[] {
    if (!settings) {
      return data;
    }
    const { search, filter } = filters;
    const allowedColumns = settings.filter(col => col.filter !== false);
    let result = data;
    if (search !== null) {
      // Loops over the values in the array and returns true if any of them match the filter string
      result = result.filter(item => this.textSearch(item, allowedColumns, search));
    }
    if (filter !== null) {
      result = result.filter(item => this.formFilter(item, filter, allowedColumns));
    }
    return result;
  }
  //#endregion

  //#region Actions - Pagination

  setPagination(pagination: DataPagination): void {
    this.$pagination.set(pagination);
  }

  setPage(page: number): void {
    this.$pagination.set({ ...this.$pagination(), page });
  }
  //#endregion

  //#region Actions - Sorting

  setSorting(sorting: DataSorting | null): void {
    this.$sorting.set(sorting);
  }
  //#endregion
  //#endregion
}
