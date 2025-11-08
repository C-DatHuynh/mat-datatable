// mui-datatable.component.stories.ts
import { Injectable } from '@angular/core';
import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { delay, Observable, of } from 'rxjs';
import { ColumnDefinition, TableOptions } from '../interfaces';
import { DataTableComponent } from '../mui-datatable';
import { ApiService, provideApiService } from '../services';
import { DataFilters, DataPagination, DataSorting } from '../services/datastore.service';
import { ELEMENT_DATA, PeriodicElement } from '../stories/fixture';

const meta: Meta<DataTableComponent<PeriodicElement>> = {
  title: 'Components/MUI Datatable',
  component: DataTableComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

export default meta;
type Story = StoryObj<DataTableComponent<PeriodicElement>>;

const selectOptions = ELEMENT_DATA.map(item => ({ key: item.symbol, value: item.symbol }));

const tableOptions: TableOptions = {
  jumpToPage: true,
};

const columns: ColumnDefinition[] = [
  { name: 'name', label: 'Name', display: true, filter: true, sort: true },
  { name: 'position', label: 'Position', display: true, filter: true, sort: true },
  { name: 'weight', label: 'Weight', display: true, filter: true, sort: true },
  {
    name: 'symbol',
    label: 'Symbol',
    display: true,
    filter: true,
    sort: false,
    filterOptions: {},
  },
  { name: 'description', label: 'Description', display: false, filter: false, sort: false },
];

export const ExternalData: Story = {
  args: {
    title: 'Basic Material Datatable with External Data',
    data: ELEMENT_DATA,
    options: tableOptions,
    columns: columns,
  },
  decorators: [
    applicationConfig({
      providers: [provideApiService({ useExternalData: true })],
    }),
  ],
};

// prettier-ignore
@Injectable()
class PeriodicElementService extends ApiService<PeriodicElement> {
  protected override baseUrl = 'https://example.com/api/elements';
  override list(): Observable<PeriodicElement[]> {
    console.log('API Service list called');
    return of(ELEMENT_DATA).pipe(delay(1000));
  }
  override remove(id: string | number): Observable<void> {
    console.log(`API Service remove called for id: ${id}`);
    return of(undefined).pipe(delay(500));
  }
}

export const WithCustomApiService: Story = {
  args: {
    title: 'Material Datatable with Derived ApiService',
    options: tableOptions,
    columns: columns,
  },
  decorators: [
    applicationConfig({
      providers: [provideApiService({ useClass: PeriodicElementService })],
    }),
  ],
};

@Injectable()
class RemotePeriodicElementService extends ApiService<PeriodicElement> {
  protected override baseUrl = 'https://example.com/api/elements';
  override listRemote(
    pagination: DataPagination | null,
    filters: DataFilters | null,
    sorting: DataSorting | null
  ): Observable<{ data: PeriodicElement[]; total: number }> {
    console.log('API Service listRemote called with:', { pagination, filters, sorting });
    const startIndex = pagination?.page ? pagination.page * (pagination.pageSize || 5) : 0;
    const endIndex = startIndex + (pagination?.pageSize || 5);
    return of({ data: ELEMENT_DATA.slice(startIndex, endIndex), total: ELEMENT_DATA.length }).pipe(delay(1000));
  }
}

export const WithRemotePaginationAndSorting: Story = {
  args: {
    title: 'Material Datatable with Remote Pagination and Sorting',
    options: { ...tableOptions, remote: true },
    columns: columns,
  },
  decorators: [
    applicationConfig({
      providers: [provideApiService({ useClass: RemotePeriodicElementService })],
    }),
  ],
};
