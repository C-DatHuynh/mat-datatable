import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { mapControlType } from '../dynamic-form';
import { FORM_DIALOG_IMPORTS, FormDialogComponent } from './form-dialog-base';

@Component({
  selector: 'app-confirm-delete-dialog',
  styleUrl: './form-dialog.component.scss',
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content class="mat-typography">
      <app-dynamic-form [controls]="formControls" [formId]="formId" (handleSubmit)="onSubmit($event)"> </app-dynamic-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close [attr.form]="formId">Cancel</button>
      <button matButton type="submit" [attr.form]="formId" cdkFocusInitial>Confirm</button>
    </mat-dialog-actions>
  `,
  imports: FORM_DIALOG_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class ConfirmDeleteDialogComponent extends FormDialogComponent {
  toFormControls() {
    const controlConfig = {
      key: 'confirm',
      label: 'Type "delete" to confirm:',
      value: '',
      validators: [Validators.required],
    };
    return [mapControlType(controlConfig, 'textbox')];
  }
}
