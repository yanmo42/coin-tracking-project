import os
import json
import logging
from kafka import KafkaConsumer
import psycopg2

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aggregator")

def connect_db():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "db"),
        dbname=os.getenv("POSTGRES_DB", "meme_coins"),
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "postgres"),
    )

def main():
    kafka_broker = os.getenv("KAFKA_BROKER", "localhost:9092")
    db_conn = connect_db()
    db_conn.autocommit = True
    cursor = db_conn.cursor()

    # Ensure tables exist (Alembic does this, but no harm in checks)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS social_data (
            id SERIAL PRIMARY KEY,
            platform TEXT,
            reference_id TEXT,
            text_content TEXT,
            sentiment_score REAL,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS price_data (
            id SERIAL PRIMARY KEY,
            coin_id TEXT NOT NULL,
            symbol TEXT,
            price NUMERIC,
            market_cap NUMERIC,
            volume NUMERIC,
            timestamp TIMESTAMP
        );
    """)

    consumer = KafkaConsumer(
        "sentiment_topic",
        "price_topic",
        bootstrap_servers=[kafka_broker],
        value_deserializer=lambda v: json.loads(v.decode('utf-8')),
        auto_offset_reset='earliest',
        group_id="aggregator-consumers"
    )

    logger.info("Aggregator listening on sentiment_topic & price_topic...")

    for message in consumer:
        topic = message.topic
        data = message.value

        if topic == "sentiment_topic":
            # Insert into social_data
            platform = data.get("platform")
            sentiment = data.get("sentiment", 0.0)
            if platform == "twitter":
                ref_id = data.get("tweet_id")
                text = data.get("text", "")
            else:
                ref_id = data.get("post_id")
                text = (data.get("title", "") + " " + data.get("selftext", "")).strip()

            insert_sql = """
                INSERT INTO social_data (platform, reference_id, text_content, sentiment_score)
                VALUES (%s, %s, %s, %s)
            """
            try:
                cursor.execute(insert_sql, (platform, ref_id, text, sentiment))
                logger.info(f"Inserted row into social_data, platform={platform}, sentiment={sentiment}")
            except Exception as e:
                logger.error(f"Error inserting into social_data: {e}")

        elif topic == "price_topic":
            # Insert into price_data
            try:
                coin_id = data["coin_id"]
                symbol = data["symbol"]
                price = data["price"]
                market_cap = data["market_cap"]
                volume = data["volume"]
                ts = data["timestamp"]

                insert_sql = """
                    INSERT INTO price_data (coin_id, symbol, price, market_cap, volume, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(insert_sql, (coin_id, symbol, price, market_cap, volume, ts))
                logger.info(f"Inserted row into price_data, coin={coin_id}, price={price}")
            except Exception as e:
                logger.error(f"Error inserting into price_data: {e}")

    cursor.close()
    db_conn.close()

if __name__ == "__main__":
    main()
