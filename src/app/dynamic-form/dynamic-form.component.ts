import { Component, input, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormValueType } from '../dialog';
import DynamicFormControlComponent from './dynamic-form-control.component';
import { FormControlBase } from './form-control-base';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  imports: [DynamicFormControlComponent, ReactiveFormsModule, MatCardModule, MatButtonModule],
  standalone: true,
})
export default class DynamicFormComponent implements OnInit {
  readonly controls = input.required<FormControlBase[]>();
  readonly formId = input<string>();
  readonly handleSubmit = output<FormValueType>();
  form: FormGroup = new FormGroup({});
  initialData = {};

  ngOnInit() {
    this.form = this.toFormGroup(this.controls() as FormControlBase[]);
    this.initialData = this.form.getRawValue();
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

  toFormGroup(controls: FormControlBase[]) {
    const group: Record<string, FormControl> = {};
    controls.forEach(control => {
      group[control.key as keyof typeof group] = new FormControl(control.value, control.validators);
    });
    return new FormGroup(group);
  }
}
