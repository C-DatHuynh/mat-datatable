import { ChangeDetectionStrategy, Component } from '@angular/core';
import { mapControlType } from '../dynamic-form';
import { FORM_DIALOG_IMPORTS, FormDialogComponent, FormDialogData } from './form-dialog-base';

@Component({
  selector: 'app-filter-dialog',
  styleUrl: './form-dialog.component.scss',
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content class="mat-typography">
      <app-dynamic-form [controls]="formControls" [formId]="formId" (handleSubmit)="onSubmit($event)"> </app-dynamic-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="reset" [attr.form]="formId">Reset</button>
      <button matButton type="submit" [attr.form]="formId" cdkFocusInitial>Apply</button>
    </mat-dialog-actions>
  `,
  imports: FORM_DIALOG_IMPORTS,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export default class FilterDialogComponent extends FormDialogComponent {
  toFormControls(data: FormDialogData) {
    const { formValues, columnConfig } = data;
    // edit/add form vs filter form -> control type, with or without validator, different template if possible
    return columnConfig
      .filter(column => column.options.filter !== false)
      .map(column => {
        const { filterOptions = {} } = column.options;
        const controlConfig = {
          key: column.name,
          label: column.label || column.name,
          value: formValues[column.name],
          selectOptions: filterOptions.selectOptions,
          fullWidth: filterOptions.fullWidth,
          order: filterOptions.order,
        };
        return mapControlType(controlConfig, filterOptions.controlType);
      });
  }
}
