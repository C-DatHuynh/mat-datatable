import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output } from '@angular/core';
import { ExtendedComponentSchema, FormioForm, FormioModule } from '@formio/angular';
import { Form } from '@formio/js';
import { DataStoreService } from '../services';
import { deepClone } from '../utils';

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [CommonModule, FormioModule],
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.scss'],
})
export class FormRendererComponent {
  formData = input.required<object | null>();
  formConfig = input.required<ExtendedComponentSchema>();
  formSubmit = output<Record<string, any>>();
  formInvalid = output<boolean>();
  dataStoreService = inject(DataStoreService);

  form!: FormioForm;
  data!: { data: object };
  invalid = false;
  formInstance!: any;

  get formioOptions() {
    return this.dataStoreService.settings()?.table.formioOptions;
  }

  constructor() {
    effect(() => {
      const currentData = this.formData();
      if (currentData) {
        this.data = { data: deepClone(currentData) };
      }
    });
    effect(() => {
      const currentFormConfig = this.formConfig();
      if (currentFormConfig) {
        this.form = { components: currentFormConfig };
      }
    });
  }

  onLoad(event: any) {
    this.formInstance = event.formio;
  }

  onChange(event: any) {
    if (event.isValid !== undefined) {
      this.invalid = !event.isValid;
      this.formInvalid.emit(this.invalid);
    }
  }

  submit() {
    if (!this.invalid) {
      this.formSubmit.emit(this.data.data);
      this.formInstance.emit('submitDone');
    }
  }
}
