import { Card, Group, Title, Badge, Table, Text, Button, Center, ActionIcon } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SignalTable = ({ data, onNext, onPrev, hasNext, hasPrev, page, loading }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={5}>Canlı Veri Akışı</Title>
        <Badge color="gray" variant="light" size="lg">{data.length} Kayıt (Sayfa {page})</Badge>
      </Group>
      <div className="min-h-[400px] border border-gray-200 rounded-lg mb-4 relative">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead className="bg-gray-50">
            <Table.Tr>
              <Table.Th>Zaman</Table.Th>
              <Table.Th>Ev ID</Table.Th>
              <Table.Th>Oda</Table.Th>
              <Table.Th>Hız</Table.Th>
              <Table.Th>Ping</Table.Th>
              <Table.Th>Kayıp</Table.Th>
              <Table.Th>BSSID (Node)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, i) => (
              <Table.Tr key={row.mongo_id || i}>
                <Table.Td className="text-xs text-gray-500 w-32 whitespace-nowrap">
                  {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : '-'}
                </Table.Td>
                <Table.Td><Text size="sm" fw={500}>{row.house_id}</Text></Table.Td>
                <Table.Td>{row.room}</Table.Td>
                <Table.Td>
                  <Text fw={700} c="blue" size="sm">{row.link_speed_mbps} Mbps</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={row.latency_ms > 100 ? 'red' : 'teal'} variant="light">
                    {row.latency_ms} ms
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {row.packet_loss_rate > 0 ? (
                    <Badge color="red" variant="filled">{row.packet_loss_rate}%</Badge>
                  ) : (
                    <Text size="sm" c="dimmed">0%</Text>
                  )}
                </Table.Td>
                <Table.Td className="font-mono text-xs text-gray-400">{row.bssid || 'N/A'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        
        {data.length === 0 && !loading && (
          <Center h={200} c="dimmed">Veri bulunamadı</Center>
        )}
        
        {loading && (
           <Center h={400} className="absolute inset-0 bg-white/80 z-10">
             <Text fw={500} c="blue">Yükleniyor...</Text>
           </Center>
        )}
      </div>
      <Group justify="space-between" align="center">
        <Button 
          variant="default" 
          onClick={onPrev} 
          disabled={!hasPrev || loading}
          leftSection={<ChevronLeft size={18} />}
        >
          Önceki
        </Button>
        
        <Text size="sm" c="dimmed">Sayfa {page}</Text>
        
        <Button 
          variant="default" 
          onClick={onNext} 
          disabled={!hasNext || loading}
          rightSection={<ChevronRight size={18} />}
        >
          Sonraki
        </Button>
      </Group>
    </Card>
  );
};

export default SignalTable;