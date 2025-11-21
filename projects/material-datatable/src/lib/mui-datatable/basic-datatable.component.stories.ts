// basic-datatable.component.stories.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { type Meta, type StoryObj } from '@storybook/angular';
import { ColumnDefinition, TableOptions } from '../interfaces';
import {
  ELEMENT_DATA,
  INVALID_FILTER_FORM_MISSING_WEIGHT,
  PeriodicElement,
  VALID_EDIT_FORM,
  VALID_FILTER_FORM,
} from '../stories/fixture';
import { BasicDataTableComponent } from './basic-datatable.component';

// Simple inline component for demonstration
@Component({
  selector: 'app-simple-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card style="margin: 8px;">
      <mat-card-header>
        <mat-card-title>{{ data.name }} ({{ data.symbol }})</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p><strong>Position:</strong> {{ data.position }}</p>
        <p><strong>Weight:</strong> {{ data.weight }}</p>
        <p>{{ data.description }}</p>
      </mat-card-content>
    </mat-card>
  `,
})
class SimpleDetailComponent {
  @Input() data!: PeriodicElement;
}

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
  },
  { name: 'description', label: 'Description', display: false, filter: false, sort: false, editable: true },
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

export const WithCustomExpandableComponent: Story = {
  args: {
    title: 'Datatable with Custom Expandable Component',
    data: ELEMENT_DATA.slice(0, 5),
    options: {
      ...tableOptions,
      expandableRows: true,
      expandableRowComponent: SimpleDetailComponent,
    },
    columns: columns,
    onAddItem: (item: PeriodicElement) => alert(`Add item: ${JSON.stringify(item)}`),
    onUpdateItem: (item: PeriodicElement) => alert(`Update item: ${JSON.stringify(item)}`),
    onDeleteItem: (item: PeriodicElement) => alert(`Delete item with id: ${item.id}`),
    onFilterChange: (filter: any) => alert(`Filter changed: ${JSON.stringify(filter)}`),
  },
};

export const ValidFormsInput: Story = {
  args: {
    title: 'Valid Custom Forms Configuration',
    data: ELEMENT_DATA.slice(0, 5),
    options: {
      ...tableOptions,
      canFilter: true,
      canEdit: true,
      canAdd: true,
      filterForm: VALID_FILTER_FORM,
      editForm: VALID_EDIT_FORM,
    },
    columns: columns,
    onAddItem: (item: PeriodicElement) => console.log('Add:', item),
    onUpdateItem: (item: PeriodicElement) => console.log('Update:', item),
    onDeleteItem: (item: PeriodicElement) => console.log('Delete:', item.id),
    onFilterChange: (filter: any) => console.log('Filter:', filter),
  },
};

export const InvalidFilterFormMissingColumn: Story = {
  args: {
    title: 'Invalid Filter Form - Missing Column',
    data: ELEMENT_DATA.slice(0, 5),
    options: {
      ...tableOptions,
      canFilter: true,
      filterForm: INVALID_FILTER_FORM_MISSING_WEIGHT,
    },
    columns: columns,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates an invalid configuration where the filterForm is missing the "weight" column. The component will display an error message instead of rendering the table.',
      },
    },
  },
};
