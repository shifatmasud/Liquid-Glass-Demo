
import React from 'react';
import { Theme } from '../../utils/theme';

const apps = [
  { name: 'Beeper', img: 'https://assets.codepen.io/605876/beeper.png' },
  { name: 'Cursor', img: 'https://assets.codepen.io/605876/cursor.png' },
  { name: 'Screen Studio', img: 'https://assets.codepen.io/605876/screenstudio.png' },
  { name: 'Raycast', img: 'https://assets.codepen.io/605876/raycast.png' },
  { name: 'Photos', img: 'https://assets.codepen.io/605876/photos.png' },
  { name: 'Signal', img: 'https://assets.codepen.io/605876/signal.png' },
  { name: 'Spotify', img: 'https://assets.codepen.io/605876/spotify.png' },
  { name: 'Brave', img: 'https://assets.codepen.io/605876/brave.png' },
];

export const SnippetApps: React.FC = () => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: '2rem',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
    }}>
      {apps.map((app) => (
        <div key={app.name} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <img 
            src={app.img} 
            alt={app.name} 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          />
          <span style={{
            ...Theme.Type.Readable.Label.S,
            textTransform: 'none',
            opacity: 0.8,
            textAlign: 'center'
          }}>{app.name}</span>
        </div>
      ))}
    </div>
  );
};
