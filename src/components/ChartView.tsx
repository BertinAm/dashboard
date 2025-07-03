import React from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

export type ChartType = 'pie' | 'bar' | 'line';

interface ChartViewProps {
  type: ChartType;
  data: any;
  options?: any;
  title?: string;
}

export default function ChartView({ type, data, options, title }: ChartViewProps) {
  return (
    <div className="bg-[#131a2a] rounded-lg p-6 shadow-md flex flex-col items-center min-h-[200px] w-full">
      {title && <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>}
      {type === 'pie' && <Pie data={data} options={options} />}
      {type === 'bar' && <Bar data={data} options={options} />}
      {type === 'line' && <Line data={data} options={options} />}
    </div>
  );
} 