import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { ColumnDefinition } from '../interfaces';
import { DataModel } from '../types';
import { findAllValuesByKey } from '../utils';
import { API_SERVICE_TOKEN, ApiService } from './api.service';
import { DataFilters, DataPagination, DataSorting, DataStoreService } from './datastore.service';

const defaultFormInput = {
  type: 'textfield',
  input: true,
};

export abstract class DataTableService<TModel extends DataModel> {
  constructor(protected readonly dataStoreService: DataStoreService<TModel>) {}

  createDefaultFormInput(columns: ColumnDefinition[]): Record<string, any>[] {
    return columns.map(col => {
      return {
        ...defaultFormInput,
        key: col.name,
        label: col.label || col.name,
      };
    });
  }

  validateFormInput(columns: ColumnDefinition[], formInput: Record<string, any>[]) {
    const requiredColumns = columns.map(col => col.name);
    const keys = findAllValuesByKey(formInput, 'key');
    const missingColumns = requiredColumns.filter(colName => !keys.includes(colName));
    if (missingColumns.length > 0) {
      throw new Error(`Missing definitions for the following columns: ${missingColumns.join(', ')}`);
    }
  }

  private generateCsvContent(columnConfig: ColumnDefinition[], data: TModel[]): string {
    const header = columnConfig.map(col => col.label || col.name).join(',') + '\n';
    const rows = data
      .map(row => {
        return columnConfig
          .map(col => {
            const value = row[col.name as keyof TModel];
            return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(',');
      })
      .join('\n');
    return header + rows;
  }

  exportToCsv(filename: string, columnConfig: ColumnDefinition[], data: TModel[]) {
    const csvContent = this.generateCsvContent(columnConfig, data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printTable(htmlTableId: string): void {
    const tableElement = document.getElementById(htmlTableId);

    if (!tableElement) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
      return;
    }

    const styles = `
      <style>
        table { width: 100%; border-collapse: collapse; }
        table, th, td { border: 1px solid black; padding: 8px; }
        th { background-color: #f0f0f0; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .mat-sort-header-arrow { display: none; }
        .mat-toolbar { display: none; }
        .mat-column-rowActions { display: none; }
        .paginator-container { display: none; }
        .mat-column-expand { display: none; }
      </style>
    `;

    printWindow.document.writeln(`
      <html>
        <head>
          <title>Print Table</title>
          ${styles}
        </head>
        <body>
          ${tableElement.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function () { window.close(); }
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }
  abstract updateItem(item: TModel): void;
  abstract addItem(item: TModel): void;
  abstract deleteItem(id: string | number): void;
}

@Injectable()
export class BasicDataTableService<TModel extends DataModel> extends DataTableService<TModel> {
  constructor(dataStoreService: DataStoreService<TModel>) {
    super(dataStoreService);
  }

  updateItem(item: TModel): void {
    this.dataStoreService.updateDataItem(item.id, item);
  }

  addItem(item: TModel): void {
    // Generate a temporary ID for new items if they don't have one
    this.dataStoreService.addDataItem('', item);
  }

  deleteItem(id: string | number): void {
    this.dataStoreService.removeDataItem(id);
  }
}

@Injectable()
export class RemoteDataTableService<TModel extends DataModel> extends BasicDataTableService<TModel> {
  apiResult = new BehaviorSubject<boolean | Error>(true);

  constructor(
    dataStoreService: DataStoreService<TModel>,
    @Inject(API_SERVICE_TOKEN) private readonly apiService: ApiService<TModel>
  ) {
    super(dataStoreService);
  }

  callApi<T>(apiCall: Observable<T>, emitResult: boolean = false): Observable<T> {
    this.dataStoreService.setLoading(true);
    this.dataStoreService.clearError();

    return apiCall.pipe(
      tap(() => {
        if (emitResult) {
          this.apiResult.next(true);
        }
      }),
      catchError(error => {
        if (emitResult) {
          this.apiResult.next(error);
        }
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

  populateAllItems(): void {
    this.callApi(this.apiService.list(), false).subscribe((resources: TModel[]) =>
      this.dataStoreService.setData(resources)
    );
  }

  populateItems(pagination: DataPagination | null, filter: DataFilters | null, sorting: DataSorting | null): void {
    this.callApi(this.apiService.listRemote(pagination, filter, sorting), false).subscribe(
      (result: { data: TModel[]; total: number }) => {
        this.dataStoreService.setData(result.data);
        this.dataStoreService.setTotalItems(result.total);
      }
    );
  }

  override addItem(item: TModel): void {
    this.callApi(this.apiService.add(item), true).subscribe((createdItem: TModel) => {
      this.dataStoreService.addDataItem(createdItem.id, createdItem);
    });
  }

  override deleteItem(id: string | number): void {
    this.callApi(this.apiService.remove(id), true).subscribe(() => {
      this.dataStoreService.removeDataItem(id);
    });
  }

  override updateItem(item: TModel): void {
    // Remove id from the update payload as required by the API
    const { id, ...updatePayload } = item;
    this.callApi(
      this.apiService.update(item.id, updatePayload as Exclude<TModel, { id: string | number }>),
      true
    ).subscribe(updatedItem => {
      this.dataStoreService.updateDataItem(updatedItem.id, updatedItem);
    });
  }
}
