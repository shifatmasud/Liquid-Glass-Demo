import React from 'react';
import { createRoot } from 'react-dom/client';
import { MetaGlassApp } from './flat';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <MetaGlassApp />
    </React.StrictMode>
  );
}
