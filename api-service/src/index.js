require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const { Server } = require('socket.io');
const { Kafka } = require('kafkajs');

const app = express();
app.use(cors());
app.use(express.json());

// Wrap express in HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Postgres pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'meme_coins',
  port: 5432
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ============ REST Endpoints ===========

// Example: last 24h sentiment average by hour
app.get('/api/social-sentiment', async (req, res) => {
  try {
    const query = `
      SELECT date_trunc('hour', created_at) AS hour,
             AVG(sentiment_score) AS avg_sentiment,
             COUNT(*) AS count
      FROM social_data
      WHERE created_at >= NOW() - INTERVAL '24 HOURS'
      GROUP BY hour
      ORDER BY hour ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Historical price data with variable days
app.get('/api/price-data/historical', async (req, res) => {
  try {
    const days = parseInt(req.query.days || "7", 10);
    const query = `
      SELECT coin_id, symbol, price, volume, market_cap, timestamp
      FROM price_data
      WHERE timestamp >= NOW() - INTERVAL '${days} DAYS'
      ORDER BY timestamp ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example: quick 24h price data
app.get('/api/price-data', async (req, res) => {
  try {
    const query = `
      SELECT coin_id, symbol, price, volume, market_cap, timestamp
      FROM price_data
      WHERE timestamp >= NOW() - INTERVAL '24 HOURS'
      ORDER BY timestamp ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example: top posts by sentiment
app.get('/api/top-posts', async (req, res) => {
  const direction = req.query.direction === 'asc' ? 'ASC' : 'DESC';
  const limit = parseInt(req.query.limit || 10, 10);
  try {
    const query = `
      SELECT platform, reference_id, text_content, sentiment_score, created_at
      FROM social_data
      ORDER BY sentiment_score ${direction}
      LIMIT $1;
    `;
    const result = await pool.query(query, [limit]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected via Socket.IO:', socket.id);
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ============ Kafka Consumer for Real-Time Data ============

(async () => {
  try {
    const kafkaBroker = process.env.KAFKA_BROKER || 'kafka:9092';
    const kafka = new Kafka({ clientId: 'api-service', brokers: [kafkaBroker] });

    const consumer = kafka.consumer({ groupId: 'api-svc-consumers' });
    await consumer.connect();
    console.log('Kafka consumer connected.');

    // Listen to new price data from aggregator
    await consumer.subscribe({ topic: 'price_topic', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (topic === 'price_topic') {
          const rawValue = message.value.toString();
          let data;
          try {
            data = JSON.parse(rawValue);
          } catch (err) {
            console.error('Error parsing price_topic message:', err);
            return;
          }
          console.log('New price data from aggregator:', data);
          // Broadcast to all connected clients
          io.emit('priceData', data);
        }
      },
    });
  } catch (e) {
    console.error('Kafka consumer error:', e);
  }
})();

// Start server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`API + Socket.IO service running on port ${PORT}`);
});
