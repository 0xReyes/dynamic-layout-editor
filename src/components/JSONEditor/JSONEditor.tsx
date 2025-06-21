import React, { useState, useEffect } from 'react';
import { Card, Input, Form, Button, Typography, notification } from 'antd';
import type { CustomStyles } from '../../types';

const { Title } = Typography;

interface JSONEditorProps {
  value: object;
  onChange: (newValue: object) => void;
  styles?: CustomStyles;
}

export const JSONEditor: React.FC<JSONEditorProps> = React.memo(({ value, onChange, styles = {} }) => {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonValue(JSON.stringify(value, null, 2));
  }, [value]);

  const handleApply = () => {
    try {
      const parsedValue = JSON.parse(jsonValue);
      onChange(parsedValue);
      setError(null);
      notification.success({ message: 'JSON Updated', description: 'Configuration updated successfully.' });
    } catch (e: any) {
      setError(e.message);
      notification.error({ message: 'Invalid JSON', description: e.message });
    }
  };

  return (
    <Card title={<Title level={4} style={styles.label}>JSON Editor</Title>} style={styles.card}>
      <Form layout="vertical">
        <Form.Item validateStatus={error ? 'error' : ''} help={error}>
          <Input.TextArea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            style={styles.jsonEditor}
            autoSize={{ minRows: 25 }}
          />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, ...styles.buttonContainer }}>
          <Button type="primary" onClick={handleApply} style={{ width: 200, ...styles.applyButton }}>
            Apply Changes
          </Button>
        </div>
      </Form>
    </Card>
  );
});

JSONEditor.displayName = 'JSONEditor';
