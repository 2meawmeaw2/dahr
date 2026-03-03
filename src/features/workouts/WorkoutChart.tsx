import { CartesianChart, Line } from 'victory-native';
import { View } from 'react-native';

const data = [
  { day: 1, load: 35 },
  { day: 2, load: 50 },
  { day: 3, load: 42 },
  { day: 4, load: 60 },
  { day: 5, load: 58 },
];

export function WorkoutChart() {
  return (
    <View style={{ height: 240 }}>
      <CartesianChart data={data} xKey="day" yKeys={['load']}>
        {({ points }) => <Line points={points.load} color="#2563EB" strokeWidth={3} />}
      </CartesianChart>
    </View>
  );
}
