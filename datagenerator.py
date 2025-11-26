import requests
import random
from datetime import datetime, timedelta
import time
import concurrent.futures

# --- API AYARLARI ---
BASE_URL = "http://localhost:8000/api"
REGISTER_URL = f"{BASE_URL}/register/house/"
INGEST_SIGNAL_URL = f"{BASE_URL}/ingest/signal/"
INGEST_METRICS_URL = f"{BASE_URL}/ingest/metrics/"
INGEST_REC_URL = f"{BASE_URL}/ingest/recommendations/"

# --- KONFİGÜRASYON ---
TOTAL_HOUSES = 30        # Üretilecek ev sayısı
SIGNALS_PER_HOUSE = 200  # Her ev için üretilecek sinyal sayısı
MAX_WORKERS = 10         # Paralel işlem sayısı

# --- VERİ HAVUZU ---
NAMES = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Veli", "Zeynep", "Elif", "Can", "Cem", "Hakan", "Buse", "Selin", "Deniz", "Ece"]
SURNAMES = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öz", "Arslan", "Doğan", "Kılıç", "Koç", "Kurt", "Eren", "Acar"]
DEVICES = ["iPhone 14 Pro", "Samsung S23", "MacBook Air M2", "iPad Pro", "Xiaomi Robot", "Sony TV", "PS5"]

# Ev Tipleri ve Oda Bazlı Sinyal Kalitesi (Baz Puan: -30 en iyi, -90 en kötü)
HOUSE_TYPES = [
    {
        "type": "Stüdyo Daire", 
        "area": (35, 55), 
        "rooms": {"Salon": -35, "Mutfak": -40, "Banyo": -50} # Her yer iyi
    },
    {
        "type": "2+1 Standart", 
        "area": (85, 110), 
        "rooms": {"Salon": -40, "Mutfak": -55, "Koridor": -45, "Yatak Odası": -65, "Çocuk Odası": -60}
    },
    {
        "type": "Dublex Daire", 
        "area": (140, 180), 
        "rooms": {"Salon (Alt)": -35, "Mutfak (Alt)": -45, "Merdiven": -65, "Yatak Odası (Üst)": -82, "Çalışma Odası (Üst)": -88} # Üst kat kötü
    },
    {
        "type": "Villa Mesh", 
        "area": (250, 400), 
        "rooms": {"Salon": -35, "Mutfak": -38, "Yatak Odası": -40, "Sinema Odası": -35, "Bahçe": -55} # Mesh var, her yer iyi
    }
]

def generate_ap_macs(house_id):
    """Evin sanal modem MAC adreslerini üretir"""
    seed = sum(map(ord, house_id))
    return [f"00:AA:BB:{seed%255:02x}:{i+10:02x}:FF" for i in range(3)]

def calculate_signal_metrics(rssi, band):
    """RSSI değerine göre Hız, Ping ve Paket Kaybı simüle eder"""
    # Kalite katsayısı (0.0 - 1.0 arası)
    quality = max(0, min(1, (100 + rssi) / 70))
    
    # Hız (Band'a göre değişir)
    max_speed = 866 if band == "5GHz" else 300
    link_speed = int(max_speed * quality * random.uniform(0.7, 1.0))
    
    # Ping (Sinyal kötüyse fırlar)
    base_ping = random.randint(5, 15)
    if rssi < -75: latency = base_ping + random.randint(50, 250)
    elif rssi < -60: latency = base_ping + random.randint(20, 60)
    else: latency = base_ping
    
    # Paket Kaybı
    packet_loss = 0
    if rssi < -80: packet_loss = random.uniform(2.0, 15.0)
    elif rssi < -70: packet_loss = random.uniform(0.1, 3.0)
    
    return link_speed, latency, round(packet_loss, 2)

def calculate_performance_score(avg_rssi, avg_latency, avg_loss):
    """Oda verilerine göre karne notu verir"""
    # 1. Gaming Score: Ping ve Jitter önemli
    if avg_latency < 30 and avg_loss < 1: gaming = random.randint(90, 100)
    elif avg_latency < 60: gaming = random.randint(70, 89)
    elif avg_latency < 100: gaming = random.randint(40, 69)
    else: gaming = random.randint(10, 39)
    
    # 2. Streaming Score: Hız ve Stabilite önemli
    if avg_rssi > -60: streaming = random.randint(90, 100)
    elif avg_rssi > -75: streaming = random.randint(70, 89)
    else: streaming = random.randint(30, 60)
    
    # 3. Video Call Score
    video_call = int((gaming + streaming) / 2) + random.randint(-5, 5)
    
    return gaming, streaming, video_call

def get_recommendation(room_name, rssi, house_type):
    """Yapay Zeka Önerisi Üretir"""
    if rssi > -65:
        return {"action": "NONE", "text": "Bağlantı kalitesi mükemmel.", "severity": "INFO"}
    
    if rssi < -80:
        if "Mesh" in house_type:
            return {"action": "CHECK_NODE", "text": "Mesh düğümü arızalı olabilir, kontrol edin.", "severity": "CRITICAL"}
        else:
            return {"action": "MESH_NEEDED", "text": "Sinyal kritik seviyede. Mesh sistemi veya kablolu AP şart.", "severity": "CRITICAL"}
            
    if rssi < -70:
        return {"action": "EXTENDER", "text": "Sinyal zayıf. Menzil genişletici (Extender) önerilir.", "severity": "WARNING"}
        
    return {"action": "OPTIMIZE", "text": "Kanal çakışması olabilir, modem ayarlarını kontrol edin.", "severity": "INFO"}

def process_house(house_template, index):
    """Tek bir ev için TÜM süreçleri (Kayıt -> Sinyal -> Analiz -> Öneri) yönetir"""
    
    # 1. EV OLUŞTURMA
    owner = f"{random.choice(NAMES)} {random.choice(SURNAMES)}"
    house_id = f"ev_{index+1:03d}_{house_template['type'].split()[0].lower()}"
    
    # API: Evi Kaydet
    try:
        requests.post(REGISTER_URL, json={
            "house_id": house_id,
            "house_type": house_template["type"],
            "owner_name": owner,
            "area_sqm": random.randint(*house_template["area"])
        })
    except: pass

    aps = generate_ap_macs(house_id)
    session = requests.Session()
    
    room_stats = {} # Analiz için verileri toplayacağız

    # 2. SİNYAL ÜRETİMİ (Simülasyon)
    for _ in range(SIGNALS_PER_HOUSE):
        room_name = random.choice(list(house_template["rooms"].keys()))
        base_rssi = house_template["rooms"][room_name]
        
        # Gürültü ekle
        current_rssi = base_rssi + random.randint(-7, 7)
        current_rssi = max(min(current_rssi, -30), -95)
        
        band = "5GHz" if current_rssi > -65 else "2.4GHz"
        speed, lat, loss = calculate_signal_metrics(current_rssi, band)
        
        # Veriyi API'ye bas
        payload = {
            "house_id": house_id,
            "room": room_name,
            "rssi": current_rssi,
            "device_id": random.choice(DEVICES),
            "band": band,
            "channel": random.choice([1, 6, 11, 36, 44]),
            "ssid": f"Wifi_{owner.split()[0]}",
            "link_speed_mbps": speed,
            "latency_ms": lat,
            "packet_loss_rate": loss,
            "bssid": random.choice(aps)
        }
        
        try:
            session.post(INGEST_SIGNAL_URL, json=payload)
        except: pass

        # İstatistik toplama (Analiz aşaması için)
        if room_name not in room_stats:
            room_stats[room_name] = {"rssi": [], "lat": [], "loss": [], "speed": []}
        
        room_stats[room_name]["rssi"].append(current_rssi)
        room_stats[room_name]["lat"].append(lat)
        room_stats[room_name]["loss"].append(loss)
        room_stats[room_name]["speed"].append(speed)

    # 3. ANALİZ & KARNE OLUŞTURMA
    room_recommendations_dict = {} # Genel öneri event'i için topla
    
    for room_name, stats in room_stats.items():
        avg_rssi = int(sum(stats["rssi"]) / len(stats["rssi"]))
        avg_lat = int(sum(stats["lat"]) / len(stats["lat"]))
        avg_loss = sum(stats["loss"]) / len(stats["loss"])
        avg_speed = int(sum(stats["speed"]) / len(stats["speed"]))
        
        gaming, streaming, video = calculate_performance_score(avg_rssi, avg_lat, avg_loss)
        overall = int((gaming + streaming + video) / 3)
        
        # Karne Eventi Gönder
        metrics_payload = {
            "house_id": house_id,
            "room_name": room_name,
            "gaming_score": gaming,
            "streaming_score": streaming,
            "video_call_score": video,
            "overall_rating": overall,
            "avg_signal_dbm": avg_rssi,
            "avg_speed_mbps": avg_speed,
            "avg_latency_ms": avg_lat,
            "packet_loss_avg": round(avg_loss, 2)
        }
        try:
            requests.post(INGEST_METRICS_URL, json=metrics_payload)
        except: pass
        
        # Öneri Hesapla
        rec = get_recommendation(room_name, avg_rssi, house_template["type"])
        room_recommendations_dict[room_name] = rec

    # 4. GENEL ÖNERİ RAPORU OLUŞTURMA (AI RECOMMENDATION)
    # Evin genel durumuna bak
    critical_rooms = [r for r, v in room_recommendations_dict.items() if v["severity"] == "CRITICAL"]
    
    if len(critical_rooms) > 0:
        global_text = f"Dikkat! {', '.join(critical_rooms)} odalarında ciddi kapsama sorunu tespit edildi. Acil optimizasyon gerekli."
        global_severity = "CRITICAL"
    elif any(v["severity"] == "WARNING" for v in room_recommendations_dict.values()):
        global_text = "Genel performans iyi ancak bazı kör noktalar mevcut. İyileştirme yapılabilir."
        global_severity = "WARNING"
    else:
        global_text = "Tebrikler! Ev genelinde Wi-Fi performansı mükemmel seviyede."
        global_severity = "INFO"

    rec_payload = {
        "house_id": house_id,
        "room_recommendations": room_recommendations_dict,
        "global_recommendation_text": global_text,
        "global_severity": global_severity
    }
    
    try:
        requests.post(INGEST_REC_URL, json=rec_payload)
    except: pass
    
    print(f"✅ {house_id} tamamlandı: Kayıt + Sinyal + Analiz + Rapor")

def main():
    print(f"🚀 SİMÜLASYON BAŞLIYOR: {TOTAL_HOUSES} Ev İşlenecek...")
    
    # Rastgele ev senaryoları seç
    tasks = []
    for i in range(TOTAL_HOUSES):
        template = random.choice(HOUSE_TYPES)
        tasks.append((template, i))
    
    start_time = time.time()
    
    # Paralel İşleme
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(process_house, t[0], t[1]) for t in tasks]
        concurrent.futures.wait(futures)

    duration = time.time() - start_time
    print(f"\n🏁 BİTTİ! Toplam Süre: {duration:.2f} saniye")

if __name__ == "__main__":
    main()