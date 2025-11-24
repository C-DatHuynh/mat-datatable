export type ButtonColor = 'primary' | 'accent' | 'warn' | undefined;

export interface Action {
  label?: string;
  icon?: string;
  color?: ButtonColor;
  onClick: () => void;
  disabled?: () => boolean;
}

export interface RowAction {
  label?: string;
  icon?: string;
  color?: ButtonColor;
  onClick: (data: object, rowIndex: number) => void;
  disabled?: (data: object, rowIndex: number) => boolean;
}
