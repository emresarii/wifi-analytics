import { Paper, Select, Button, Title, Text } from '@mantine/core';
import { Wifi, Home, RefreshCw } from 'lucide-react';

const Navbar = ({ houseList, selectedHouse, onHouseChange, onRefresh, loading }) => {
  return (
    <Paper shadow="xs" p="md" radius="md" mb="lg" className="bg-white border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Wifi className="text-blue-600" size={32} />
          </div>
          <div>
            <Title order={2} className="text-gray-800">Wifi Mesh Analytics</Title>
            <Text c="dimmed" size="sm">Gerçek zamanlı ağ performansı</Text>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            placeholder="Analiz edilecek evi seçin"
            data={houseList}
            value={selectedHouse}
            onChange={onHouseChange}
            leftSection={<Home size={16} />}
            searchable
            clearable
            size="md"
            className="w-full md:w-72"
          />
          <Button 
            onClick={onRefresh} 
            loading={loading} 
            variant="light" 
            size="md"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>
    </Paper>
  );
};

export default Navbar;