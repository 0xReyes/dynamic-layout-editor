import React, { useMemo, useCallback } from 'react';
import { Tree } from 'antd';
import lodash from 'lodash';

import { generateKeyPath } from '../../utils';
import type { SelectedNode, CustomStyles } from '../../types';

interface ObjectTreeViewProps {
  data: object;
  onChange: (item: SelectedNode) => void;
  height?: number;
  style?: CustomStyles['tree'];
}

export const ObjectTreeView: React.FC<ObjectTreeViewProps> = React.memo(({ data, onChange, height, style }) => {
  const buildTreeData = useCallback((nodes: any, currentPath = ''): any[] => {
    if (!nodes || typeof nodes !== 'object') return [];
    
    return Object.keys(nodes).map((key) => {
      const value = nodes[key];
      const fullPath = generateKeyPath(currentPath, key);
      
      return {
        key: fullPath,
        title: key,
        isLeaf: typeof value !== 'object' || value === null,
        children: value && typeof value === 'object' ? buildTreeData(value, fullPath) : null,
      };
    });
  }, []);
  
  const treeData = useMemo(() => buildTreeData(data), [data, buildTreeData]);
  
  const onSelect = useCallback(
    (selectedKeys: React.Key[], { node }: any) => {
      if (selectedKeys.length > 0) {
        onChange({
          key: node.title,
          value: lodash.get(data, node.key),
          fullPath: node.key,
        });
      }
    },
    [data, onChange]
  );
  
  return (
    <Tree
      showLine
      defaultExpandAll={false}
      onSelect={onSelect}
      treeData={treeData}
      style={{ height, ...style }}
    />
  );
});

ObjectTreeView.displayName = 'ObjectTreeView';
