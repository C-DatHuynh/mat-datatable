import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { DynamicFormControlOptions } from './dynamic-form';

export interface ColumnDefinition {
  name: string;
  label?: string;
  options: ColumnOptions;
}

export type PrimitiveType = string | number | boolean | null | undefined;
export interface SelectOptionType {
  key: string;
  value: Exclude<PrimitiveType, null | undefined>;
}
export type FormControlType = 'textbox' | 'dropdown' | 'multiselect' | 'checkbox' | 'richtextbox' | 'slider';

type FilterLogic = (itemValue: PrimitiveType, filterValue: PrimitiveType | PrimitiveType[], row: object) => boolean; // Custom logic for filtering

export interface ColumnSubOptions {
  order?: number; // Order of the filter in the UI
  fullWidth?: boolean; // Full width for dropdown or multiselect
  selectOptions?: SelectOptionType[] | Observable<SelectOptionType[]>;
  controlType?: FormControlType;
}

export interface ColumnOptions {
  display?: boolean;
  editable?: boolean;
  filter?: boolean;
  filterOptions?: DynamicFormControlOptions & { logic?: FilterLogic }; // Custom logic for filtering
  editOptions?: DynamicFormControlOptions;
  sort?: boolean;
  validators?: ValidatorFn | ValidatorFn[]; //| ((value: PrimitiveType, row: object) => boolean);
}

export interface Action {
  label?: string;
  icon?: string;
  color?: string;
  onClick: () => void;
  disabled?: () => boolean;
}

export interface RowAction {
  label?: string;
  icon?: string;
  onClick: (data: object, rowIndex: number) => void;
  disabled?: (data: object, rowIndex: number) => boolean;
}

export interface TableOptions {
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  customActions?: Action[]; // Add, Print, Export, Redirect
  customRowActions?: RowAction[]; // Edit, Delete
  jumpToPage?: boolean;
  selectableRows?: 'none' | 'single' | 'multiple';
  expandableRows?: boolean; // Allow row expansion
  //selectableRowsHeader?: boolean; // Show checkbox in header
  //selectableRowsOnClick?: boolean; // Allow row selection on click
  search?: boolean; // Enable search functionality
  searchPlaceholder?: string;
  textLabels?: TextLabels; // Localization
  canAdd?: boolean; // Show Add button
  canPrint?: boolean; // Show Print button
  canExport?: boolean; // Show Export button
  canEdit?: boolean; // Show Edit button
  canDelete?: boolean; // Show Delete button
  canFilter?: boolean; // Show Filter button
}

export interface TextLabels {
  body?: {
    nomatch?: string;
    toolTip?: string;
  };
  pagination?: {
    next?: string;
    previous?: string;
    rowsPerPage?: string;
    displayRows?: string;
    jumpToPage?: string;
  };
  toolbar?: {
    search?: string;
    downloadCsv?: string;
    print?: string;
    viewColumns?: string;
    filterTable?: string;
  };
  filter?: {
    all?: string;
    title?: string;
    reset?: string;
  };
  viewColumns?: {
    title?: string;
    titleAria?: string;
  };
  selectedRows?: {
    text?: string;
    delete?: string;
    deleteAria?: string;
  };
}

export interface DataModel {
  id: number;
  name: string;
}

export interface FilterPayload {
  textSearch?: string;
  formSearch?: Record<string, PrimitiveType | PrimitiveType[]>;
}
