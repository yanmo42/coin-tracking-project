import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import CustomThemeProvider from './ThemeProvider';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <CustomThemeProvider>
    <App />
  </CustomThemeProvider>
);
