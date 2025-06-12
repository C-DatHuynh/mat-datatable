import { Directive } from '@angular/core';
import { Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DynamicFormComponent } from '../dynamic-form';
import { DynamicFormControlOptions } from '../dynamic-form/form-control-base';
import { PrimitiveType } from '../types';

export type FormValueType = Record<string, PrimitiveType | PrimitiveType[]>;

export interface FormDialogData {
  title: string;
  formValue: FormValueType;
  columnConfig: Record<string, DynamicFormControlOptions>;
}

@Directive()
export class FormDialogComponent {
  readonly formId: string = 'formDialog';
  readonly formOptions!: Record<string, DynamicFormControlOptions>;
  readonly formValue!: FormValueType;
  readonly title!: string;
  constructor(
    protected readonly dialogRef: MatDialogRef<FormDialogData, FormValueType>,
    @Inject(MAT_DIALOG_DATA) protected readonly data: FormDialogData
  ) {
    this.formOptions = data.columnConfig;
    this.formValue = data.formValue || {};
    this.title = data.title;
  }

  onSubmit(data: FormValueType) {
    this.dialogRef.close(data);
  }
}

export const FORM_DIALOG_IMPORTS = [MatDialogModule, MatButtonModule, MatIconModule, DynamicFormComponent];
