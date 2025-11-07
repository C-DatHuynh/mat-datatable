import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FORM_DIALOG_IMPORTS, FormDialogComponent } from './form-dialog-base';

@Component({
  selector: 'app-add-edit-dialog',
  styleUrl: './form-dialog.component.scss',
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content class="mat-typography">
      <app-dynamic-form [controlOptions]="formOptions" [formId]="formId" (handleSubmit)="onSubmit($event)" [formValue]="formValue"></app-dynamic-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button type="reset" [attr.form]="formId">Reset</button>
      <button mat-raised-button color="primary" type="submit" [attr.form]="formId" cdkFocusInitial>Save</button>
    </mat-dialog-actions>
  `,
  imports: FORM_DIALOG_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class AddEditDialogComponent extends FormDialogComponent {}
