// dynamic-form.component.stories.ts
import { Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { DynamicFormComponent } from '../dynamic-form';

const meta: Meta<DynamicFormComponent> = {
  title: 'Dynamic Form',
  component: DynamicFormComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<DynamicFormComponent>;

export const Default: Story = {
  args: {
    formId: 'dynamic-form',
    formValue: {
      name: '',
      gender: 'male',
      letters: ['A', 'B'],
      active: true,
      age: 30,
      description: '<p>Default description</p>',
    },
    controlOptions: {
      name: { label: 'Name', controlType: 'textbox', type: 'text' },
      gender: {
        label: 'Gender',
        selectOptions: [
          { key: 'Male', value: 'male' },
          { key: 'Female', value: 'female' },
        ],
        controlType: 'dropdown',
        validators: Validators.required,
      },
      letters: {
        label: 'Letters',
        selectOptions: [
          { key: 'A', value: 'A' },
          { key: 'B', value: 'B' },
          { key: 'C', value: 'C' },
          { key: 'D', value: 'D' },
          { key: 'E', value: 'E' },
          { key: 'F', value: 'F' },
        ],
        controlType: 'multiselect',
        fullWidth: true,
      },
      active: {
        label: 'Is Active',
        value: true,
        controlType: 'checkbox',
      },
      age: {
        label: 'Age',
        min: 0,
        max: 50,
        step: 1,
        controlType: 'slider',
      },
      description: {
        controlType: 'richtextbox',
        fullWidth: true,
      },
    },
  },
};
