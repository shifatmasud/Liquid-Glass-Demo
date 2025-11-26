
import React from 'react';
import { Theme } from '../../utils/theme';
import { BearLink } from '../Core/BearLink';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '4rem 0 2rem',
      color: Theme.Color.Base.Content[3],
      ...Theme.Type.Readable.Label.S,
      textTransform: 'none',
      letterSpacing: '0.1em',
    }}>
      <div>┬┴┬┴┤•ᴥ•ʔ jhey &copy; 2025 ├┬┴┬┴</div>
      <BearLink />
    </footer>
  );
};
