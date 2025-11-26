import io
import qrcode
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from django.http import HttpResponse
from .serializers import WifiSignalSerializer, HouseRegistrationSerializer,RoomPerformanceSerializer,PerformanceRecommendationSerializer
from ..domain.events import WifiSignalCaptured, HouseRegistered, RoomPerformanceCalculated, PerformanceRecommendationGenerated
from ..infrastructure.event_store import MongoEventStore

class IngestWifiSignalView(APIView):
    """
    [POST] Sensörlerden gelen Wi-Fi sinyal verisini karşılar ve Event Store'a yazar.
    """
    def post(self, request):
        serializer = WifiSignalSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            event = WifiSignalCaptured(
                house_id=data['house_id'],
                room=data['room'],
                rssi=data['rssi'],
                device_id=data['device_id'],
                band=data['band'],
                channel=data['channel'],
                ssid=data['ssid'],
                link_speed_mbps=data.get('link_speed_mbps', 0),
                latency_ms=data.get('latency_ms', 0),
                packet_loss_rate=data.get('packet_loss_rate', 0),
                bssid=data.get('bssid', "")
            )
            store = MongoEventStore()
            store.append(event)
            
            return Response({"status": "success", "event_id": event.event_id}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterHouseView(APIView):
    """
    [POST] Yeni bir evi sisteme tanımlar (HouseRegistered eventi oluşturur).
    """
    def post(self, request):
        serializer = HouseRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            event = HouseRegistered(
                house_id=data['house_id'],
                house_type=data['house_type'],
                owner_name=data['owner_name'],
                area_sqm=data['area_sqm']
            )
            
            store = MongoEventStore()
            store.append(event)
            
            return Response({"status": "house registered", "event_id": event.event_id}, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
class WifiSignalListView(APIView):
    """
    [GET] Wifi sinyallerini Cursor Pagination ile döner.
    Format: { "results": [...], "next_cursor": "xyz" }
    """
    def get(self, request):
        store = MongoEventStore()
        house_id_param = request.query_params.get('house_id', None)
        limit_param = request.query_params.get('limit', 50)
        cursor_param = request.query_params.get('cursor', None)
        
        try:
            limit = int(limit_param)
            if limit > 500: limit = 500
        except ValueError:
            limit = 50
        try:
            raw_events = store.get_recent_signals(limit=limit, house_id=house_id_param, cursor=cursor_param)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        clean_data = []
        last_id = None 
        for evt in raw_events:
            payload = evt.get('payload', {})
            mongo_id = evt.get('_id')
            last_id = mongo_id 

            item = {
                "mongo_id": mongo_id,
                "event_id": str(evt.get('event_id')),
                "timestamp": evt.get('timestamp'),
                "house_id": payload.get('house_id'),
                "room": payload.get('room'),
                "rssi": payload.get('rssi'),
                "ssid": payload.get('ssid'),
                "band": payload.get('band'),
                "device_id": payload.get('device_id'),
                "link_speed_mbps": payload.get('link_speed_mbps', 0),
                "latency_ms": payload.get('latency_ms', 0),
                "packet_loss_rate": payload.get('packet_loss_rate', 0),
                "bssid": payload.get('bssid', "")
            }
            clean_data.append(item)

        next_cursor = None
        if len(clean_data) >= limit and last_id:
            next_cursor = last_id
            
        response_data = {
            "results": clean_data,
            "next_cursor": next_cursor
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
class HouseListView(APIView):
    """
    [GET] Kayıtlı evlerin listesini döner
    """
    def get(self, request):
        store = MongoEventStore()
        houses = store.get_registered_houses()
        dropdown_data = []
        dropdown_data.append({
            "value": "", 
            "label": "Tüm Evler (Genel Bakış)"
        })
        
        for h in houses:
            dropdown_data.append({
                "value": h.get('house_id'),
                "label": f"{h.get('owner_name')} - {h.get('house_type')}"
            })
            
        return Response(dropdown_data, status=status.HTTP_200_OK)
    
class IngestMetricsView(APIView):
    """
    [POST] Analiz scriptinden gelen performans metriklerini kaydeder.
    """
    def post(self, request):
        serializer = RoomPerformanceSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            event = RoomPerformanceCalculated(
                house_id=data['house_id'],
                room_name=data['room_name'],
                gaming_score=data['gaming_score'],
                streaming_score=data['streaming_score'],
                video_call_score=data['video_call_score'],
                overall_rating=data['overall_rating'],
                avg_signal_dbm=data['avg_signal_dbm'],
                avg_speed_mbps=data['avg_speed_mbps'],
                avg_latency_ms=data['avg_latency_ms'],
                packet_loss_avg=data['packet_loss_avg']
            )
            store = MongoEventStore()
            store.append(event)
            return Response({"status": "metrics saved"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IngestRecommendationView(APIView):
    """
    [POST] Analiz scriptinden gelen öneri raporlarını kaydeder.
    """
    def post(self, request):
        serializer = PerformanceRecommendationSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            event = PerformanceRecommendationGenerated(
                house_id=data['house_id'],
                room_recommendations=data['room_recommendations'],
                global_recommendation_text=data['global_recommendation_text'],
                global_severity=data['global_severity']
            )
            store = MongoEventStore()
            store.append(event)
            return Response({"status": "recommendation saved"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HouseRoomMetricsView(APIView):
    """
    [GET] Bir evin odalarındaki en son performans verilerini döner.
    Artık EventStore içindeki hazır metodu kullanıyor.
    """
    def get(self, request, house_id):
        store = MongoEventStore()        
        rooms_metrics = store.get_house_room_metrics(house_id)        
        return Response(rooms_metrics, status=status.HTTP_200_OK)

class HouseRecommendationsView(APIView):
    """
    [GET] Bir ev için oluşturulmuş en son öneri raporunu döner.
    """
    def get(self, request, house_id):
        store = MongoEventStore()
        recommendation = store.get_latest_recommendation(house_id)
        
        if recommendation:
            return Response(recommendation, status=status.HTTP_200_OK)
        return Response(None, status=status.HTTP_204_NO_CONTENT)
