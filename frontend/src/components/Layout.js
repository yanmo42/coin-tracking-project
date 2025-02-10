import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCustomTheme } from '../ThemeProvider';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function Layout({ children }) {
  const { mode, toggleColorMode } = useCustomTheme();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Meme Coin Dashboard
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/sentiment">Sentiment</Button>
          <Button color="inherit" component={Link} to="/prices">Prices</Button>
          <Button color="inherit" component={Link} to="/candlestick">Candlestick</Button>
          <IconButton color="inherit" onClick={toggleColorMode}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{ margin: 20 }}>
        {children}
      </div>
    </>
  );
}
