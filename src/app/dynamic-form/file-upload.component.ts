import { Component, ElementRef, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UploadControlOptions } from './form-control-base';

@Component({
  selector: 'app-file-upload',
  templateUrl: 'file-upload.component.html',
  styleUrls: ['file-upload.component.scss'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: FileUploadComponent,
      multi: true,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor {
  option = input.required<UploadControlOptions>();
  fileName = '';
  onChange!: (file: File) => void;
  onTouched!: () => void;
  touched = false;
  disabled = false;

  private file: File | null = null;

  constructor(private host: ElementRef<HTMLInputElement>) {}

  writeValue(value: null) {
    this.host.nativeElement.value = '';
    this.file = value;
    this.fileName = '';
  }

  registerOnChange(fn: (file: File) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file: File = (input.files as FileList)[0];
    if (!file) {
      return;
    }
    this.file = file;
    this.fileName = file.name;
    this.onChange(file);
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
}
