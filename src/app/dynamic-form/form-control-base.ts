import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormControlType, PrimitiveType, SelectOptionType } from '../types';

type InputType = 'text' | 'tel' | 'email' | 'password' | 'url';

export interface DynamicFormControlOptions {
  value?: PrimitiveType | PrimitiveType[];
  key: string;
  label?: string;
  order?: number;
  fullWidth?: boolean;
  editable?: boolean;
}

export interface TextboxControlOptions extends DynamicFormControlOptions {
  type?: InputType;
  validators?: ValidatorFn | ValidatorFn[] | ((value: PrimitiveType, row: object) => boolean);
}

export interface SelectControlOptions extends DynamicFormControlOptions {
  value?: PrimitiveType;
  validators?: ValidatorFn | ValidatorFn[] | ((value: PrimitiveType, row: object) => boolean);
  selectOptions?: SelectOptionType[] | Observable<SelectOptionType[]>;
}

export interface MultiSelectControlOptions extends DynamicFormControlOptions {
  value?: PrimitiveType[];
  validators?: ValidatorFn | ValidatorFn[] | ((value: PrimitiveType, row: object) => boolean);
  selectOptions?: SelectOptionType[] | Observable<SelectOptionType[]>;
}

export interface CheckboxControlOptions extends DynamicFormControlOptions {
  value?: boolean;
}

export interface SliderControlOptions extends DynamicFormControlOptions {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
}

export class FormControlBase {
  value?: PrimitiveType | PrimitiveType[];
  key = '';
  label? = '';
  order? = -1;
  type?: InputType = 'text';
  controlType?: FormControlType = 'textbox';
  selectOptions?: SelectOptionType[] | Observable<SelectOptionType[]> = [];
  fullWidth?: boolean = false;
  validators?: ValidatorFn | ValidatorFn[] = [];
  editable?: boolean = true;

  constructor(options: DynamicFormControlOptions) {
    Object.assign(this, options);
  }
}

export class TextboxFormControl extends FormControlBase {
  override controlType: FormControlType = 'textbox';
  constructor(options: TextboxControlOptions) {
    super(options);
  }
}

export class SelectFormControl extends FormControlBase {
  override controlType: FormControlType = 'dropdown';
  constructor(options: SelectControlOptions) {
    super(options);
  }
}

export class CheckboxFormControl extends FormControlBase {
  override controlType: FormControlType = 'checkbox';
  constructor(options: CheckboxControlOptions) {
    super(options);
  }
}

export class MultiSelectFormControl extends FormControlBase {
  override value?: PrimitiveType[] = [];
  override controlType: FormControlType = 'multiselect';
  constructor(options: MultiSelectControlOptions) {
    super(options);
  }
}

export class SliderFormControl extends FormControlBase {
  override value?: number = 0;
  override controlType: FormControlType = 'slider';
  min?: number = 0;
  max?: number = 100;
  step?: number = 10;
  constructor(options: SliderControlOptions) {
    super(options);
  }
}

export function mapControlType(config: DynamicFormControlOptions, type: FormControlType | undefined) {
  switch (type) {
    case 'dropdown':
      return new SelectFormControl(config as SelectControlOptions);
    case 'multiselect':
      return new MultiSelectFormControl(config as MultiSelectControlOptions);
    case 'checkbox':
      return new CheckboxFormControl(config as CheckboxControlOptions);
    case 'slider':
      return new SliderFormControl(config as SliderControlOptions);
    case 'textbox':
    default:
      return new TextboxFormControl(config as TextboxControlOptions);
  }
}
