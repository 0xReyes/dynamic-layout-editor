import { CSSProperties } from 'react';

export const defaultStyles: { [key: string]: CSSProperties } = {
  root: {
    padding: 20,
    minHeight: '100vh',
    background: '#f0f2f5',
  },
  card: {
    borderRadius: 8,
  },
  input: {
    borderRadius: 8,
    border: '1px solid #84B4B4',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  centered: {
    textAlign: 'center',
    display: 'block',
    width: '100%',
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
  },
  stickyNav: {
    position: 'sticky',
    top: 20,
    height: 'calc(100vh - 40px)',
    overflowY: 'auto',
    zIndex: 100,
  },
  jsonEditor: {
    width: '100%',
    minHeight: 500,
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 10,
    border: '1px solid #d9d9d9',
    borderRadius: 8,
  },
  tree: {
    height: '100%',
    overflowY: 'auto',
  },
};
