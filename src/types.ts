import type { CSSProperties } from 'react';

export interface CustomStyles {
  root?: CSSProperties;
  card?: CSSProperties;
  input?: CSSProperties;
  propertyRow?: CSSProperties;
  stickyNav?: CSSProperties;
  jsonEditor?: CSSProperties;
  tree?: CSSProperties;
  treeEditorContainer?: CSSProperties;
  emptyState?: CSSProperties;
  emptyText?: CSSProperties;
  tabs?: CSSProperties;
  label?: CSSProperties;
  checkbox?: CSSProperties;
  deleteButton?: CSSProperties;
  addButton?: CSSProperties;
  modal?: CSSProperties;
  select?: CSSProperties;
  buttonContainer?: CSSProperties;
  applyButton?: CSSProperties;
}

export interface SelectedItem {
  key: string;
  value: any;
  fullPath: string;
}
