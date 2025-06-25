import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Popconfirm, notification } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface PropertyModalProps {
  propertyKey: string;
  onSave: (key: string, type: string) => void;
  onDelete: () => void;
  existingKeys: string[];
  styles?: React.CSSProperties;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  propertyKey,
  onSave,
  onDelete,
  existingKeys = [],
  styles = {},
}) => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const isNew = !propertyKey;

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({ name: propertyKey, type: 'string' });
    }
  }, [visible, propertyKey, form]);

  const handleSubmit = async () => {
    try {
      const { name, type } = await form.validateFields();
      if (isNew && existingKeys.includes(name)) {
        notification.error({
          message: 'Duplicate Property',
          description: 'A property with this name already exists.',
        });
        return;
      }
      onSave(name, type);
      setVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        icon={isNew ? <PlusOutlined /> : <EditOutlined />}
        onClick={() => setVisible(true)}
        style={styles.button}
        aria-label={isNew ? 'Add property' : 'Edit property'}
      />
      <Modal
        title={isNew ? 'Add Property' : 'Edit Property'}
        open={visible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        footer={[
          !isNew && (
            <Popconfirm
              key="delete"
              title="Are you sure you want to delete this property?"
              onConfirm={() => {
                onDelete();
                setVisible(false);
              }}
              okText="Delete"
              cancelText="Cancel"
            >
              <Button danger icon={<DeleteOutlined />} aria-label="Delete property" />
            </Popconfirm>
          ),
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSubmit}>
            {isNew ? 'Add' : 'Save'}
          </Button>,
        ]}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Property Name"
            rules={[
              { required: true, message: 'Please input property name' },
              { pattern: /^[a-zA-Z_$][\w$]*$/, message: 'Invalid property name' },
            ]}
          >
            <Input 
              disabled={!isNew} 
              placeholder="Enter property name" 
              autoFocus={isNew} 
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Property Type"
            rules={[{ required: true, message: 'Please select property type' }]}
          >
            <Select style={{ width: '100%' }}>
              {['string', 'number', 'boolean', 'object', 'array'].map(t => (
                <Select.Option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};