import os
import requests
import json
from kafka import KafkaProducer
import logging

logger = logging.getLogger("coingecko_scraper")

def run_coingecko_scraper():
    kafka_broker = os.getenv("KAFKA_BROKER", "localhost:9092")
    producer = KafkaProducer(
        bootstrap_servers=[kafka_broker],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    coins_to_track = ["dogecoin", "shiba-inu", "pepe"]  # add more meme coins as needed
    url = "https://api.coingecko.com/api/v3/coins/markets"

    for coin in coins_to_track:
        try:
            params = {
                "vs_currency": "usd",
                "ids": coin
            }
            resp = requests.get(url, params=params)
            if resp.status_code == 200 and len(resp.json()) > 0:
                info = resp.json()[0]
                message = {
                    "platform": "coingecko",
                    "coin_id": info["id"],
                    "symbol": info["symbol"],
                    "price": info["current_price"],
                    "market_cap": info["market_cap"],
                    "volume": info["total_volume"],
                    "timestamp": info["last_updated"]
                }
                producer.send("price_topic", message)
                logger.info(f"Sent price data for {coin} to price_topic")
            else:
                logger.warning(f"Unexpected response for coin {coin}: {resp.text}")
        except Exception as e:
            logger.error(f"Error during CoinGecko scraping for {coin}: {e}")

    producer.flush()
    producer.close()
