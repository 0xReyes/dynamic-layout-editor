import React, { useCallback } from 'react';
import { Card, Input, Checkbox, Button, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash-es';
import { AddPropertyModal } from '../AddPropertyModal';
import { RenderLabel } from '../RenderLabel';
import { generateKeyPath } from '../../utils';
import type { CustomStyles } from '../../types';

const { Text } = Typography;

interface JSONPropertyRendererProps {
  itemKey: string;
  value: any;
  path: string;
  onChange: (path: string, newValue: any) => void;
  onDelete?: () => void;
  styles?: CustomStyles;
}

export const JSONPropertyRenderer: React.FC<JSONPropertyRendererProps> = React.memo(({ itemKey, value, path, onChange, onDelete, styles = {} }) => {

    const handleValueChange = useCallback((newValue: any) => onChange(path, newValue), [onChange, path]);

    const handleNestedChange = useCallback((subPath: string, newValue: any) => onChange(subPath, newValue), [onChange]);

    const handleAddProperty = useCallback((key: string, type: string) => {
        const newTypedValue = {
            object: {}, array: [], string: '', number: 0, boolean: false,
        }[type] || null;
        onChange(path, { ...value, [key]: newTypedValue });
    }, [value, path, onChange]);

    const handleDeleteProperty = useCallback((key: string) => {
        const newValue = { ...value };
        delete newValue[key];
        onChange(path, newValue);
    }, [value, path, onChange]);

    const handleDeleteArrayItem = useCallback((index: number) => {
        onChange(path, (value || []).filter((_: any, i: number) => i !== index));
    }, [value, path, onChange]);
    
    if (Array.isArray(value)) {
        return (
          <>
            <RenderLabel dataKey={itemKey} styles={styles} />
            {value.map((item, index) => (
              <div key={index} style={{ marginBottom: 12, marginLeft: 24, borderLeft: '1px solid #f0f0f0', paddingLeft: 16 }}>
                <JSONPropertyRenderer
                  itemKey={`Item ${index + 1}`}
                  value={item}
                  path={`${path}[${index}]`}
                  onChange={handleNestedChange}
                  onDelete={() => handleDeleteArrayItem(index)}
                  styles={styles}
                />
              </div>
            ))}
          </>
        );
    }

    if (value && typeof value === 'object') {
        return (
            <Card
                title={<RenderLabel dataKey={itemKey} styles={styles} />}
                size="small"
                extra={<AddPropertyModal onAdd={handleAddProperty} existingKeys={Object.keys(value)} styles={styles} />}
                style={{ ...styles.card, marginBottom: 16 }}
            >
                {Object.keys(value).map((key) => (
                    <div key={key} style={{ marginBottom: 12 }}>
                        <JSONPropertyRenderer
                            itemKey={key}
                            value={value[key]}
                            path={generateKeyPath(path, key)}
                            onChange={handleNestedChange}
                            onDelete={() => handleDeleteProperty(key)}
                            styles={styles}
                        />
                    </div>
                ))}
            </Card>
        );
    }
    
    return (
        <div style={{ ...styles.propertyRow }}>
            <div style={{ flex: 1 }}>
                {typeof value === 'boolean' ? (
                    <Checkbox checked={value} onChange={(e) => handleValueChange(e.target.checked)} style={styles.checkbox}>
                        <Text strong style={styles.label}>{itemKey}</Text>
                    </Checkbox>
                ) : typeof value === 'number' ? (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleValueChange(Number(e.target.value))}
                        addonBefore={<span style={styles.label}>{itemKey}</span>}
                        style={styles.input}
                    />
                ) : (
                    <Input
                        value={value || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        addonBefore={<span style={styles.label}>{itemKey}</span>}
                        style={styles.input}
                    />
                )}
            </div>
            {onDelete && (
                <Button danger icon={<DeleteOutlined />} onClick={onDelete} style={{ marginLeft: 8, ...styles.deleteButton }} />
            )}
        </div>
    );
});

JSONPropertyRenderer.displayName = 'JSONPropertyRenderer';
