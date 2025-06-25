import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Card, Tabs, Typography } from 'antd';
import { cloneDeep, set, get } from 'lodash';
import useMultiSize from '../../hooks/useMultiSize';
import { ObjectTreeView } from '../ObjectTreeView';
import { JSONPropertyRenderer } from '../JSONPropertyRenderer';
import { JSONEditor } from '../JSONEditor';
import { defaultStyles } from '../../styles/defaultStyles';
import type { CustomStyles, SelectedNode } from '../../types';

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
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const { setRef, sizes } = useMultiSize();

  const styles = useMemo(() => ({ ...defaultStyles, ...customStyles }), [defaultStyles, customStyles]);

  const treeHeight = useMemo(() => {
    const navHeight = sizes.navContainer?.height || 0;
    return Math.max(navHeight - 80, 200); // 80px for card header padding etc.
  }, [sizes.navContainer]);

  const handleChange = useCallback((path: string, newValue: any) => {
    setData(prev => {
      const newData = cloneDeep(prev);
      set(newData, path, newValue);
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
      const newData = cloneDeep(prev);
      const parent = parentPath ? get(newData, parentPath) : newData;

      if (Array.isArray(parent)) {
        parent.splice(Number(key), 1);
      } else if (parent && typeof parent === 'object') {
        delete parent[key];
      }
      
      return newData;
    });
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    onUpdate(data);
    if (selectedNode) {
      const freshValue = get(data, selectedNode.fullPath);
      if (JSON.stringify(freshValue) !== JSON.stringify(selectedNode.value)) {
        setSelectedNode(prev => prev ? ({ ...prev, value: freshValue }) : null);
      }
    }
  }, [data, onUpdate, selectedNode]);

  const getColSpans = useCallback((width: number) => ({
    xs: 24, 
    sm: 24, 
    md: Math.round(width / 100 * 24)
  }), []);

  const leftCol = useMemo(() => getColSpans(leftPanelWidth), [leftPanelWidth, getColSpans]);
  const rightCol = useMemo(() => getColSpans(rightPanelWidth), [rightPanelWidth, getColSpans]);
  
  const tabItems = useMemo(() => [
    {
      label: 'Tree Editor',
      key: 'tree',
      children: (
        <div style={{ padding: 16, ...styles.treeEditorContainer }}>
          {selectedNode ? (
            <JSONPropertyRenderer
              itemKey={selectedNode.key}
              data={data}
              path={selectedNode.fullPath}
              onChange={handleChange}
              onDelete={() => handleDeleteItem(selectedNode.fullPath)}
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
  ], [data, handleChange, handleDeleteItem, selectedNode, styles]);

  return (
    <Row gutter={[20, 20]} style={styles.root}>
      <Col xs={leftCol.xs} sm={leftCol.sm} md={leftCol.md}>
        <div style={styles.stickyNav} ref={setRef('navContainer')}>
          <Card title="Object Navigator" style={{ ...styles.card, height: '100%' }}>
            <ObjectTreeView
              data={data}
              onChange={setSelectedNode}
              height={treeHeight}
              style={styles.tree}
            />
          </Card>
        </div>
      </Col>
      <Col xs={rightCol.xs} sm={rightCol.sm} md={rightCol.md}>
        <Tabs
          activeKey={activeTab}
          onChange={(activeKey) => setActiveTab(activeKey as 'tree' | 'json')}
          centered
          items={tabItems}
          style={styles.tabs}
        />
      </Col>
    </Row>
  );
};