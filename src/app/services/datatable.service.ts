import { Injectable } from '@angular/core';
import { ColumnDefinition } from '../interfaces';
import { DataModel } from '../types';

@Injectable()
export class DataTableService<TModel extends DataModel> {
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
