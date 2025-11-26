import uuid
from datetime import datetime
from dataclasses import dataclass, field, asdict


@dataclass
class DomainEvent:
    event_id: str = field(init=False)
    timestamp: datetime = field(init=False)
    
    def __post_init__(self):
        self.event_id = str(uuid.uuid4())
        self.timestamp = datetime.utcnow()

    @property
    def event_type(self) -> str:
        return self.__class__.__name__

    def to_dict(self):
        data = asdict(self)
        payload = {k: v for k, v in data.items() if k not in ['event_id', 'timestamp']}
        aggregate_id = payload.get('house_id')

        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "aggregate_id": aggregate_id,
            "timestamp": self.timestamp.isoformat(),
            "payload": payload
        }

@dataclass
class HouseRegistered(DomainEvent):
    house_id: str
    house_type: str
    owner_name: str
    area_sqm: int
    rooms: list = field(default_factory=list)

@dataclass
class WifiSignalCaptured(DomainEvent):
    house_id: str
    room: str
    rssi: int
    device_id: str
    band: str
    channel: int
    ssid: str
    link_speed_mbps: int = 0
    latency_ms: int = 0
    packet_loss_rate: int = 0
    bssid: str = ""

@dataclass
class RoomPerformanceCalculated(DomainEvent):
    house_id: str
    room_name: str
    gaming_score: int      # Düşük Ping, Düşük Jitter önemli
    streaming_score: int   # Yüksek Hız, Düşük Paket Kaybı önemli
    video_call_score: int  # Stabilite önemli
    overall_rating: int    # Genel ortalama
    avg_signal_dbm: int
    avg_speed_mbps: int
    avg_latency_ms: int
    packet_loss_avg: float

@dataclass
class PerformanceRecommendationGenerated(DomainEvent):
    house_id: str
    room_recommendations: dict 
    global_recommendation_text: str 
    global_severity: str            