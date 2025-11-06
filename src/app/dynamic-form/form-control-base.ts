import { ValidatorFn } from '@angular/forms';
import { QuillConfig } from 'ngx-quill';
import { Observable } from 'rxjs';
import { FormControlType } from '../interfaces';
import { SelectOptionType } from '../types';

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
  controlType: 'checkbox';
}

export interface SliderControlOptions extends DynamicFormControlOptionBase {
  min: number;
  max: number;
  step: number;
  controlType: 'slider';
}

export interface UploadControlOptions extends DynamicFormControlOptionBase {
  accept?: string; // Accepted file types
  controlType: 'upload';
}

export type DynamicFormControlOptions =
  | TextboxControlOptions
  | RichTextboxControlOptions
  | SelectControlOptions
  | MultiSelectControlOptions
  | CheckboxControlOptions
  | SliderControlOptions
  | UploadControlOptions;
