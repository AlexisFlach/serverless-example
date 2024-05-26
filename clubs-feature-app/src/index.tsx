import React from 'react';
import { createRoot } from 'react-dom/client';
import ClubsFeature from './ClubsFeature';

const container = document.getElementById('root');
const root = createRoot(container!); // Non-null assertion
root.render(
  <div
    style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <ClubsFeature />
  </div>
);
