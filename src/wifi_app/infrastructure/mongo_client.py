from pymongo import MongoClient
from django.conf import settings

class MongoDBClient:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            cls._client = MongoClient(settings.MONGO_URI)
        return cls._client

    @classmethod
    def get_db(cls):
        client = cls.get_client()
        return client[settings.MONGO_DB_NAME]