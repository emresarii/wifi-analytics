from .mongo_client import MongoDBClient
from ..domain.events import Event
from bson import ObjectId

class MongoEventStore:
    def __init__(self):
        self.db = MongoDBClient.get_db()
        self.collection = self.db['event_store']

    def append(self, event: Event):
        """
        Herhangi bir Domain Event'i (Sinyal, Ev Kaydı, Analiz, Öneri) veritabanına kaydeder.
        """
        event_data = event.to_dict()
        self.collection.insert_one(event_data)

    def get_registered_houses(self):
        """
        Sisteme kayıtlı tüm evleri (HouseRegistered eventlerini) getirir.
        """
        cursor = self.collection.find({"event_type": "HouseRegistered"})
        houses = []
        for doc in cursor:
            house_data = doc.get('payload', {})
            houses.append(house_data)
        return houses

    def get_recent_signals(self, limit=50, house_id=None, cursor=None):
        """
        Son gelen Wifi sinyallerini (WifiSignalCaptured) getirir.
        Cursor Pagination destekler.
        """
        query = {"event_type": "WifiSignalCaptured"}
        
        if house_id:
            query["aggregate_id"] = house_id

        if cursor:
            try:
                query["_id"] = {"$lt": ObjectId(cursor)}
            except:
                pass 

        cursor_result = self.collection.find(query)\
            .sort("_id", -1)\
            .limit(int(limit))
        
        events = list(cursor_result)
        for event in events:
            event['_id'] = str(event['_id'])
            
        return events

    def get_latest_recommendation(self, house_id):
        """
        Belirli bir ev için oluşturulmuş EN SON öneri raporunu (PerformanceRecommendationGenerated) getirir.
        """
        doc = self.collection.find_one(
            {
                "event_type": "PerformanceRecommendationGenerated",
                "aggregate_id": house_id
            },
            sort=[("timestamp", -1)] 
        )
        
        if doc:
            payload = doc.get('payload', {})
            payload['generated_at'] = doc.get('timestamp')
            return payload
        return None

    def get_house_room_metrics(self, house_id):
        """
        Bir evin tüm odaları için hesaplanmış en son performans metriklerini (RoomPerformanceCalculated) getirir.
        """
        cursor = self.collection.find({
            "event_type": "RoomPerformanceCalculated",
            "aggregate_id": house_id
        }).sort("timestamp", -1)
        
        rooms_data = {}
        for doc in cursor:
            payload = doc.get('payload', {})
            room_name = payload.get('room_name')
            
            if room_name and room_name not in rooms_data:
                rooms_data[room_name] = payload
        
        return list(rooms_data.values())