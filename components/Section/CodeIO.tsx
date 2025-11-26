
import React from 'react';
import { Theme } from '../../utils/theme';

export const CodeIO: React.FC = () => {
  const styles = {
    wrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: Theme.Space.M,
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: Theme.Space.XS,
    },
    label: {
      ...Theme.Type.Readable.Label.XS,
      color: Theme.Color.Base.Content[3],
      letterSpacing: '0.1em',
    },
    block: {
      ...Theme.Type.Readable.Code.M,
      fontSize: '11px',
      background: 'rgba(0,0,0,0.4)',
      padding: Theme.Space.M,
      borderRadius: Theme.Radius.S,
      color: Theme.Color.Base.Content[2],
      border: `1px solid ${Theme.Color.Base.Surface[3]}`,
      whiteSpace: 'pre-wrap' as const,
      fontFamily: '"JetBrains Mono", monospace',
    },
    keyword: { color: '#FF7B72' },
    prop: { color: '#D2A8FF' },
    value: { color: '#79C0FF' },
    comment: { color: '#6E7681', fontStyle: 'italic' },
  };

  return (
    <div style={styles.wrapper}>
      
      {/* INPUT */}
      <div style={styles.section}>
        <span style={styles.label}>INPUT (Filter Props)</span>
        <div style={styles.block}>
          {`{
  "feDisplacementMap": {
    "in": "SourceGraphic",
    "in2": "displacementMap",
    "scale": `}<span style={styles.value}>30</span>{`,
    "xChannelSelector": "R",
    "yChannelSelector": "G"
  }
}`}
        </div>
      </div>

      {/* PROCESS */}
      <div style={styles.section}>
        <span style={styles.label}>COLOR MAPPING LOGIC</span>
        <div style={styles.block}>
          <span style={styles.comment}>// How pixels map to displacement:</span>{'\n'}
          <span style={styles.comment}>// 0   (0x00) -> Negative Shift (-Scale/2)</span>{'\n'}
          <span style={styles.comment}>// 127 (0x7F) -> Zero Displacement (Neutral)</span>{'\n'}
          <span style={styles.comment}>// 255 (0xFF) -> Positive Shift (+Scale/2)</span>{'\n'}
          {'\n'}
          <span style={styles.keyword}>function</span> <span style={styles.prop}>mapColorToOffset</span>(color) {'{'}{'\n'}
          {'  '}<span style={styles.keyword}>return</span> ((color / 255) - 0.5) * scale;{'\n'}
          {'}'}
        </div>
      </div>

      {/* SURFACE FUNCTION */}
      <div style={styles.section}>
        <span style={styles.label}>SURFACE FUNCTION (Squircle)</span>
        <div style={styles.block}>
          <span style={styles.comment}>// Superellipse SDF approximation</span>{'\n'}
          <span style={styles.keyword}>const</span> u = (x - cx) / rx;{'\n'}
          <span style={styles.keyword}>const</span> v = (y - cy) / ry;{'\n'}
          <span style={styles.comment}>// Implicit Surface Equation (n=4)</span>{'\n'}
          <span style={styles.keyword}>const</span> val = <span style={styles.prop}>pow</span>(<span style={styles.prop}>abs</span>(u), 4) + <span style={styles.prop}>pow</span>(<span style={styles.prop}>abs</span>(v), 4);{'\n'}
          <span style={styles.keyword}>const</span> height = val &gt; 1 ? 0 : 1; 
        </div>
      </div>
    </div>
  );
};
