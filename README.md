# 🚀 Coin Tracking Project

## 🔥 Overview
The **Coin Tracking Project** is a **full-stack application** that gathers **real-time social sentiment** and **price data** for meme coins. It provides **live tracking**, **historical analysis**, and **real-time charts** using **Kafka, PostgreSQL, Flask, Node.js, and React**.

### 📌 Features
- **📡 Real-time Social Media Sentiment** (Twitter & Reddit)
- **📊 Historical & Live Price Data** (CoinGecko API)
- **📈 Candlestick & Line Charts**
- **📡 WebSocket Streaming (Socket.IO)**
- **🌓 Dark Mode UI**
- **📦 Fully Dockerized for Easy Deployment**

## ⚙️ Architecture
```
coin-tracking-project/
├── alembic/           # Database migrations
├── api-service/       # Node.js API + WebSockets
├── aggregator/        # Kafka consumer storing data in PostgreSQL
├── sentiment/         # Sentiment analysis service
├── scrapers/          # Twitter, Reddit, and CoinGecko data scrapers
├── frontend/          # React UI with real-time charts
├── docker-compose.yml # Containerized multi-service setup
└── README.md          # Documentation
```

## 🚀 Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yanmo42/coin-tracking-project.git
cd coin-tracking-project
```

### 2️⃣ Create a `.env` File
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=superSecure
POSTGRES_DB=coin_tracking
POSTGRES_HOST=db
KAFKA_BROKER=kafka:9092

TWITTER_BEARER_TOKEN=YOUR_TWITTER_BEARER_TOKEN
REDDIT_CLIENT_ID=YOUR_REDDIT_CLIENT_ID
REDDIT_CLIENT_SECRET=YOUR_REDDIT_CLIENT_SECRET
REDDIT_USER_AGENT=YourApp/1.0

REACT_APP_API_URL=http://localhost:8080
REACT_APP_SOCKET_URL=http://localhost:8080
```

### 3️⃣ Build & Start Containers
```bash
docker-compose up --build -d
```

### 4️⃣ Access the Application
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **API Service**: [http://localhost:8080](http://localhost:8080)

## 📡 API Endpoints
| Endpoint | Description |
|----------|------------|
| `GET /api/price-data` | Fetches last 24h price data |
| `GET /api/price-data/historical?days=7` | Fetches historical price data |
| `GET /api/social-sentiment` | Returns 24h sentiment average |
| `WS /priceData` | WebSocket stream for price updates |

## 📅 Roadmap
✔️ **Live price & sentiment tracking**  
✔️ **Candlestick & line chart visualization**  
🚀 **AI-enhanced sentiment analysis**  
🚀 **Alert system for price spikes**  
🚀 **User authentication & watchlists**  

## 🛠 Troubleshooting
**Kafka Connection Issues**  
```bash
docker-compose down
docker volume prune
docker-compose up --build -d
```

**Database Issues**  
```bash
docker-compose logs db
docker volume rm coin-tracking-project_db_data
```

## 🎯 Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit and push (`git push origin feature-name`).
4. Open a pull request!

## 📜 License
This project is licensed under **MIT License**.



🚀 **Happy Building!**
