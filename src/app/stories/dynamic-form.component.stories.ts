// dynamic-form.component.stories.ts
import { Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { DynamicFormComponent } from '../dynamic-form';
import { CheckboxFormControl, MultiSelectFormControl, SelectFormControl, SliderFormControl, TextboxFormControl } from '../dynamic-form';

const meta: Meta<DynamicFormComponent> = {
  title: 'Dynamic Form',
  component: DynamicFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DynamicFormComponent>;

export const Default: Story = {
  args: {
    controls: [
      new TextboxFormControl({ key: 'name', label: 'Name', value: '' }),
      new SelectFormControl({
        key: 'gender',
        label: 'Gender',
        value: 'male',
        selectOptions: [
          { key: 'Male', value: 'male' },
          { key: 'Female', value: 'female' },
        ],
        validators: Validators.required,
      }),
      new MultiSelectFormControl({
        key: 'letters',
        label: 'Letters',
        value: ['A', 'B'],
        selectOptions: [
          { key: 'A', value: 'A' },
          { key: 'B', value: 'B' },
          { key: 'C', value: 'C' },
          { key: 'D', value: 'D' },
          { key: 'E', value: 'E' },
          { key: 'F', value: 'F' },
        ],
      }),
      new CheckboxFormControl({
        key: 'active',
        label: 'Is Active',
        value: true,
      }),
      new SliderFormControl({
        key: 'age',
        label: 'Age',
        value: 30,
        min: 0,
        max: 50,
        step: 1,
      }),
    ],
  },
};
