import os
import tweepy
from kafka import KafkaProducer
import json
import logging

logger = logging.getLogger("twitter_scraper")

def run_twitter_scraper():
    bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
    kafka_broker = os.getenv("KAFKA_BROKER", "localhost:9092")
    if not bearer_token:
        logger.warning("TWITTER_BEARER_TOKEN not set; skipping Twitter scraper.")
        return

    producer = KafkaProducer(
        bootstrap_servers=[kafka_broker],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    client = tweepy.Client(bearer_token=bearer_token)
    query = "memecoin OR doge OR shib -is:retweet lang:en"
    try:
        tweets = client.search_recent_tweets(query=query, max_results=50)
        if tweets.data:
            for tweet in tweets.data:
                message = {
                    "platform": "twitter",
                    "tweet_id": tweet.id,
                    "text": tweet.text,
                    "created_at": str(tweet.created_at) if tweet.created_at else None
                }
                producer.send("raw_text_topic", message)
                logger.info(f"Sent tweet {tweet.id} to raw_text_topic")
        else:
            logger.info("No tweets found.")
    except Exception as e:
        logger.error(f"Error during Twitter scraping: {e}")

    producer.flush()
    producer.close()
