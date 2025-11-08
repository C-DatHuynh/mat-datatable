import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormRendererComponent } from '../formio';
import { PrimitiveType } from '../types';
import { splitArrayIntoChunks } from '../utils';
import { BaseDialogComponent, DialogAction, DialogOptions } from './base-dialog.component';

export type FormValueType = Record<string, PrimitiveType | PrimitiveType[] | File | File[]>;

export interface FormDialogData {
  title: string;
  formValue: any;
  formComponents: object[];
  columns: number;
  actions: DialogAction[];
  showCloseButton?: boolean;
}

@Component({
  selector: 'app-form-dialog',
  template: `
    <app-base-dialog [options]="dialogOptions" (actionDone)="onAction($event)">
      <app-form-renderer #dialogForm [form]="formOptions" [submission]="formValue" (formSubmit)="onSubmit($event)"></app-form-renderer>
    </app-base-dialog>
  `,
  imports: [BaseDialogComponent, FormRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class FormDialogComponent {
  formOptions!: any;
  dialogOptions!: DialogOptions;
  formValue!: any;
  columns!: number;

  @ViewChild(FormRendererComponent) dialogForm!: FormRendererComponent;

  constructor(
    private dialogRef: MatDialogRef<FormDialogComponent, any>,
    @Inject(MAT_DIALOG_DATA) readonly data: FormDialogData
  ) {
    this.columns = this.data.columns;
    this.formOptions = { type: 'form', components: this.setLayout(this.data.formComponents, this.columns) };
    this.formValue = { data: this.data.formValue };
    this.dialogOptions = { title: this.data.title, actions: this.data.actions, showCloseButton: true };
  }

  onAction(value: DialogAction): void {
    const { type } = value;
    switch (type) {
      case 'ok':
        console.log('submitting form from dialog action');
        this.dialogForm.submit();
        return;
      case 'cancel':
        this.dialogRef.close();
        return;
      default:
        return;
    }
  }

  onSubmit(data: object) {
    console.log('FormDialogComponent - onSubmit data:', data);
    this.dialogRef.close(data);
  }

  setLayout(components: object[], columns: number = 2) {
    const chunks = splitArrayIntoChunks(components, columns);
    return [
      {
        type: 'columns',
        columns: chunks.map(chunk => ({ width: 12 / chunk.length, components: chunk })),
      },
    ];
  }
}
