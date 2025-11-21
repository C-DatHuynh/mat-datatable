export type FormControlType =
  | 'textbox'
  | 'dropdown'
  | 'multiselect'
  | 'checkbox'
  | 'richtextbox'
  | 'slider'
  | 'richtextbox'
  | 'upload';
export type FilterLogic = (itemValue: any, filterValue: any | any[], row: object) => boolean; // Custom logic for filtering

export interface ColumnDefinition {
  name: string;
  label?: string;
  display?: boolean;
  filter?: boolean;
  filterLogic?: FilterLogic;
  filterOptions?: {
    logic?: FilterLogic; // Custom logic for filtering
    formioOptions?: object;
  };
  editable?: boolean;
  editOptions?: {
    formioOptions?: object;
  };
  sort?: boolean;
}
