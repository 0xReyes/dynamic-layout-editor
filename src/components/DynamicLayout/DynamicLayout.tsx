import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Card, Tabs, Typography } from 'antd';
import lodash from 'lodash';
import { useMultiSize } from '../../hooks/useMultiSize';
import { ObjectTreeView } from '../ObjectTreeView';
import { JSONPropertyRenderer } from '../JSONPropertyRenderer';
import { JSONEditor } from '../JSONEditor';
import { defaultStyles } from '../../styles/defaultStyles';
import type { CustomStyles, SelectedItem } from '../../types';

const { Text } = Typography;

interface DynamicLayoutProps {
  configuration: object;
  onUpdate?: (updatedConfig: object) => void;
  leftPanelWidth?: number;
  rightPanelWidth?: number;
  styles?: CustomStyles;
  defaultActiveTab?: 'tree' | 'json';
}

export const DynamicLayout: React.FC<DynamicLayoutProps> = ({
  configuration,
  onUpdate = () => {},
  leftPanelWidth = 20,
  rightPanelWidth = 80,
  styles: customStyles = {},
  defaultActiveTab = 'tree',
}) => {
  const [data, setData] = useState(configuration);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const { setRef, sizes } = useMultiSize();

  const styles = useMemo(() => ({ ...defaultStyles, ...customStyles }), [customStyles]);

  const treeHeight = useMemo(() => {
    const navHeight = sizes.navContainer?.height || 0;
    return Math.max(navHeight - 80, 200); // 80px for card header padding etc.
  }, [sizes.navContainer]);

  const handleChange = useCallback((path: string, newValue: any) => {
    setData((prev) => {
      const newData = lodash.cloneDeep(prev);
      lodash.set(newData, path, newValue);
      return newData;
    });
  }, []);

  const handleJsonChange = useCallback((newData: object) => setData(newData), []);
  
  const handleDeleteItem = useCallback((path: string) => {
    const pathParts = path.match(/[^.[\]]+/g) || [];
    const key = pathParts.pop();
    if (!key) return;

    const parentPath = pathParts.join('.');
    
    setData(prev => {
        const newData = lodash.cloneDeep(prev);
        const parent = parentPath ? lodash.get(newData, parentPath) : newData;

        if (Array.isArray(parent)) {
            parent.splice(Number(key), 1);
        } else if (parent && typeof parent === 'object') {
            delete (parent as any)[key];
        }
        
        return newData;
    });
    setSelectedItem(null);
  }, []);


  useEffect(() => {
    onUpdate(data);
    if (selectedItem) {
      const freshValue = lodash.get(data, selectedItem.fullPath);
      if (JSON.stringify(freshValue) !== JSON.stringify(selectedItem.value)) {
        setSelectedItem((prev) => prev ? ({ ...prev, value: freshValue }) : null);
      }
    }
  }, [data, onUpdate, selectedItem]);

  const getColSpans = (width: number) => ({
    xs: { span: 24 }, sm: { span: 24 }, md: { span: Math.round(width / 100 * 24) }
  });

  const leftCol = getColSpans(leftPanelWidth);
  const rightCol = getColSpans(rightPanelWidth);
  
  const tabItems = [
    {
      label: 'Tree Editor',
      key: 'tree',
      children: (
        <div style={{ padding: 16, ...styles.treeEditorContainer }}>
          {selectedItem ? (
            <JSONPropertyRenderer
              itemKey={selectedItem.key}
              value={selectedItem.value}
              path={selectedItem.fullPath}
              onChange={handleChange}
              onDelete={() => handleDeleteItem(selectedItem.fullPath)}
              styles={styles}
            />
          ) : (
            <div style={{ ...styles.flexCenter, minHeight: 300, ...styles.emptyState }}>
              <Text type="secondary" style={styles.emptyText}>
                Select an item from the navigator to begin editing.
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'JSON Editor',
      key: 'json',
      children: <JSONEditor value={data} onChange={handleJsonChange} styles={styles} />,
    },
  ];

  return (
    <Row gutter={[20, 20]} style={styles.root}>
      <Col {...leftCol}>
        <div style={styles.stickyNav} ref={setRef('navContainer')}>
          <Card title="Object Navigator" style={{ ...styles.card, height: '100%' }}>
            <ObjectTreeView
              data={data}
              onChange={setSelectedItem}
              height={treeHeight}
              style={styles.tree}
            />
          </Card>
        </div>
      </Col>
      <Col {...rightCol}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'tree' | 'json')}
          centered
          items={tabItems}
          style={styles.tabs}
        />
      </Col>
    </Row>
  );
};
