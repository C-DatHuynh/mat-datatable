// mui-datatable.component.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { DataTableComponent } from '../mui-datatable';
import { ELEMENT_DATA, PeriodicElement } from './fixture';

const meta: Meta<DataTableComponent<PeriodicElement>> = {
  title: 'Basic MUI Datatable',
  component: DataTableComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DataTableComponent<PeriodicElement>>;

const selectOptions = ELEMENT_DATA.map(item => ({ key: item.symbol, value: item.symbol }));

export const Default: Story = {
  args: {
    title: 'Example Basic Material Datatable',
    data: ELEMENT_DATA,
    options: {
      jumpToPage: true,
    },
    columns: [
      { name: 'name', label: 'Name', options: { display: true, filter: true, sort: true } },
      { name: 'position', label: 'Position', options: { display: true, filter: true, sort: true } },
      { name: 'weight', label: 'Weight', options: { display: true, filter: true, sort: true } },
      {
        name: 'symbol',
        label: 'Symbol',
        options: { display: true, filter: true, sort: false, filterOptions: { controlType: 'dropdown', selectOptions } },
      },
      { name: 'description', label: 'Description', options: { display: false, filter: false, sort: false } },
    ],
  },
};
