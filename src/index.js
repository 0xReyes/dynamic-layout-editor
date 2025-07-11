import React, { useState, useMemo, useCallback } from 'react';
import { Input, InputNumber, Checkbox, Button, Space, Typography, Layout, Tree, ConfigProvider, theme, Modal, notification, Radio } from 'antd';
import { PlusOutlined, DeleteOutlined, SnippetsOutlined } from '@ant-design/icons';
import _ from 'lodash';

// Utility functions
const getValueType = (value) => {
  if (_.isObject(value) && !_.isArray(value) && value !== null) return 'object';
  if (_.isArray(value)) return 'array';
  if (_.isString(value)) return 'string';
  if (_.isNumber(value)) return 'number';
  if (_.isBoolean(value)) return 'boolean';
  if (_.isNull(value)) return 'null';
  return 'string';
};

const flattenObject = (obj, path = '', level = 0) => {
  const result = [];
  _.forEach(obj, (value, key) => {
    const newPath = path ? `${path}.${key}` : String(key);
    const type = getValueType(value);
    
    result.push({
      path: newPath,
      level,
      key,
      value,
      type,
      childrenCount: _.isObject(value) ? _.size(value) : 0,
    });

    if (type === 'object' || type === 'array') {
      result.push(...flattenObject(value, newPath, level + 1));
    }
  });
  return result;
};

// Property component
const ObjectProperty = React.memo(({ node, onDataChange }) => {
  const { path, level, key, value, type, childrenCount } = node;
  const { token } = theme.useToken();

  const handleValueChange = useCallback((newValue) => {
    onDataChange(path, newValue);
  }, [path, onDataChange]);

  const handleDelete = useCallback(() => {
    onDataChange(path, undefined, 'delete');
  }, [path, onDataChange]);

  const handleAddChild = useCallback(() => {
    if (type === 'object') {
      const newKey = `new_property_${Date.now()}`;
      onDataChange(`${path}.${newKey}`, 'new value', 'add');
    } else if (type === 'array') {
      onDataChange(`${path}.${childrenCount}`, 'new item', 'add');
    }
  }, [path, type, childrenCount, onDataChange]);

  const deleteButton = (
    <Button
      icon={<DeleteOutlined />}
      size="small"
      danger
      onClick={handleDelete}
      title="Delete"
    />
  );

  const renderValueInput = () => {
    switch (type) {
      case 'string':
        return (
          <Input
            value={value}
            addonBefore={key}
            addonAfter={deleteButton}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        );
      case 'number':
        return (
          <InputNumber
            value={value}
            addonBefore={key}
            addonAfter={deleteButton}
            onChange={handleValueChange}
            style={{ width: '100%' }}
          />
        );
      case 'boolean':
        return (
          <Checkbox checked={value} onChange={(e) => handleValueChange(e.target.checked)}>
            <Typography.Text strong>{key}</Typography.Text>
          </Checkbox>
        );
      case 'null':
        return (
          <Space>
            <Typography.Text strong>{key}:</Typography.Text>
            <Typography.Text type="secondary" italic>null</Typography.Text>
          </Space>
        );
      case 'object':
      case 'array':
        return (
          <Space>
            <Typography.Text strong>{key}:</Typography.Text>
            <Typography.Text type="secondary">
              {type === 'object' ? 'Object' : 'Array'} ({childrenCount} items)
            </Typography.Text>
          </Space>
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      id={path}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: 'transparent',
      }}
    >
      <Layout.Content style={{ marginRight: 16, paddingLeft: level * 24, background: 'transparent' }}>
        {renderValueInput()}
      </Layout.Content>
      <Space>
        {(type === 'object' || type === 'array') && (
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={handleAddChild}
            title={type === 'object' ? 'Add Property' : 'Add Item'}
          />
        )}
        {type !== 'string' && type !== 'number' && deleteButton}
      </Space>
    </Layout>
  );
});

// Tree view component
const ObjectTreeView = React.memo(({ data, onNodeSelect }) => {
  const buildTreeData = useCallback((nodes, currentPath = '') => {
    if (!nodes || typeof nodes !== 'object') return [];
    
    return Object.keys(nodes).map((key) => {
      const value = nodes[key];
      const fullPath = currentPath ? `${currentPath}.${key}` : String(key);
      
      return {
        key: fullPath,
        title: key,
        isLeaf: typeof value !== 'object' || value === null,
        children: value && typeof value === 'object' ? buildTreeData(value, fullPath) : null,
      };
    });
  }, []);
  
  const treeData = useMemo(() => buildTreeData(data), [data, buildTreeData]);
  
  const handleSelect = useCallback((selectedKeys, { node }) => {
    if (selectedKeys.length > 0) {
      onNodeSelect(node.key);
    }
  }, [onNodeSelect]);
  
  return (
    <Layout style={{ height: '100%', overflow: 'auto', background: 'transparent' }}>
      <Tree
        showLine
        defaultExpandAll={false}
        onSelect={handleSelect}
        treeData={treeData}
        style={{ background: 'transparent' }}
      />
    </Layout>
  );
});

// Main editor component
const DynamicLayoutEditor = ({ 
  initialData, 
  navigatorTitle = 'Key Navigator', 
  editorTitle = 'Data Editor',
  onDataChange,
  darkMode = true,
  height = '100vh'
}) => {
  const [data, setData] = useState(initialData);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [sourceFormat, setSourceFormat] = useState('json');
  const { token } = theme.useToken();

  const flatData = useMemo(() => flattenObject(data), [data]);

  const handleDataChange = useCallback((path, value, action = 'update') => {
    setData(currentData => {
      const newData = _.cloneDeep(currentData);
      
      if (action === 'delete') {
        _.unset(newData, path);
        const parentPath = path.substring(0, path.lastIndexOf('.'));
        const parent = _.get(newData, parentPath);
        if (_.isArray(parent)) {
          _.set(newData, parentPath, parent.filter(item => item != null));
        }
      } else {
        _.set(newData, path, value);
      }
      
      // Call external callback if provided
      if (onDataChange) {
        onDataChange(newData);
      }
      
      return newData;
    });
  }, [onDataChange]);

  const handleNodeSelect = useCallback((path) => {
    const element = document.getElementById(path);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.backgroundColor = token.colorPrimaryBg;
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 1500);
    }
  }, [token.colorPrimaryBg]);

  const showSourceModal = useCallback(() => {
    setSourceFormat('json');
    setSourceText(JSON.stringify(data, null, 2));
    setIsSourceModalVisible(true);
  }, [data]);

  const handleSourceOk = useCallback(() => {
    try {
      let parsedData;
      if (sourceFormat === 'yaml') {
        parsedData = window.jsyaml?.load(sourceText);
      } else {
        parsedData = JSON.parse(sourceText);
      }
      
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Invalid object format');
      }

      setData(parsedData);
      if (onDataChange) {
        onDataChange(parsedData);
      }
      setIsSourceModalVisible(false);
      notification.success({ message: 'Data updated successfully!' });
    } catch (error) {
      notification.error({
        message: `Invalid ${sourceFormat.toUpperCase()}`,
        description: error.message || 'Please check the format and try again.',
      });
    }
  }, [sourceText, sourceFormat, onDataChange]);

  const handleSourceCancel = useCallback(() => {
    setIsSourceModalVisible(false);
  }, []);

  const handleFormatChange = useCallback((e) => {
    const newFormat = e.target.value;
    try {
      let currentObject;
      if (sourceFormat === 'yaml') {
        currentObject = window.jsyaml?.load(sourceText);
      } else {
        currentObject = JSON.parse(sourceText);
      }

      if (newFormat === 'yaml') {
        if (window.jsyaml) {
          setSourceText(window.jsyaml.dump(currentObject));
        } else {
          notification.error({ message: 'YAML library not available' });
          return;
        }
      } else {
        setSourceText(JSON.stringify(currentObject, null, 2));
      }
      setSourceFormat(newFormat);
    } catch (error) {
      notification.error({
        message: 'Format conversion failed',
        description: 'Please ensure the current format is valid.',
      });
    }
  }, [sourceText, sourceFormat]);

  const themeConfig = darkMode ? {
    algorithm: theme.darkAlgorithm,
    components: {
      Layout: {
        siderBg: '#141414',
        headerBg: '#1f1f1f',
      }
    }
  } : {};

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ height, background: token.colorBgContainer }}>
        <Layout.Sider 
          width={250} 
          theme="light" 
          style={{ 
            height: '100%', 
            position: 'fixed', 
            left: 0, 
            borderRight: `1px solid ${token.colorBorder}` 
          }}
        >
          <Layout style={{ 
            padding: '16px', 
            borderBottom: `1px solid ${token.colorBorder}`, 
            background: 'transparent' 
          }}>
            <Typography.Title level={5}>{navigatorTitle}</Typography.Title>
          </Layout>
          <ObjectTreeView data={data} onNodeSelect={handleNodeSelect} />
        </Layout.Sider>
        
        <Layout style={{ marginLeft: 250, background: token.colorBgContainer }}>
          <Layout.Header 
            style={{ 
              background: token.colorBgBase, 
              borderBottom: `1px solid ${token.colorBorder}`, 
              padding: '0 24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}
          >
            <Typography.Title level={4} style={{ margin: 0 }}>
              {editorTitle}
            </Typography.Title>
            <Button icon={<SnippetsOutlined />} onClick={showSourceModal}>
              View Source
            </Button>
          </Layout.Header>
          
          <Layout.Content 
            style={{ 
              padding: '24px', 
              overflowY: 'auto', 
              height: 'calc(100% - 64px)' 
            }}
          >
            {flatData.map(node => (
              <ObjectProperty
                key={node.path}
                node={node}
                onDataChange={handleDataChange}
              />
            ))}
          </Layout.Content>
        </Layout>
        
        <Modal
          title="Source Editor"
          open={isSourceModalVisible}
          onOk={handleSourceOk}
          onCancel={handleSourceCancel}
          width="80vw"
          style={{ maxWidth: '1200px' }}
          footer={[
            <Radio.Group key="format" value={sourceFormat} onChange={handleFormatChange}>
              <Radio.Button value="json">JSON</Radio.Button>
              <Radio.Button value="yaml">YAML</Radio.Button>
            </Radio.Group>,
            <Button key="cancel" onClick={handleSourceCancel}>
              Cancel
            </Button>,
            <Button key="ok" type="primary" onClick={handleSourceOk}>
              Update
            </Button>,
          ]}
        >
          <Input.TextArea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            autoSize={{ minRows: 15, maxRows: 25 }}
            placeholder={`Enter valid ${sourceFormat.toUpperCase()}`}
          />
        </Modal>
      </Layout>
    </ConfigProvider>
  );
};

export default DynamicLayoutEditor;
export { DynamicLayoutEditor };