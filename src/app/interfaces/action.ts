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
