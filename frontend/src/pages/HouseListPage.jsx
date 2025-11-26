import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Grid, Card, Text, Badge, Group, Title, Button, Container, Loader, Center } from '@mantine/core';
import { Home, ArrowRight } from 'lucide-react';

const HouseListPage = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/houses/')
      .then(res => {
        const realHouses = res.data.filter(h => h.value !== '');
        setHouses(realHouses);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ev listesi yüklenirken hata:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <div className="w-full py-6">
      <Title order={2} mb="xl" className="flex items-center gap-2 text-gray-700">
        <Home className="text-blue-600" /> Kayıtlı Mülkler
      </Title>
      
      {houses.length === 0 ? (
        <Text c="dimmed" ta="center" fs="italic">Henüz kayıtlı ev bulunmamaktadır.</Text>
      ) : (
        <Grid gutter="lg">
          {houses.map((house) => (
            <Grid.Col key={house.value} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder className="hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                <div>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={600} size="lg" truncate title={house.label.split(' - ')[0]}>
                      {house.label.split(' - ')[0]}
                    </Text>
                    <Badge color="blue" variant="light">
                      {house.label.split(' - ')[1]}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" mb="lg">
                    Sistem ID: <span className="font-mono text-xs bg-gray-100 p-1 rounded select-all">{house.value}</span>
                  </Text>
                </div>

                <Button 
                  component={Link} 
                  to={`/houses/${house.value}`} 
                  variant="light" 
                  color="blue" 
                  fullWidth 
                  rightSection={<ArrowRight size={16} />}
                >
                  Analiz Raporunu İncele
                </Button>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default HouseListPage;