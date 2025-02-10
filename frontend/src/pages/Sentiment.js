import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, CircularProgress } from '@mui/material';

export default function Sentiment() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  useEffect(() => {
    axios.get(`${BASE_URL}/api/social-sentiment`)
      .then((res) => {
        const formatted = res.data.map(row => ({
          hour: new Date(row.hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sentiment: parseFloat(row.avg_sentiment)
        }));
        setData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching sentiment:', err);
        setLoading(false);
      });
  }, [BASE_URL]);

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Sentiment Over Last 24 Hours
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <XAxis dataKey="hour" />
            <YAxis domain={[-1, 1]} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Line type="monotone" dataKey="sentiment" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
