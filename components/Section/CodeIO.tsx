
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
      fontSize: '12px',
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
        <span style={styles.label}>INPUT (Props)</span>
        <div style={styles.block}>
          {`{
  "radius": `}<span style={styles.value}>48</span>{`,
  "bezel": `}<span style={styles.value}>24</span>{`,
  "intensity": `}<span style={styles.value}>40</span>{`,
  "backdrop": `}<span style={styles.value}>"DOM Elements"</span>{`
}`}
        </div>
      </div>

      {/* PROCESS */}
      <div style={styles.section}>
        <span style={styles.label}>PROCESS (Algorithm)</span>
        <div style={styles.block}>
          <span style={styles.comment}>// 1. Generate Height Map</span>{'\n'}
          <span style={styles.keyword}>const</span> map = <span style={styles.prop}>generateDisplacement</span>(w, h, r);{'\n'}
          {'\n'}
          <span style={styles.comment}>// 2. Chromatic Split</span>{'\n'}
          <span style={styles.keyword}>const</span> red   = <span style={styles.prop}>displacement</span>(map, intensity * 1.0);{'\n'}
          <span style={styles.keyword}>const</span> green = <span style={styles.prop}>displacement</span>(map, intensity * 0.9);{'\n'}
          <span style={styles.keyword}>const</span> blue  = <span style={styles.prop}>displacement</span>(map, intensity * 0.8);{'\n'}
          {'\n'}
          <span style={styles.comment}>// 3. Recombine</span>{'\n'}
          <span style={styles.keyword}>return</span> <span style={styles.prop}>screenBlend</span>(red, green, blue);
        </div>
      </div>

      {/* OUTPUT */}
      <div style={styles.section}>
        <span style={styles.label}>OUTPUT (Render)</span>
        <div style={styles.block}>
          &lt;<span style={styles.keyword}>div</span> style={`{{`} {'\n'}
          {'  '}backdropFilter: <span style={styles.value}>"url(#glass) blur(0px)"</span>{'\n'}
          {`}} /&gt;`}
        </div>
      </div>
    </div>
  );
};
