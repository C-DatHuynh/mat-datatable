import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { isObservable, merge, Observable, of } from 'rxjs';
import { SelectOptionType } from '../types';
import { FormControlBase } from './form-control-base';

@Component({
  selector: 'app-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSliderModule, MatCheckbox],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DynamicFormControlComponent<T> implements OnInit {
  readonly data = input.required<FormControlBase>();

  readonly form = input.required<FormGroup>();

  readonly errorMessage = signal('');

  private readonly destroyRef = inject(DestroyRef);

  control!: FormControl<T>;

  selectOptions!: Observable<SelectOptionType[]>;

  ngOnInit() {
    const { key, selectOptions = [] } = this.data();
    this.control = this.form().get(key) as FormControl<T>;
    merge(this.control.statusChanges, this.control.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrorMessage());
    this.selectOptions = isObservable(selectOptions) ? selectOptions : of(selectOptions);
  }

  updateErrorMessage() {
    if (this.control.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else {
      this.errorMessage.set('');
    }
  }
}
