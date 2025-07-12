import DynamicLayoutEditor from '../src/index.jsx';

export default {
  title: 'Demo/DynamicLayoutEditor',
  component: DynamicLayoutEditor,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Default = {
  args: {
    initialData: {
      name: "Demo",
      value: 123,
      active: true,
      items: ["a", "b", "c"]
    },
    height: '600px',
  },
};
