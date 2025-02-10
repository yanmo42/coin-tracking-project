import time
import threading
import logging
import os
import yaml

from twitter_scraper import run_twitter_scraper
from reddit_scraper import run_reddit_scraper
from coingecko_scraper import run_coingecko_scraper

# For illustration, a simple logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scrapers")

SCRAPE_INTERVAL = 300  # 5 minutes

def main_loop():
    while True:
        logger.info("Starting scrapers cycle...")
        threads = []
        for func in [run_twitter_scraper, run_reddit_scraper, run_coingecko_scraper]:
            t = threading.Thread(target=func)
            t.start()
            threads.append(t)

        for t in threads:
            t.join()

        logger.info("Scrapers cycle complete. Sleeping %s seconds...", SCRAPE_INTERVAL)
        time.sleep(SCRAPE_INTERVAL)

if __name__ == "__main__":
    main_loop()
