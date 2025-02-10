import os
import praw
from kafka import KafkaProducer
import json
import logging

logger = logging.getLogger("reddit_scraper")

def run_reddit_scraper():
    reddit_client_id = os.getenv("REDDIT_CLIENT_ID")
    reddit_client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    reddit_user_agent = os.getenv("REDDIT_USER_AGENT", "memeCoinScraper/1.0")
    kafka_broker = os.getenv("KAFKA_BROKER", "localhost:9092")

    if not reddit_client_id or not reddit_client_secret:
        logger.warning("Reddit credentials not set; skipping Reddit scraper.")
        return

    reddit = praw.Reddit(
        client_id=reddit_client_id,
        client_secret=reddit_client_secret,
        user_agent=reddit_user_agent,
    )
    producer = KafkaProducer(
        bootstrap_servers=[kafka_broker],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    subs = ["CryptoMoonShots", "CryptoCurrency", "MemeCoins"]
    try:
        for sub_name in subs:
            subreddit = reddit.subreddit(sub_name)
            for post in subreddit.new(limit=50):
                message = {
                    "platform": "reddit",
                    "post_id": post.id,
                    "title": post.title,
                    "selftext": post.selftext,
                    "created_utc": float(post.created_utc)
                }
                producer.send("raw_text_topic", message)
                logger.info(f"Sent Reddit post {post.id} to raw_text_topic")
    except Exception as e:
        logger.error(f"Error during Reddit scraping: {e}")

    producer.flush()
    producer.close()
