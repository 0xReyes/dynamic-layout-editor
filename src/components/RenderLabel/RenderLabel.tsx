import React from "react";
import { Typography } from "antd";
import type { CustomStyles } from '../../types';

const { Title } = Typography;

interface RenderLabelProps {
  dataKey: string;
  styles?: CustomStyles;
}

export const RenderLabel: React.FC<RenderLabelProps> = ({ dataKey, styles = {} }) => {
  return (
    <Title level={4} style={styles.label}>
      {dataKey}
    </Title>
  );
};
