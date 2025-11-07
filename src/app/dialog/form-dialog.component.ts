import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DynamicFormComponent } from '../dynamic-form';
import { DynamicFormControlOptions } from '../dynamic-form/form-control-base';
import { PrimitiveType } from '../types';
import BaseDialogComponent, { DialogAction } from './base-dialog.component';

export type FormValueType = Record<string, PrimitiveType | PrimitiveType[] | File | File[]>;

export interface FormDialogData {
  title: string;
  formValue: FormValueType;
  columnConfig: Record<string, DynamicFormControlOptions>;
  actions: DialogAction[];
  showCloseButton?: boolean;
}

@Component({
  selector: 'app-add-edit-dialog',
  template: `
    <app-base-dialog [options]="{ title: title, actions: data.actions, showCloseButton: true }" (actionDone)="onAction($event)">
      <app-dynamic-form [controlOptions]="formOptions" [formId]="formId" (handleSubmit)="onSubmit($event)" [formValue]="formValue"></app-dynamic-form>
    </app-base-dialog>
  `,
  imports: [BaseDialogComponent, DynamicFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class FormDialogComponent {
  readonly formId: string = 'formDialog';
  readonly formOptions!: Record<string, DynamicFormControlOptions>;
  readonly formValue!: FormValueType;
  readonly title!: string;

  constructor(
    private dialogRef: MatDialogRef<FormDialogComponent, any>,
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData
  ) {}

  onAction(value: DialogAction): void {
    this.dialogRef.close(value);
  }

  onSubmit(data: FormValueType) {
    this.dialogRef.close(data);
  }
}
