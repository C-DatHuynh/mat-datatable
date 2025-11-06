import { computed, Injectable, signal } from '@angular/core';
import { ColumnDefinition, TableOptions } from '../interfaces';
import { DataModel } from '../types';
import { isNonEmpty } from '../utils';

export interface DataFilters {
  search: string | null;
  filter: { [key: string]: any } | null;
}

export interface DataPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DataStoreSettings {
  columns: ColumnDefinition[];
  table: TableOptions;
}

@Injectable({
  providedIn: 'root',
})
export class DataStoreService<T extends DataModel> {
  $data = signal<T[]>([]);
  $selectedItem = signal<T | null>(null);
  $selectedItems = signal<T[]>([]);
  $filters = signal<DataFilters>({
    search: null,
    filter: null,
  });
  $pagination = signal<DataPagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  $loading = signal<boolean>(false);
  $error = signal<string | null>(null);

  private settings: DataStoreSettings | null = null;

  $filteredData = computed(() => {
    const data = this.$data();
    if (this.settings?.table.remote) {
      return data;
    }
    const filters = this.$filters();
    return this.applyFilters(data, filters, this.settings?.columns);
  });

  /*$paginatedData = computed(() => {
    const data = this.$filteredData();
    const pagination = this.$pagination();
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  });*/

  get filteredData() {
    return this.$filteredData;
  }

  /*get paginatedData() {
    return this.$paginatedData;
  }*/

  get data() {
    return this.$data.asReadonly();
  }
  setData(data: T[]): void {
    this.$data.set(data);
  }

  get selectedItem() {
    return this.$selectedItem.asReadonly();
  }
  setSelectedItem(item: T | null): void {
    this.$selectedItem.set(item);
  }

  get selectedItems() {
    return this.$selectedItems.asReadonly();
  }
  setSelectedItems(items: T[]): void {
    this.$selectedItems.set(items);
  }

  get filters() {
    return this.$filters.asReadonly();
  }
  setFilters(filters: Partial<DataFilters>): void {
    this.$filters.set({ ...this.$filters(), ...filters });
  }

  getSettings() {
    return this.settings;
  }
  setSettings(settings: DataStoreSettings | null): void {
    this.settings = settings;
  }

  get pagination() {
    return this.$pagination.asReadonly();
  }
  setPagination(pagination: DataPagination): void {
    this.$pagination.set(pagination);
  }

  get loading() {
    return this.$loading.asReadonly();
  }
  setLoading(loading: boolean): void {
    this.$loading.set(loading);
  }

  get error() {
    return this.$error.asReadonly();
  }
  setError(error: string | null): void {
    this.$error.set(error);
  }

  // Actions - Data Manipulation

  addDataItem(item: T): void {
    this.$data.update(currentData => [item, ...currentData]);
  }

  updateDataItem(id: string, updates: Partial<T>): void {
    this.$data.update(currentData => {
      const updatedData = currentData.map(item => (item.id === id ? { ...item, ...updates } : item));
      return updatedData;
    });
  }

  removeDataItem(id: string): void {
    this.$data.update(currentData => {
      const filteredData = currentData.filter(item => item.id !== id);
      return filteredData;
    });
  }

  // Actions - Selection

  addSelectedItem(item: T): void {
    const currentSelected = this.$selectedItems();
    if (!currentSelected.find(selected => selected.id === item.id)) {
      this.$selectedItems.update(() => [...currentSelected, item]);
    }
  }

  removeSelectedItem(id: string): void {
    const currentSelected = this.$selectedItems();
    const filteredSelected = currentSelected.filter(item => item.id !== id);
    this.$selectedItems.update(() => filteredSelected);
  }

  clearSelection(): void {
    this.setSelectedItems([]);
  }

  // Actions - Filters

  clearFilters(): void {
    this.$filters.set({ search: null, filter: null });
    this.$pagination.set({ ...this.$pagination(), page: 1 });
  }

  // Actions - Pagination

  setPage(page: number): void {
    this.$pagination.set({ ...this.$pagination(), page });
  }

  setPageSize(limit: number): void {
    this.$pagination.set({
      ...this.$pagination(),
      pageSize: limit,
      page: 1,
      totalPages: Math.ceil(this.$pagination().total / limit),
    });
  }

  // Actions - Error Handling

  clearError(): void {
    this.$error.set(null);
  }

  // Utility methods
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
        const { name, filterOptions } = column;
        const filterValue = filter[name as keyof typeof filter] as any;
        const itemValue = data[name as keyof T];
        if (filterOptions?.logic) {
          return filterOptions.logic(itemValue, filterValue, data);
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
      const filterValue = search.trim().toLowerCase();
      // Loops over the values in the array and returns true if any of them match the filter string
      result = result.filter(item => this.textSearch(item, allowedColumns, filterValue));
    }
    if (filter !== null) {
      result = result.filter(item => this.formFilter(item, filter, allowedColumns));
    }
    return result;
  }
}
