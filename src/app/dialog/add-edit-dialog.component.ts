import { Component, ChangeDetectionStrategy } from '@angular/core';
import { mapControlType } from '../dynamic-form';
import { FORM_DIALOG_IMPORTS, FormDialogComponent, FormDialogData } from './form-dialog-base';

@Component({
  selector: 'app-add-edit-dialog',
  styleUrl: './form-dialog.component.scss',
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content class="mat-typography">
      <app-dynamic-form [controls]="formControls" [formId]="formId" (handleSubmit)="onSubmit($event)"> </app-dynamic-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="reset" [attr.form]="formId">Reset</button>
      <button matButton type="submit" [attr.form]="formId" cdkFocusInitial>Save</button>
    </mat-dialog-actions>
  `,
  imports: FORM_DIALOG_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class AddEditDialogComponent extends FormDialogComponent {
  toFormControls(data: FormDialogData) {
    const { formValues = {}, columnConfig } = data;
    return columnConfig.map(column => {
      const { editOptions = {} } = column.options;
      const controlConfig = {
        key: column.name,
        label: column.label || column.name,
        value: formValues[column.name],
        validators: column.options.validators,
        selectOptions: editOptions.selectOptions,
        fullWidth: editOptions.fullWidth,
        editable: column.options.editable,
        order: editOptions.order,
      };
      return mapControlType(controlConfig, editOptions.controlType);
    });
  }
}
