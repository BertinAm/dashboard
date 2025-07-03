'use client';

import { useScanStats } from '@/lib/hooks';
import MetricsCard from '@/components/MetricsCard';
import Layout from '@/components/Layout';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import ChartView from '@/components/ChartView';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function MetricsPage() {
  const { data: stats, isLoading, error } = useScanStats();

  // Mocked alerts over time data (replace with real data if available)
  const alertsOverTime = {
    labels: ['2024-06-01', '2024-06-02', '2024-06-03', '2024-06-04', '2024-06-05'],
    datasets: [
      {
        label: 'Alerts',
        data: [2, 5, 3, 6, 4],
        backgroundColor: '#fa58d5',
      },
    ],
  };

  // Pie/Donut chart for risk distribution
  const pieData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          stats?.high_risk_count || 0,
          stats?.medium_risk_count || 0,
          stats?.low_risk_count || 0,
        ],
        backgroundColor: ['#fa58d5', '#facc15', '#38bdf8'],
        borderWidth: 1,
      },
    ],
  };

  // Line chart for risk trends over time
  const lineData = {
    labels: stats?.risk_counts_over_time?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'High',
        data: stats?.risk_counts_over_time?.map((d) => d.high) || [],
        borderColor: '#fa58d5',
        backgroundColor: 'rgba(250,88,213,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Medium',
        data: stats?.risk_counts_over_time?.map((d) => d.medium) || [],
        borderColor: '#facc15',
        backgroundColor: 'rgba(250,204,21,0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Low',
        data: stats?.risk_counts_over_time?.map((d) => d.low) || [],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Bar chart for top vulnerable URLs
  const topUrlsData = {
    labels: stats?.top_vulnerable_urls?.map((d) => d.url) || [],
    datasets: [
      {
        label: 'High Risk Alerts',
        data: stats?.top_vulnerable_urls?.map((d) => d.high_count) || [],
        backgroundColor: '#fa58d5',
      },
    ],
  };

  // Bar chart for scan durations
  const scanDurationData = {
    labels: stats?.scan_durations?.map((d) => d.target_url) || [],
    datasets: [
      {
        label: 'Scan Duration (s)',
        data: stats?.scan_durations?.map((d) => d.duration_seconds) || [],
        backgroundColor: '#38bdf8',
      },
    ],
  };

  return (
    <Layout>
      <div className="min-h-screen flex bg-darkblue font-poppins">
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Metrics</h1>
            <p className="text-gray-400">Visualize scan statistics and risk levels</p>
          </div>

          {isLoading ? (
            <div className="text-accent text-xl">Loading metrics...</div>
          ) : error ? (
            <div className="text-red-400 text-xl">Error loading metrics: {error.message}</div>
          ) : stats ? (
            <>
              {/* Count cards - now medium size and more compact grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 place-items-center">
                <MetricsCard label="Total Scans" value={stats.total_scans} />
                <MetricsCard label="High Risk" value={stats.high_risk_count} />
                <MetricsCard label="Medium Risk" value={stats.medium_risk_count} />
                <MetricsCard label="Low Risk" value={stats.low_risk_count} />
              </div>

              {/* Pie chart for risk levels */}
              <ChartView type="pie" data={pieData} title="Risk Level Distribution" />

              {/* Line chart for risk trends over time */}
              <div className="mt-8">
                <ChartView type="line" data={lineData} title="Risk Trends Over Time (14 days)" options={{
                  responsive: true,
                  plugins: { legend: { labels: { color: '#fff' } } },
                  scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
                }} />
              </div>

              {/* Bar chart for top vulnerable URLs */}
              <div className="mt-8">
                <ChartView type="bar" data={topUrlsData} title="Top Vulnerable URLs (High Risk)" options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
                }} />
              </div>

              {/* Bar chart for scan durations */}
              <div className="mt-8">
                <ChartView type="bar" data={scanDurationData} title="Scan Duration per Target" options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
                }} />
              </div>
            </>
          ) : null}
        </main>
      </div>
    </Layout>
  );
} 