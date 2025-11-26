import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Grid, Card, Text, Title, Badge, Group, 
  Rating, Button, Alert, Loader, Center 
} from '@mantine/core';
import { 
  Gamepad2, Video, ArrowLeft, Signal, Info, AlertTriangle, CheckCircle 
} from 'lucide-react';

const HouseDetailPage = () => {
  const { houseId } = useParams();
  const [roomsMetrics, setRoomsMetrics] = useState([]);
  const [recommendationData, setRecommendationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, recRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/houses/${houseId}/metrics/`),
          axios.get(`http://localhost:8000/api/houses/${houseId}/recommendations/`)
            .catch(() => ({ data: null })) 
        ]);

        setRoomsMetrics(metricsRes.data);
        setRecommendationData(recRes.data);
        
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [houseId]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  };

  if (loading) {
    return <Center h="100vh"><Loader size="xl" /></Center>;
  }

  return (
    <Container size="xl" py="xl">
      {/* Nav */}
      <div className="flex justify-between items-center mb-6">
        <Button component={Link} to="/houses" variant="subtle" leftSection={<ArrowLeft size={16}/>}>
          Listeye Dön
        </Button>
        <Text c="dimmed" size="sm">Rapor Tarihi: {new Date().toLocaleDateString()}</Text>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <Signal size={32} />
        </div>
        <div>
          <Title order={2}>{houseId} Performans Karnesi</Title>
          <Text c="dimmed">Oda bazlı bağlantı kalitesi ve yapay zeka önerileri</Text>
        </div>
      </div>

      {/*Report*/}
      {recommendationData && (
        <Alert 
          variant="light" 
          color={recommendationData.global_severity === 'CRITICAL' ? 'red' : 'blue'} 
          title="Yapay Zeka Genel Değerlendirmesi" 
          icon={<Info size={16} />}
          className="mb-8 shadow-sm border border-gray-200"
        >
          <Text size="md">{recommendationData.global_recommendation_text}</Text>
        </Alert>
      )}      
      <Grid>
        {roomsMetrics.map((room, index) => {
          const roomRec = recommendationData?.room_recommendations?.[room.room_name];

          return (
            <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder className="h-full flex flex-col">
                
                <Group justify="space-between" mb="md">
                  <Title order={4}>{room.room_name}</Title>
                  <Badge size="lg" color={getScoreColor(room.overall_rating)}>
                    Skor: {room.overall_rating}/100
                  </Badge>
                </Group>
                
                <div className="space-y-3 mb-6">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Gamepad2 size={18} className="text-purple-500" />
                      <Text size="sm">Oyun (Gaming)</Text>
                    </Group>
                    <Rating value={room.gaming_score / 20} readOnly count={5} size="xs" />
                  </Group>

                  <Group justify="space-between">
                    <Group gap="xs">
                      <Video size={18} className="text-blue-500" />
                      <Text size="sm">Görüntülü Görüşme</Text>
                    </Group>
                    <Rating value={room.video_call_score / 20} readOnly count={5} size="xs" />
                  </Group>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
                  <Grid>
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Ort. Hız</Text>
                      <Text fw={700}>{room.avg_speed_mbps} Mbps</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Ping</Text>
                      <Text fw={700} c={room.avg_latency_ms > 100 ? 'red' : 'dark'}>
                        {room.avg_latency_ms} ms
                      </Text>
                    </Grid.Col>
                  </Grid>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100">
                  {roomRec ? (
                    <div className={`flex gap-3 items-start p-3 rounded-md text-sm ${roomRec.severity === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <Text fw={600} size="xs" className="uppercase mb-1">{roomRec.action || 'Öneri'}</Text>
                        {roomRec.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-center text-green-600 bg-green-50 p-3 rounded-md text-sm">
                      <CheckCircle size={18} />
                      <Text size="sm">Altyapı sorunsuz çalışıyor.</Text>
                    </div>
                  )}
                </div>

              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Container>
  );
};

export default HouseDetailPage;