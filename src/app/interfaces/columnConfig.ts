export type FormControlType = 'textbox' | 'dropdown' | 'multiselect' | 'checkbox' | 'richtextbox' | 'slider' | 'richtextbox' | 'upload';
export type FilterLogic = (itemValue: any, filterValue: any | any[], row: object) => boolean; // Custom logic for filtering

export interface ColumnDefinition {
  name: string;
  label?: string;
  display?: boolean;
  filter?: boolean;
  filterOptions?: {
    controlType?: FormControlType;
    validators?: any; //| ((value: PrimitiveType, row: object) => boolean);
    logic?: FilterLogic; // Custom logic for filtering
    selectOptions?: { key: string; value: any }[]; // For dropdowns and multiselects
  };
  editable?: boolean;
  editOptions?: {
    controlType?: FormControlType;
    validators?: any; //| ((value: PrimitiveType, row: object) => boolean);
  };
  sort?: boolean;
}
