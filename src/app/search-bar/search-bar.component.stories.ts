import { Meta, StoryObj } from '@storybook/angular';
import { SearchBarComponent } from './search-bar.component';

const meta: Meta<SearchBarComponent> = {
  title: 'Components/SearchBar',
  component: SearchBarComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    search: {
      action: 'search',
      description: 'Event emitted when user presses Enter key or clicks the search icon',
    },
    clear: {
      action: 'clear',
      description: 'Event emitted when user clicks the clear button',
    },
  },
};

export default meta;
type Story = StoryObj<SearchBarComponent>;

export const Default: Story = {
  args: {
    placeholder: 'Search table data...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search for users...',
  },
};

export const NoPlaceholder: Story = {
  args: {
    placeholder: undefined,
  },
};
