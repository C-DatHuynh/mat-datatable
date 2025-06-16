import { CommonModule } from '@angular/common';
import { Component, input, ChangeDetectionStrategy, OnInit, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { QuillModule } from 'ngx-quill';
import { isObservable, merge, of } from 'rxjs';
import { CastPipe } from '../pipes';
import {
  DynamicFormControlOptions,
  SliderControlOptions,
  type MultiSelectControlOptions,
  type SelectControlOptions,
  type TextboxControlOptions,
} from './form-control-base';

@Component({
  selector: 'app-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckbox,
    CastPipe,
    QuillModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DynamicFormControlComponent implements OnInit {
  readonly SelectControlOptions!: SelectControlOptions;
  readonly MultiSelectControlOptions!: MultiSelectControlOptions;
  readonly TextControlOptions!: TextboxControlOptions;
  readonly SliderControlOptions!: SliderControlOptions;

  readonly option = input.required<DynamicFormControlOptions>();

  readonly key = input.required<string>();

  readonly form = input.required<FormGroup>();

  readonly control = computed(() => {
    return this.form().get(this.key()) as FormControl;
  });

  readonly errorMessage = signal('');

  private readonly destroyRef = inject(DestroyRef);

  readonly selectOptions = computed(() => {
    const { selectOptions = [] } = this.option() as SelectControlOptions | MultiSelectControlOptions;
    return isObservable(selectOptions) ? selectOptions : of(selectOptions);
  });

  ngOnInit() {
    merge(this.control().statusChanges, this.control().valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.control().hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else {
      this.errorMessage.set('');
    }
  }
}
