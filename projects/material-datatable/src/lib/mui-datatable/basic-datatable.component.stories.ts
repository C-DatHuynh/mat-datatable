// basic-datatable.component.stories.ts
import { type Meta, type StoryObj } from '@storybook/angular';
import { ColumnDefinition, TableOptions } from '../interfaces';
import { ELEMENT_DATA, PeriodicElement } from '../stories/fixture';
import { BasicDataTableComponent } from './basic-datatable.component';

const meta: Meta<BasicDataTableComponent<PeriodicElement>> = {
  title: 'Components/Basic MUI Datatable',
  component: BasicDataTableComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      codePanel: true,
    },
  },
};

export default meta;
type Story = StoryObj<BasicDataTableComponent<PeriodicElement>>;

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
    onAddItem: (item: PeriodicElement) => alert(`Add item: ${JSON.stringify(item)}`),
    onUpdateItem: (item: PeriodicElement) => alert(`Update item: ${JSON.stringify(item)}`),
    onDeleteItem: (item: PeriodicElement) => alert(`Delete item with id: ${item.id}`),
    onFilterChange: (filter: any) => alert(`Filter changed: ${JSON.stringify(filter)}`),
  },
};

export const WithReordering: Story = {
  args: {
    title: 'Datatable with Row Reordering',
    data: ELEMENT_DATA,
    options: {
      ...tableOptions,
      reorder: true,
    },
    columns: columns,
    onAddItem: (item: PeriodicElement) => alert(`Add item: ${JSON.stringify(item)}`),
    onUpdateItem: (item: PeriodicElement) => alert(`Update item: ${JSON.stringify(item)}`),
    onDeleteItem: (item: PeriodicElement) => alert(`Delete item with id: ${item.id}`),
    onFilterChange: (filter: any) => alert(`Filter changed: ${JSON.stringify(filter)}`),
  },
};
