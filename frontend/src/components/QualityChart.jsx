import { Card, Title } from '@mantine/core';
import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const QualityChart = ({ data }) => {
  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder className="h-full">
      <Title order={4} mb="lg">Bağlantı Kalitesi Trendi</Title>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="timestamp" tick={false} />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Hız (Mbps)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#f97316" label={{ value: 'Ping (ms)', angle: 90, position: 'insideRight' }}/>
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Area yAxisId="left" type="monotone" dataKey="link_speed_mbps" stroke="#3b82f6" fill="url(#colorSpeed)" name="Hız (Mbps)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="latency_ms" stroke="#f97316" strokeWidth={2} dot={false} name="Ping (ms)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default QualityChart;