import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, CircularProgress } from '@mui/material';

export default function Prices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    axios.get(`${BASE_URL}/api/price-data`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching price data:', err);
        setLoading(false);
      });
  }, [BASE_URL]);

  // We’ll just show a line chart of "price" over time for all coins combined
  // For multiple coins, you'd separate them or do a groupBy
  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Prices (Last 24h)
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            {data.map((item, index) => (
              <Line
                key={index}
                data={[item]} // not ideal for single points, you'd group them
                dataKey={() => parseFloat(item.price)}
                name={item.coin_id}
                stroke="#82ca9d"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
