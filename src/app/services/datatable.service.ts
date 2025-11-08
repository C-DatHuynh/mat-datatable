import { Inject, Injectable } from '@angular/core';
import { catchError, finalize, Observable, throwError } from 'rxjs';
import { DialogAction } from '../dialog';
import { ColumnDefinition } from '../interfaces';
import { DataModel } from '../types';
import { API_SERVICE_TOKEN, ApiService } from './api.service';
import { DataFilters, DataPagination, DataSorting, DataStoreService } from './datastore.service';

const defaultControlOption: object = {
  type: 'textfield',
};

@Injectable()
export class DataTableService<TModel extends DataModel> {
  constructor(
    private readonly dataStoreService: DataStoreService<TModel>,
    @Inject(API_SERVICE_TOKEN) private readonly apiService: ApiService<TModel>
  ) {}

  buildFormComponents(type: 'filter' | 'edit') {
    const settings = this.dataStoreService.$settings();
    const columns = settings?.columns || [];
    const filteredColumns = type === 'filter' ? columns.filter(column => column.filter !== false) : columns;

    return filteredColumns.map(col => ({
      key: col.name,
      label: col.label || col.name,
      ...(type === 'filter'
        ? col.filterOptions?.formioOptions || defaultControlOption
        : col.editOptions?.formioOptions || defaultControlOption),
    }));
  }

  handleAddEditResult(result: any, isEdit: boolean): void {
    console.log('Add/Edit form result:', result);

    if (isEdit && result.id) {
      this.updateItem(result);
    } else if (!isEdit) {
      this.addItem(result);
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

  populateItems(pagination: DataPagination | null, filter: DataFilters | null, sorting: DataSorting | null): void {
    this.callApi(this.apiService.listRemote(pagination, filter, sorting)).subscribe(
      (result: { data: TModel[]; total: number }) => {
        this.dataStoreService.setData(result.data);
        this.dataStoreService.setTotalItems(result.total);
      }
    );
  }

  populateAllItems(): void {
    this.callApi(this.apiService.list()).subscribe((resources: TModel[]) => this.dataStoreService.setData(resources));
  }

  updateItem(item: TModel, hasInputData: boolean = true): void {
    if (hasInputData) {
      this.dataStoreService.updateDataItem(item.id, item);
    } else {
      // Remove id from the update payload as required by the API
      const { id, ...updatePayload } = item;
      this.callApi(
        this.apiService.update(item.id, updatePayload as Exclude<TModel, { id: string | number }>)
      ).subscribe(updatedItem => {
        this.dataStoreService.updateDataItem(updatedItem.id, updatedItem);
      });
    }
  }

  addItem(item: TModel, hasInputData: boolean = true): void {
    console.log('Adding item:', item, hasInputData);
    if (hasInputData) {
      this.dataStoreService.addDataItem(item);
    } else {
      this.callApi(this.apiService.add(item)).subscribe((createdItem: TModel) => {
        this.dataStoreService.addDataItem(createdItem.id, createdItem);
      });
    }
  }

  deleteItem(id: string | number, hasInputData: boolean = true): void {
    if (hasInputData) {
      this.dataStoreService.removeDataItem(id);
    } else {
      this.callApi(this.apiService.remove(id)).subscribe(() => {
        this.dataStoreService.removeDataItem(id);
      });
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
}
