import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormioModule } from '@formio/angular';

export interface FormSubmissionData {
  data: any;
  metadata?: any;
}

export interface FormioComponentOptions {
  readOnly?: boolean;
  noAlerts?: boolean;
  language?: string;
  template?: string;
  saveDraft?: boolean;
  disableDragAndDrop?: boolean;
}

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [CommonModule, FormioModule],
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.scss'],
})
export class FormRendererComponent implements OnInit {
  @Input({ required: true }) form: any = null;
  @Input({ required: true }) submission: any = null;
  @Input() options: FormioComponentOptions | null = null;

  @Output() formSubmit = new EventEmitter<FormSubmissionData>();
  @Output() formChange = new EventEmitter<any>();
  @Output() formError = new EventEmitter<any>();

  validationErrors: any[] = [];
  formioOptions: any = {};
  initialData: any = {};

  ngOnInit() {
    this.setupFormioOptions();
    this.initialData = { ...this.submission?.data };
  }

  private setupFormioOptions() {
    this.formioOptions = {
      readOnly: this.options?.readOnly || false,
      noAlerts: this.options?.noAlerts !== false, // Default to true
      language: this.options?.language || 'en',
      template: this.options?.template || 'bootstrap',
      saveDraft: this.options?.saveDraft || false,
      disableDragAndDrop: this.options?.disableDragAndDrop !== false, // Default to true
      hooks: {
        beforeSubmit: (submission: any, next: Function) => {
          // Clear previous validation errors
          this.validationErrors = [];
          next();
        },
      },
    };
  }

  onFormSubmit(submission: any) {
    console.log('Form submitted:', submission);
    this.validationErrors = [];

    const formData: FormSubmissionData = {
      data: submission.data,
      metadata: {
        submittedAt: new Date().toISOString(),
        formId: this.form?.id || 'unknown',
      },
    };

    this.formSubmit.emit(formData);
  }

  onFormChange(event: any) {
    this.formChange.emit(event);
  }

  onFormError(error: any) {
    console.error('Form error:', error);

    if (error.details) {
      this.validationErrors = error.details;
    } else if (error.message) {
      this.validationErrors = [{ message: error.message }];
    }

    this.formError.emit(error);
  }

  submit() {
    this.onFormSubmit(this.submission);
  }

  // Utility methods for external use
  isValid(): boolean {
    return this.validationErrors.length === 0;
  }

  getSubmissionData(): any {
    return this.submission?.data || {};
  }

  setSubmissionData(data: any) {
    this.submission = { data: { ...data } };
  }

  clearForm() {
    this.submission = { data: {} };
    this.validationErrors = [];
  }

  resetForm() {
    this.submission = { data: { ...this.initialData } };
    this.validationErrors = [];
  }
}
