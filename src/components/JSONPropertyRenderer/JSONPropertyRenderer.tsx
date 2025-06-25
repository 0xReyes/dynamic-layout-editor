import React, { useEffect, useState, useCallback } from 'react';
import { Card, Input, Checkbox, Button, Typography, Tag, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { get, omit, filter, concat, capitalize, upperCase } from 'lodash';
import { PropertyModal } from '../PropertyModal';
import { RenderLabel } from '../RenderLabel';
import { generateKeyPath } from '../../utils';

const { Text } = Typography;

// Define CustomStyles type or import it from the appropriate location
type CustomStyles = {
  input?: React.CSSProperties;
  checkbox?: React.CSSProperties;
  label?: React.CSSProperties;
  card?: React.CSSProperties;
};

interface JSONPropertyRendererProps {
  itemKey: string;
  data: any;
  path: string;
  onChange: (path: string, newValue: any) => void;
  onDelete?: () => void;
  styles?: CustomStyles;
}

const DEFAULT_VALUES = {
  object: {},
  array: [],
  string: '',
  number: 0,
  boolean: false,
  null: null
};

export const JSONPropertyRenderer: React.FC<JSONPropertyRendererProps> = React.memo(({
  itemKey,
  data,
  path,
  onChange,
  onDelete,
  styles = {}
}) => {
  const [newTag, setNewTag] = useState('');
  const [value, setValue] = useState(() => get(data, path));

  useEffect(() => {
    setValue(get(data, path));
  }, [data, path]);

  const handleChange = useCallback((path: string, newValue: any) => {
    onChange(path, newValue);
  }, [onChange]);

  const renderPrimitiveArray = () => (
    <Space direction="vertical" style={{ width: '100%', alignItems: 'center'  }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {value.map((tag: any, index: number) => (
          <Tag
            key={`${tag}-${index}`}
            closable
            onClose={() => handleChange(path, value.filter((_: any, idx: number) => idx !== index))}
          >
            {capitalize(upperCase(String(tag)))}
          </Tag>
        ))}
      </div>
      
      <Space.Compact style={{ width: '100%', maxWidth: 300, alignItems: 'center'  }}>
        <Input
          size="small"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onPressEnter={() => {
            if (!newTag.trim()) return;
            handleChange(path, concat(value, newTag));
            setNewTag('');
          }}
          placeholder="Add item..."
          style={styles.input}
        />
        <Button 
          icon={<PlusOutlined />} 
          onClick={() => {
            if (!newTag.trim()) return;
            handleChange(path, concat(value, newTag));
            setNewTag('');
          }} 
          disabled={!newTag.trim()}
        />
      </Space.Compact>
    </Space>
  );

  const renderObjectArray = () => (
    <Space direction="vertical" style={{ width: '100%', alignItems: 'center'  }}>
      {value.map((item: any, index: number) => (
        <div 
          key={index} 
          className="object-array-item"
          style={{ 
            marginBottom: 12, 
            borderLeft: '2px solid #f0f0f0', 
            paddingLeft: 12 
          }}
        >
          <JSONPropertyRenderer
            itemKey={`${index + 1}.`}
            data={data}
            path={`${path}[${index}]`}
            onChange={onChange}
            onDelete={() => handleChange(path, value.filter((_: any, idx: number) => idx !== index))}
            styles={styles}
          />
        </div>
      ))}
    </Space>
  );

  const renderObject = () => (
    <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
      <PropertyModal
        propertyKey=""
        onSave={(key: string, type: string) => handleChange(path, { 
          ...value, 
          [key]: DEFAULT_VALUES[type as keyof typeof DEFAULT_VALUES] ?? null 
        })}
        onDelete={onDelete ?? (() => {})}
        existingKeys={Object.keys(value)}
        styles={styles.card}
      />
      
      {Object.entries(value).map(([key, val]) => (
        <div key={key}>
          <JSONPropertyRenderer
            itemKey={key}
            data={data}
            path={generateKeyPath(path, key)}
            onChange={onChange}
            onDelete={() => handleChange(path, omit(value, key))}
            styles={styles}
          />
        </div>
      ))}
    </Space>
  );

  const renderPrimitive = () => {
    if (typeof value === 'boolean') {
      return (
        <Checkbox
          checked={value}
          onChange={(e) => handleChange(path, e.target.checked)}
          style={styles.checkbox}
        >
          <Text strong style={styles.label}>{capitalize(upperCase(itemKey))}</Text>
        </Checkbox>
      );
    }
    
    return (
      <Input
        type={typeof value === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => handleChange(
          path, 
          typeof value === 'number' ? 
            Number(e.target.value) : 
            e.target.value
        )}
        addonBefore={<Text style={styles.label}>{capitalize(upperCase(itemKey))}</Text>}
        addonAfter={onDelete && (
          <Button danger icon={<DeleteOutlined />} onClick={onDelete} />
        )}
        style={styles.input}
      />
    );
  };

  if (Array.isArray(value)) {
    const isPrimitiveArray = value.every(item => 
      typeof item !== 'object' || item === null
    );
    
    return (
      <Card
        title={<RenderLabel dataKey={capitalize(upperCase(itemKey))} styles={styles} />}
        size="small"
        style={{ ...styles.card, marginBottom: 16 }}
        headStyle={{ textAlign: 'center' }}
      >
        {isPrimitiveArray ? renderPrimitiveArray() : renderObjectArray()}
      </Card>
    );
  }

  if (value && typeof value === 'object') {
    return (
      <Card
        title={<RenderLabel dataKey={capitalize(upperCase(itemKey))} styles={styles} />}
        size="small"
        style={{ ...styles.card, marginBottom: 16 }}
        headStyle={{ textAlign: 'center' }}
      >
        {renderObject()}
      </Card>
    );
  }

  return renderPrimitive();
});

JSONPropertyRenderer.displayName = 'JSONPropertyRenderer';
