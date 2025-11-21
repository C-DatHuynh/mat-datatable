import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExtendedComponentSchema, FormioForm } from '@formio/angular';
import { FormRendererComponent, FormSubmissionData } from '../formio';
import { PrimitiveType } from '../types';
import { BaseDialogComponent, DialogAction, DialogOptions } from './base-dialog.component';

export type FormValueType = Record<string, PrimitiveType | PrimitiveType[] | File | File[]>;

export interface FormDialogData {
  title: string;
  formValue: Record<string, any>;
  formComponents: ExtendedComponentSchema[];
  columns: number;
  actions: DialogAction[];
  showCloseButton?: boolean;
}

@Component({
  selector: 'app-form-dialog',
  template: `
    <app-base-dialog [options]="dialogOptions" (actionDone)="onAction($event)">
      <app-form-renderer
        #dialogForm
        [form]="formOptions"
        [submission]="formValue"
        (formSubmit)="onSubmit($event)"></app-form-renderer>
    </app-base-dialog>
  `,
  imports: [BaseDialogComponent, FormRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FormDialogComponent {
  formOptions!: FormioForm;
  dialogOptions!: DialogOptions;
  formValue!: { data: Record<string, any> };
  columns!: number;

  @ViewChild(FormRendererComponent) dialogForm!: FormRendererComponent;

  constructor(
    private dialogRef: MatDialogRef<FormDialogComponent, any>,
    @Inject(MAT_DIALOG_DATA) readonly data: FormDialogData
  ) {
    this.columns = this.data.columns;
    this.formOptions = { type: 'form', components: this.data.formComponents };
    this.formValue = { data: this.data.formValue || {} };
    this.dialogOptions = { title: this.data.title, actions: this.data.actions, showCloseButton: true };
  }

  onAction(value: DialogAction): void {
    const { type } = value;
    if (type === 'ok') {
      this.dialogForm.submit();
    } else {
      this.dialogRef.close({ action: value });
    }
  }

  onSubmit(data: FormSubmissionData): void {
    this.dialogRef.close({ action: { type: 'ok' }, data: data.data });
  }
}
