import React from 'react';
import { Typography } from '@mui/material';

export default function Home() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Welcome to the Meme Coin Dashboard
      </Typography>
      <Typography variant="body1">
        Use the navigation to explore sentiment trends, price data, and live candlestick charts.
      </Typography>
    </div>
  );
}
