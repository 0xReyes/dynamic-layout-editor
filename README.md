# Dynamic Layout Editor

A powerful React component for editing JSON/YAML data with an intuitive tree navigator and visual editor interface.


![Screenshot](./Screenshot%202025-07-11%20at%209.37.05%E2%80%AFPM.png)

## Features

- **Visual Data Editing**: Edit JSON/YAML data through an intuitive interface
- **Tree Navigation**: Navigate complex data structures with a collapsible tree view
- **Dark/Light Theme**: Built-in theme support with Ant Design
- **Source Code View**: Switch between visual and source code editing
- **Type Support**: Handle strings, numbers, booleans, objects, arrays, and null values
- **Dynamic Operations**: Add, edit, and delete properties and array items
- **Scroll Navigation**: Click tree nodes to navigate to specific data sections
- **Customizable**: Configurable titles, callbacks, and styling options

## Installation

```bash
npm install dynamic-layout-editor
```

## Peer Dependencies

Make sure you have these installed in your project:

```bash
npm install react react-dom antd
```

## Usage

### Basic Usage

```jsx
import React, { useState } from 'react';
import DynamicLayoutEditor from 'dynamic-layout-editor';

const App = () => {
  const [data, setData] = useState({
    name: "John Doe",
    age: 30,
    active: true,
    address: {
      street: "123 Main St",
      city: "New York"
    },
    hobbies: ["reading", "swimming"]
  });

  const handleDataChange = (newData) => {
    setData(newData);
    console.log('Data updated:', newData);
  };

  return (
    <DynamicLayoutEditor
      initialData={data}
      onDataChange={handleDataChange}
      navigatorTitle="Data Navigator"
      editorTitle="JSON Editor"
    />
  );
};

export default App;
```

### Advanced Usage with Custom Styling

```jsx
import React, { useState } from 'react';
import DynamicLayoutEditor from 'dynamic-layout-editor';

const App = () => {
  const [data, setData] = useState({
    // your data here
  });

  return (
    <div style={{ height: '80vh' }}>
      <DynamicLayoutEditor
        initialData={data}
        onDataChange={(newData) => console.log(newData)}
        navigatorTitle="Config Navigator"
        editorTitle="Configuration Editor"
        darkMode={false}
        height="80vh"
      />
    </div>
  );
};

export default App;
```

### With YAML Support

To enable YAML support, include the js-yaml library:

```html
<script src="https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js"></script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialData` | `object` | **required** | The initial data object to edit |
| `onDataChange` | `function` | `undefined` | Callback function called when data changes |
| `navigatorTitle` | `string` | `'Key Navigator'` | Title for the tree navigator panel |
| `editorTitle` | `string` | `'Data Editor'` | Title for the editor panel |
| `darkMode` | `boolean` | `true` | Enable dark theme |
| `height` | `string` | `'100vh'` | Height of the editor component |

## Data Types Supported

- **String**: Text values with input fields
- **Number**: Numeric values with number inputs
- **Boolean**: Toggle with checkboxes
- **Object**: Nested objects with expandable tree nodes
- **Array**: Lists with add/remove functionality
- **Null**: Explicitly handled null values

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes during development
npm run dev
```
