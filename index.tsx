import React from 'react';
import { createRoot } from 'react-dom/client';
import { MetaGlassApp } from './components/App/MetaGlassApp';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <MetaGlassApp />
    </React.StrictMode>
  );
}
