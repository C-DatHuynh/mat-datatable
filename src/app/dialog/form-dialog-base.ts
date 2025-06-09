import { Directive } from '@angular/core';
import { Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DynamicFormComponent } from '../dynamic-form';
import { FormControlBase } from '../dynamic-form/form-control-base';
import { ColumnDefinition, PrimitiveType } from '../types';

export type FormValueType = Record<string, PrimitiveType | PrimitiveType[]>;

export interface FormDialogData {
  title: string;
  formValues: FormValueType;
  columnConfig: ColumnDefinition[];
}

@Directive()
export abstract class FormDialogComponent {
  readonly formId: string = 'formDialog';
  readonly formControls: FormControlBase[] = [];
  readonly title: string = '';
  constructor(
    protected readonly dialogRef: MatDialogRef<FormDialogData, FormValueType>,
    @Inject(MAT_DIALOG_DATA) protected readonly data: FormDialogData
  ) {
    this.formControls = this.toFormControls(data);
    this.title = data.title;
  }

  abstract toFormControls(data: FormDialogData): FormControlBase[];

  onSubmit(data: FormValueType) {
    this.dialogRef.close(data);
  }
}

export const FORM_DIALOG_IMPORTS = [MatDialogModule, MatButtonModule, MatIconModule, DynamicFormComponent];
