from rest_framework import serializers

class WifiSignalSerializer(serializers.Serializer):
    house_id = serializers.CharField(max_length=100)
    room = serializers.CharField(max_length=100)
    rssi = serializers.IntegerField()
    device_id = serializers.CharField(max_length=100)
    band = serializers.ChoiceField(choices=["2.4GHz", "5GHz"])
    channel = serializers.IntegerField()
    ssid = serializers.CharField(max_length=100)
    
    link_speed_mbps = serializers.IntegerField(required=False, default=0)
    latency_ms = serializers.IntegerField(required=False, default=0)
    packet_loss_rate = serializers.IntegerField(required=False, default=0)
    bssid = serializers.CharField(max_length=100, required=False, default="")

class HouseRegistrationSerializer(serializers.Serializer):
    house_id = serializers.CharField(max_length=100)
    house_type = serializers.CharField(max_length=100)
    owner_name = serializers.CharField(max_length=100)
    area_sqm = serializers.IntegerField()

class RoomPerformanceSerializer(serializers.Serializer):
    house_id = serializers.CharField()
    room_name = serializers.CharField()
    gaming_score = serializers.IntegerField()
    streaming_score = serializers.IntegerField()
    video_call_score = serializers.IntegerField()
    overall_rating = serializers.IntegerField()
    avg_signal_dbm = serializers.IntegerField()
    avg_speed_mbps = serializers.IntegerField()
    avg_latency_ms = serializers.IntegerField()
    packet_loss_avg = serializers.FloatField()

class PerformanceRecommendationSerializer(serializers.Serializer):
    house_id = serializers.CharField()
    room_recommendations = serializers.DictField() 
    global_recommendation_text = serializers.CharField()
    global_severity = serializers.CharField()