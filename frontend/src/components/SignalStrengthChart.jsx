import { Card, Title } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SignalStrengthChart = ({ data }) => {
  // Son 30 veriyi göster
  const recentData = data.slice(-30);

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder className="h-full">
      <Title order={4} mb="lg">Sinyal Gücü (RSSI)</Title>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={recentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="room" hide />
            <YAxis domain={[-100, -30]} />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="rssi" name="Sinyal (dBm)">
              {recentData.map((entry, index) => (
                <cell key={`cell-${index}`} fill={entry.rssi > -60 ? '#10b981' : entry.rssi > -75 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SignalStrengthChart;