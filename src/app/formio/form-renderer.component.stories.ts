import type { Meta, StoryObj } from '@storybook/angular';
import { FormRendererComponent, FormioComponentOptions, FormSubmissionData } from './form-renderer.component';

const meta: Meta<FormRendererComponent> = {
  title: 'Components/FormRenderer',
  component: FormRendererComponent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
The FormRenderer component provides a comprehensive wrapper around FormIO forms with additional features like:

- Custom styling and theming
- Built-in validation error display
- Loading states and form actions
- Read-only mode support
- Event handling for form lifecycle events

This component is built using the @formio/angular library and provides a clean, Material Design-inspired interface.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    form: {
      description: 'FormIO form schema object',
      control: { type: 'object' },
    },
    submission: {
      description: 'Initial form data/submission',
      control: { type: 'object' },
    },
    options: {
      description: 'FormIO component options',
      control: { type: 'object' },
    },
    formSubmit: {
      description: 'Event emitted when form is submitted',
      action: 'formSubmit',
    },
    formChange: {
      description: 'Event emitted when form data changes',
      action: 'formChange',
    },
    formError: {
      description: 'Event emitted when form validation fails',
      action: 'formError',
    },
  },
};

export default meta;
type Story = StoryObj<FormRendererComponent>;

// Basic form schema for stories
const basicFormSchema = {
  type: 'form',
  components: [
    {
      type: 'textfield',
      key: 'firstName',
      label: 'First Name',
      placeholder: 'Enter your first name',
      validate: {
        required: true,
        minLength: 2,
      },
    },
    {
      type: 'textfield',
      key: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      validate: {
        required: true,
        minLength: 2,
      },
    },
    {
      type: 'email',
      key: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      validate: {
        required: true,
      },
    },
    {
      type: 'select',
      key: 'country',
      label: 'Country',
      placeholder: 'Select your country',
      data: {
        values: [
          { label: 'United States', value: 'us' },
          { label: 'Canada', value: 'ca' },
          { label: 'United Kingdom', value: 'uk' },
          { label: 'Germany', value: 'de' },
          { label: 'France', value: 'fr' },
        ],
      },
      validate: {
        required: true,
      },
    },
    {
      type: 'textarea',
      key: 'message',
      label: 'Message',
      placeholder: 'Enter your message',
      rows: 4,
    },
  ],
};

// Complex form schema
const complexFormSchema = {
  type: 'form',
  components: [
    {
      type: 'fieldset',
      key: 'personalInfo',
      label: 'Personal Information',
      components: [
        {
          type: 'columns',
          key: 'personalColumns',
          columns: [
            {
              components: [
                {
                  type: 'textfield',
                  key: 'firstName',
                  label: 'First Name',
                  validate: { required: true },
                },
              ],
              width: 6,
              offset: 0,
            },
            {
              components: [
                {
                  type: 'textfield',
                  key: 'lastName',
                  label: 'Last Name',
                  validate: { required: true },
                },
              ],
              width: 6,
              offset: 0,
            },
          ],
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email Address',
          validate: { required: true },
        },
        {
          type: 'phoneNumber',
          key: 'phone',
          label: 'Phone Number',
        },
        {
          type: 'datetime',
          key: 'birthDate',
          label: 'Date of Birth',
          format: 'yyyy-MM-dd',
        },
      ],
    },
    {
      type: 'fieldset',
      key: 'preferences',
      label: 'Preferences',
      components: [
        {
          type: 'selectboxes',
          key: 'interests',
          label: 'Interests',
          values: [
            { label: 'Technology', value: 'tech' },
            { label: 'Sports', value: 'sports' },
            { label: 'Music', value: 'music' },
            { label: 'Travel', value: 'travel' },
            { label: 'Reading', value: 'reading' },
          ],
        },
        {
          type: 'radio',
          key: 'contactMethod',
          label: 'Preferred Contact Method',
          values: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'SMS', value: 'sms' },
          ],
          validate: { required: true },
        },
        {
          type: 'checkbox',
          key: 'newsletter',
          label: 'Subscribe to newsletter',
        },
      ],
    },
  ],
};

// Survey form schema
const surveyFormSchema = {
  type: 'form',
  components: [
    {
      type: 'htmlelement',
      key: 'surveyHeader',
      tag: 'h3',
      content: 'Customer Satisfaction Survey',
    },
    {
      type: 'rating',
      key: 'overallSatisfaction',
      label: 'Overall Satisfaction',
      scale: 5,
      validate: { required: true },
    },
    {
      type: 'rating',
      key: 'productQuality',
      label: 'Product Quality',
      scale: 5,
      validate: { required: true },
    },
    {
      type: 'rating',
      key: 'customerService',
      label: 'Customer Service',
      scale: 5,
      validate: { required: true },
    },
    {
      type: 'textarea',
      key: 'feedback',
      label: 'Additional Feedback',
      placeholder: 'Please share any additional comments or suggestions',
      rows: 4,
    },
    {
      type: 'checkbox',
      key: 'recommend',
      label: 'Would you recommend our product to others?',
    },
  ],
};

export const Default: Story = {
  args: {
    form: basicFormSchema,
    submission: { data: {} },
    options: {
      readOnly: false,
      noAlerts: true,
      language: 'en',
      template: 'bootstrap',
    },
  },
};

export const WithInitialData: Story = {
  args: {
    ...Default.args,
    submission: {
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        country: 'us',
        message: 'Hello, this is a pre-filled message!',
      },
    },
  },
};

export const ReadOnlyMode: Story = {
  args: {
    ...WithInitialData.args,
    options: {
      readOnly: true,
      noAlerts: true,
      language: 'en',
      template: 'bootstrap',
    },
  },
};

export const ComplexForm: Story = {
  args: {
    form: complexFormSchema,
    submission: { data: {} },
    options: {
      readOnly: false,
      noAlerts: true,
      language: 'en',
      template: 'bootstrap',
    },
  },
};

export const SurveyForm: Story = {
  args: {
    form: surveyFormSchema,
    submission: { data: {} },
    options: {
      readOnly: false,
      noAlerts: true,
      language: 'en',
      template: 'bootstrap',
    },
  },
};

export const WithCustomOptions: Story = {
  args: {
    ...Default.args,
    options: {
      readOnly: false,
      noAlerts: false, // Show alerts
      language: 'en',
      template: 'bootstrap',
      saveDraft: true,
      disableDragAndDrop: true,
    },
  },
};

export const MinimalForm: Story = {
  args: {
    form: {
      type: 'form',
      components: [
        {
          type: 'textfield',
          key: 'name',
          label: 'Name',
          placeholder: 'Enter your name',
          validate: { required: true },
        },
        {
          type: 'email',
          key: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          validate: { required: true },
        },
      ],
    },
    submission: { data: {} },
  },
};
