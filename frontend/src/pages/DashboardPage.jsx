import { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Center, Loader } from '@mantine/core';
import { Server, Activity, AlertTriangle } from 'lucide-react';

// Bileşenleri bir üst klasörden (../components) alıyoruz
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import QualityChart from '../components/QualityChart';
import SignalStrengthChart from '../components/SignalStrengthChart';
import SignalTable from '../components/SignalTable';

const DashboardPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); 
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [houseList, setHouseList] = useState([]);  
  // cursor
  const [cursors, setCursors] = useState([null]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/houses/');
        setHouseList(response.data);
      } catch (error) {
        console.error("Ev listesi hatası:", error);
      }
    };
    fetchHouses();
  }, []);

  const fetchData = async (pageIndex = 0) => {
    try {
      setTableLoading(true);
      
      const currentCursor = cursors[pageIndex];
      const params = { limit: 20 }; 
      
      if (selectedHouse) params.house_id = selectedHouse;
      if (currentCursor) params.cursor = currentCursor;

      const response = await axios.get('http://localhost:8000/api/signals/', { params });
      
      const resultData = response.data.results;
      const nextCursor = response.data.next_cursor;

      setData(resultData);
      setHasNextPage(!!nextCursor);

      if (nextCursor && cursors.length <= pageIndex + 1) {
        setCursors(prev => [...prev, nextCursor]);
      }

    } catch (error) {
      console.error("Veri hatası:", error);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setCursors([null]);
    setCurrentPage(1);
    setHasNextPage(false);
    
    const initialFetch = async () => {
        const params = { limit: 20 };
        if (selectedHouse) params.house_id = selectedHouse;
        try {
            const res = await axios.get('http://localhost:8000/api/signals/', { params });
            setData(res.data.results);
            setHasNextPage(!!res.data.next_cursor);
            if (res.data.next_cursor) setCursors([null, res.data.next_cursor]);
            else setCursors([null]);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    initialFetch();

  }, [selectedHouse]);

  // pagination
  const handleNext = () => {
    if (hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(nextPage - 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchData(prevPage - 1);
    }
  };

  // stats
  const avgSpeed = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.link_speed_mbps || 0), 0) / data.length) : 0;
  const avgPing = data.length > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.latency_ms || 0), 0) / data.length) : 0;
  const maxPacketLoss = data.length > 0 ? Math.max(...data.map(d => d.packet_loss_rate || 0)) : 0;
  const chartData = [...data].reverse();

  return (
    <div className="w-full">
      <Navbar 
        houseList={houseList} 
        selectedHouse={selectedHouse} 
        onHouseChange={setSelectedHouse} 
        onRefresh={() => { setLoading(true); setCurrentPage(1); fetchData(0); }} 
        loading={loading || tableLoading} 
      />

      {loading && data.length === 0 ? (
        <Center h={400}><Loader size="xl" type="bars" /></Center>
      ) : (
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <StatCard title="Ortalama Hız" value={avgSpeed} unit="Mbps" subtext="(Download)" icon={Server} color="blue" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <StatCard title="Ortalama Gecikme" value={avgPing} unit="ms" subtext="(Ping)" icon={Activity} color={avgPing > 100 ? "red" : "orange"} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <StatCard title="Maks. Paket Kaybı" value={`%${maxPacketLoss}`} unit="" subtext="Veri kaybı oranı" icon={AlertTriangle} color={maxPacketLoss > 5 ? "red" : "green"} variant="ring" progressValue={maxPacketLoss} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <QualityChart data={chartData} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <SignalStrengthChart data={chartData} />
          </Grid.Col>

          <Grid.Col span={12}>
            <SignalTable 
              data={data} 
              onNext={handleNext} 
              onPrev={handlePrev} 
              hasNext={hasNextPage} 
              hasPrev={currentPage > 1} 
              page={currentPage} 
              loading={tableLoading}
            />
          </Grid.Col>
        </Grid>
      )}
    </div>
  );
};

export default DashboardPage;