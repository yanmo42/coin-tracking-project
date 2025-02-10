import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Typography, Button, ButtonGroup, CircularProgress } from '@mui/material';
import { timeParse } from 'd3-time-format';

import {
  ChartCanvas,
  Chart,
  CandlestickSeries,
  LineSeries,
  XAxis,
  YAxis,
  MouseCoordinateY,
  MouseCoordinateX,
  discontinuousTimeScaleProvider
} from "react-financial-charts";

const parseDate = timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

export default function PriceCandlestick() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('candlestick');
  const [socket, setSocket] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

  // Fetch historical data (7 days) on mount
  useEffect(() => {
    axios.get(`${API_URL}/api/price-data/historical?days=7`)
      .then((res) => {
        const hist = res.data.map(item => {
          const date = parseDate(item.timestamp.replace('Z','') + 'Z') || new Date();
          const closePrice = parseFloat(item.price || 0);
          // Artificial O/H/L for demo
          return {
            date,
            open: closePrice - 0.001,
            high: closePrice + 0.002,
            low: closePrice - 0.002,
            close: closePrice,
            volume: item.volume || 0,
          };
        });
        setData(hist);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching historical data:', err);
        setLoading(false);
      });

    // Setup Socket.IO
    const socketIo = io(SOCKET_URL);
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [API_URL, SOCKET_URL]);

  // Listen for new real-time data
  useEffect(() => {
    if (!socket) return;
    socket.on('priceData', (newPrice) => {
      const date = parseDate(newPrice.timestamp.replace('Z','') + 'Z') || new Date();
      const closePrice = parseFloat(newPrice.price || 0);
      const bar = {
        date,
        open: closePrice - 0.001,
        high: closePrice + 0.002,
        low: closePrice - 0.002,
        close: closePrice,
        volume: newPrice.volume || 0,
      };
      setData(prev => [...prev, bar]);
    });

    return () => {
      socket.off('priceData');
    };
  }, [socket]);

  if (loading) {
    return <CircularProgress />;
  }

  // Prepare data for chart
  const scaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
  const { data: chartData, xScale, xAccessor, displayXAccessor } = scaleProvider(data);
  const xExtents = [
    xAccessor(chartData[0] || {}),
    xAccessor(chartData[chartData.length - 1] || {}),
  ];

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Price Candlestick (7-Day History + Live Updates)
      </Typography>
      <ButtonGroup>
        <Button
          variant={chartMode === 'candlestick' ? 'contained' : 'outlined'}
          onClick={() => setChartMode('candlestick')}
        >
          Candlestick
        </Button>
        <Button
          variant={chartMode === 'line' ? 'contained' : 'outlined'}
          onClick={() => setChartMode('line')}
        >
          Line
        </Button>
      </ButtonGroup>

      <div style={{ marginTop: 20, height: 500 }}>
        <ChartCanvas
          height={500}
          width={800}
          ratio={1}
          margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
          data={chartData}
          seriesName="MemeCoin"
          xAccessor={xAccessor}
          xScale={xScale}
          displayXAccessor={displayXAccessor}
          xExtents={xExtents}
        >
          <Chart id={1} yExtents={d => [d.high, d.low]}>
            <XAxis />
            <YAxis />
            <MouseCoordinateY />
            <MouseCoordinateX />

            {chartMode === 'candlestick' ? (
              <CandlestickSeries />
            ) : (
              <LineSeries yAccessor={d => d.close} />
            )}
          </Chart>
        </ChartCanvas>
      </div>
    </div>
  );
}
