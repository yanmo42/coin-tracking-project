import os
import json
import logging
from kafka import KafkaConsumer, KafkaProducer
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sentiment_service")

def main():
    kafka_broker = os.getenv("KAFKA_BROKER", "localhost:9092")

    consumer = KafkaConsumer(
        "raw_text_topic",
        bootstrap_servers=[kafka_broker],
        value_deserializer=lambda v: json.loads(v.decode('utf-8')),
        auto_offset_reset='earliest',
        group_id="sentiment-consumers"
    )

    producer = KafkaProducer(
        bootstrap_servers=[kafka_broker],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

    # Download if needed
    # nltk.download('vader_lexicon')
    sia = SentimentIntensityAnalyzer()

    logger.info("Sentiment service started. Listening to raw_text_topic...")

    for message in consumer:
        data = message.value
        platform = data.get("platform")

        if platform in ["twitter", "reddit"]:
            text = ""
            if platform == "twitter":
                text = data.get("text", "")
            else:  # reddit
                title = data.get("title", "")
                body = data.get("selftext", "")
                text = f"{title} {body}"

            scores = sia.polarity_scores(text)
            data["sentiment"] = scores["compound"]
            producer.send("sentiment_topic", data)
            logger.info(f"Emitted sentiment for {platform}, compound={scores['compound']}")

    # (No explicit close; service runs indefinitely)

if __name__ == "__main__":
    main()
