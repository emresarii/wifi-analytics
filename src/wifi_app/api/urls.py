from django.urls import path
from .views import (
    IngestWifiSignalView, 
    RegisterHouseView, 
    WifiSignalListView,
    HouseListView,
    IngestRecommendationView,
    IngestMetricsView,
    HouseRoomMetricsView,
    HouseRecommendationsView
)

urlpatterns = [
    # POST
    # Sensörlerden gelen ham sinyalleri kaydeder
    path('ingest/signal/', IngestWifiSignalView.as_view(), name='ingest-signal'),
    # Analiz scriptinden gelen oda performans skorlarını kaydeder
    path('ingest/metrics/', IngestMetricsView.as_view(), name='ingest-metrics'),
    # Analiz scriptinden gelen yapay zeka önerilerini kaydeder
    path('ingest/recommendations/', IngestRecommendationView.as_view(), name='ingest-recommendations'),
    # Yeni bir ev kaydeder
    path('register/house/', RegisterHouseView.as_view(), name='register-house'),    
    # GET
    # Kayıtlı tüm evlerin listesini döner (Dropdown için)
    path('houses/', HouseListView.as_view(), name='house-list'),
    # Bir evin odalarındaki performans metriklerini döner (Detay sayfası için)
    path('houses/<str:house_id>/metrics/', HouseRoomMetricsView.as_view(), name='house-room-metrics'),
    # Bir ev için oluşturulmuş en son öneri raporunu döner
    path('houses/<str:house_id>/recommendations/', HouseRecommendationsView.as_view(), name='house-recommendations'),   
    # Ham sinyal listesini döner (Dashboard grafikleri için)
    path('signals/', WifiSignalListView.as_view(), name='get-signals'),
]