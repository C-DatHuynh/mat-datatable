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
  //selectableRowsHeader?: boolean; // Show checkbox in header
  //selectableRowsOnClick?: boolean; // Allow row selection on click
  canSearch?: boolean; // Enable search functionality
  searchPlaceholder?: string;
  canAdd?: boolean; // Show Add button
  canPrint?: boolean; // Show Print button
  canExport?: boolean; // Show Export button
  canEdit?: boolean; // Show Edit button
  canDelete?: boolean; // Show Delete button
  canFilter?: boolean; // Show Filter button
}
