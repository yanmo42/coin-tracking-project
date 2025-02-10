import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const CustomThemeContext = createContext();

export function useCustomTheme() {
  return useContext(CustomThemeContext);
}

export default function CustomThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        ...(mode === 'dark' && {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          }
        })
      }
    });
  }, [mode]);

  function toggleColorMode() {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  return (
    <CustomThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </CustomThemeContext.Provider>
  );
}
