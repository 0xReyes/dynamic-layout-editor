import React, { useState } from 'react';
import { Button, Modal, Form, Input, Select, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { CustomStyles } from '../../types';

const { Option } = Select;

interface AddPropertyModalProps {
  onAdd: (key: string, type: string) => void;
  existingKeys: string[];
  styles?: CustomStyles;
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onAdd, existingKeys, styles = {} }) => {
  const [visible, setVisible] = useState(false);
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('string');

  const handleSubmit = () => {
    if (!propertyName.trim()) {
      notification.error({ message: 'Invalid Name', description: 'Property name cannot be empty.' });
      return;
    }
    if (existingKeys.includes(propertyName)) {
      notification.error({ message: 'Duplicate Key', description: 'Property name already exists.' });
      return;
    }
    onAdd(propertyName, propertyType);
    setVisible(false);
    setPropertyName('');
  };

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        ghost
        onClick={() => setVisible(true)}
        style={styles.addButton}
      >
        Add Property
      </Button>
      <Modal
        title="Add New Property"
        open={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        style={styles.modal}
      >
        <Form layout="vertical">
          <Form.Item label="Property Name" required>
            <Input
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Enter property name"
              style={styles.input}
            />
          </Form.Item>
          <Form.Item label="Property Type">
            <Select
              value={propertyType}
              onChange={setPropertyType}
              style={{ width: '100%', ...styles.select }}
            >
              {['string', 'number', 'boolean', 'object', 'array'].map((type) => (
                <Option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
