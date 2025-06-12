import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FORM_DIALOG_IMPORTS, FormDialogComponent } from './form-dialog-base';

@Component({
  selector: 'app-confirm-delete-dialog',
  styleUrl: './form-dialog.component.scss',
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content class="mat-typography">
      <app-dynamic-form [controlOptions]="formOptions" [formId]="formId" (handleSubmit)="onSubmit($event)" [formValue]="formValue">
      </app-dynamic-form>
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
export default class ConfirmDeleteDialogComponent extends FormDialogComponent {}
