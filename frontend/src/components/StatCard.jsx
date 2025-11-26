import { Card, Text, Group, ThemeIcon, RingProgress, Center } from '@mantine/core';

const StatCard = ({ title, value, unit, subtext, icon: Icon, color, variant = 'default', progressValue }) => {
  
  if (variant === 'ring') {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder className="flex flex-row items-center justify-between h-full">
        <div>
          <Text fw={500} c="dimmed" mb={5}>{title}</Text>
          <Text fz="2.5rem" fw={700} className={`text-${color}-600 leading-none`}>
            {value}{unit}
          </Text>
          <Text size="sm" c="dimmed" mt="xs">{subtext}</Text>
        </div>
        <RingProgress
          size={90}
          thickness={8}
          roundCaps
          sections={[{ value: progressValue, color: color }]}
          label={
            <Center>
              <Icon size={24} className={`text-${color}-500`} />
            </Center>
          }
        />
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full">
      <Group justify="space-between" mb="xs">
        <Text fw={500} c="dimmed">{title}</Text>
        <ThemeIcon variant="light" color={color}>
          <Icon size={18} />
        </ThemeIcon>
      </Group>
      <Text fz="2.5rem" fw={700} className={`text-${color}-600 leading-none`}>
        {value}
      </Text>
      <Text size="sm" c="dimmed" mt="xs">{unit} {subtext}</Text>
    </Card>
  );
};

export default StatCard;