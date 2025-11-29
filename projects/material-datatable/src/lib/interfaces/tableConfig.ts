import { Type } from '@angular/core';
import { ExtendedComponentSchema } from '@formio/angular';
import { Form } from '@formio/js';
import { Action, RowAction } from './action';

export interface TableOptions {
  remote?: boolean; // Enable remote data pagination and filtering
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  customActions?: Action[]; // Add, Print, Export, Redirect
  customRowActions?: RowAction[]; // Edit, Delete
  jumpToPage?: boolean;
  selectableRows?: 'none' | 'single' | 'multiple';
  expandableRows?: boolean; // Allow row expansion
  expandableRowComponent?: Type<any>; // Custom component to render in expanded row
  expandableRowComponentInputs?: Record<string, any>; // Additional inputs for the custom component
  //selectableRowsHeader?: boolean; // Show checkbox in header
  //selectableRowsOnClick?: boolean; // Allow row selection on click
  filterForm?: ExtendedComponentSchema[];
  editForm?: ExtendedComponentSchema[];
  addFormDefaultValues?: object;
  filterFormDefaultValues?: object;
  canSearch?: boolean; // Enable search functionality
  searchPlaceholder?: string;
  canAdd?: boolean; // Show Add button
  canPrint?: boolean; // Show Print button
  canExport?: boolean; // Show Export button
  canEdit?: boolean; // Show Edit button
  canDelete?: boolean; // Show Delete button
  canFilter?: boolean; // Show Filter button
  reorder?: boolean; // Enable drag & drop row reordering
  formioOptions?: Form['options']; // Global Form.io options
}
