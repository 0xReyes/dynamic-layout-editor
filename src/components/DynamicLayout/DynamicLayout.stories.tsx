import { DynamicLayout } from './DynamicLayout';

// Metadata for this component's stories
export default {
  title: 'Components/DynamicLayout',
  component: DynamicLayout,
  parameters: {
    // Optional parameter to center the component in the Canvas tab
    layout: 'fullscreen',
  },
  // This allows us to see the output of the onUpdate callback in the Storybook Actions panel
  argTypes: {
    onUpdate: { action: 'updated' },
  },
};

// The default story for your component
export const Default = {
  args: {
    configuration: {
      user_profile: {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        is_active: true,
        login_attempts: 5,
      },
      app_settings: {
        theme: 'dark',
        notifications: ['email', 'push', 'sms'],
        language: 'en-US',
      },
      permissions: [
        { role: 'admin', scopes: ['read', 'write', 'delete'] },
        { role: 'editor', scopes: ['read', 'write'] },
      ]
    },
    leftPanelWidth: 25,
    rightPanelWidth: 75,
  },
};
