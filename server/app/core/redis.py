import os
import redis
from dotenv import load_dotenv
from app.utils.log_utils import log

load_dotenv()

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

class RedisClient:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            try:
                cls._instance = redis.Redis(
                    host=REDIS_HOST,
                    port=REDIS_PORT,
                    password=REDIS_PASSWORD,
                    decode_responses=True,
                    socket_timeout=5
                )
                cls._instance.ping()
                log.info(f"Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
            except redis.ConnectionError as e:
                log.error(f"Failed to connect to Redis: {e}")
                cls._instance = None
        return cls._instance

def get_redis_client():
    return RedisClient.get_instance()
