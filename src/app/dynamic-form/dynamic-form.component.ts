import { Component, computed, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormValueType } from '../dialog';
import DynamicFormControlComponent from './dynamic-form-control.component';
import { DynamicFormControlOptions } from './form-control-base';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss'],
  imports: [DynamicFormControlComponent, ReactiveFormsModule, MatCardModule, MatButtonModule],
  standalone: true,
})
export default class DynamicFormComponent implements OnInit {
  readonly controlOptions = input.required<Record<string, DynamicFormControlOptions>>();
  readonly formId = input.required<string>();
  readonly formValue = input.required<FormValueType>();
  readonly handleSubmit = output<FormValueType>();
  readonly controlOptionEntries = computed(() => Object.entries(this.controlOptions()));

  form!: FormGroup;
  initialData = {};

  ngOnInit() {
    this.form = this.toFormGroup(this.formValue(), this.controlOptions());
    this.initialData = this.formValue();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.handleSubmit.emit(this.form.getRawValue() as FormValueType);
  }

  onReset() {
    this.form.reset(this.initialData);
  }

  toFormGroup(formValue: FormValueType, controlOptions: Record<string, DynamicFormControlOptions>) {
    const group: Record<string, FormControl> = {};
    Object.keys(controlOptions).forEach(column => {
      const options = controlOptions[column];
      const value = formValue[column];
      group[column as keyof typeof group] = options.validators ? new FormControl(value, options.validators) : new FormControl(value);
    });
    return new FormGroup(group);
  }

  getFormControl(key: string): FormControl {
    return this.form.get(key) as FormControl;
  }
}
