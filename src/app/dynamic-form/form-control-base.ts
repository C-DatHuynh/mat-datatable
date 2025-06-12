import { ValidatorFn } from '@angular/forms';
import { QuillConfig } from 'ngx-quill';
import { Observable } from 'rxjs';
import { FormControlType, SelectOptionType } from '../types';

type InputType = 'text' | 'tel' | 'email' | 'password' | 'url';

export interface DynamicFormControlOptionBase {
  label?: string;
  order?: number;
  fullWidth?: boolean;
  editable?: boolean;
  controlType?: FormControlType;
  validators?: ValidatorFn | ValidatorFn[]; //| ((value: PrimitiveType, row: object) => boolean);
}

export interface TextboxControlOptions extends DynamicFormControlOptionBase {
  type: InputType;
  controlType: 'textbox';
}

export interface RichTextboxControlOptions extends DynamicFormControlOptionBase, QuillConfig {
  controlType: 'richtextbox';
}

export interface SelectControlOptions extends DynamicFormControlOptionBase {
  selectOptions: SelectOptionType[] | Observable<SelectOptionType[]>;
  controlType: 'dropdown';
}

export interface MultiSelectControlOptions extends DynamicFormControlOptionBase {
  selectOptions: SelectOptionType[] | Observable<SelectOptionType[]>;
  controlType: 'multiselect';
}

export interface CheckboxControlOptions extends DynamicFormControlOptionBase {
  value?: boolean;
  controlType: 'checkbox';
}

export interface SliderControlOptions extends DynamicFormControlOptionBase {
  value?: number;
  min: number;
  max: number;
  step: number;
  controlType: 'slider';
}

export type DynamicFormControlOptions =
  | TextboxControlOptions
  | RichTextboxControlOptions
  | SelectControlOptions
  | MultiSelectControlOptions
  | CheckboxControlOptions
  | SliderControlOptions;
