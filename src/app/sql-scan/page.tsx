"use client";
import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import Layout from '@/components/Layout';
import MetricsCard from '@/components/MetricsCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/threats";

interface SQLScanLog {
  id: number;
  url: string;
  param: string;
  description: string;
  risk: string;
  timestamp: string;
}

export default function SQLScanResultsPage() {
  const [logs, setLogs] = useState<SQLScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanUrl, setScanUrl] = useState("");
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanId, setScanId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    fetch(`${API_URL}/sql-scan/logs/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch SQL scan logs");
        return res.json();
      })
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [scanStatus]);

  // Poll for scan progress
  useEffect(() => {
    if (!scanId || !isScanning) return;

    const interval = setInterval(async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const res = await fetch(`${API_URL}/sql-scan/status/${scanId}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setScanProgress(data.total_progress);
          setScanStatus(data.status);
          
          if (data.status === 'complete' || data.status === 'failed') {
            setIsScanning(false);
            setScanId(null);
            if (data.status === 'complete') {
              setScanStatus('Scan completed successfully!');
            } else {
              setScanStatus(`Scan failed: ${data.error_message}`);
            }
          }
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scanId, isScanning]);

  // Metrics
  const total = logs.length;
  const high = logs.filter(l => l.risk === 'High').length;
  const medium = logs.filter(l => l.risk === 'Medium').length;
  const low = logs.filter(l => l.risk === 'Low').length;
  const today = logs.filter(l => l.timestamp.split('T')[0] === new Date().toISOString().split('T')[0]).length;

  // Pie chart: risk levels
  const riskCounts = { High: high, Medium: medium, Low: low };

  // Bar chart: vulnerabilities by URL
  const urlCounts: Record<string, number> = {};
  logs.forEach(l => {
    urlCounts[l.url] = (urlCounts[l.url] || 0) + 1;
  });

  // Scan trigger
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanStatus(null);
    setScanProgress(0);
    if (!scanUrl) return;
    
    setIsScanning(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_URL}/sql-scan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: scanUrl }),
      });
      if (!res.ok) throw new Error('Failed to start scan');
      const data = await res.json();
      setScanId(data.scan_id);
      setScanStatus('Scan started — monitoring progress...');
      setScanUrl("");
    } catch (err: any) {
      setScanStatus('Failed to start scan: ' + err.message);
      setIsScanning(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Title & Overview */}
        <h1 className="text-3xl font-bold mb-2">SQL Injection Scan Results</h1>
        <p className="text-gray-300 mb-6 max-w-2xl">
          This page shows the results of SQL Injection vulnerability scans run against target URLs. Each entry includes details such as risk level, affected parameters, and the time of detection.
        </p>

        {/* Metrics & Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <MetricsCard label="Total SQL Vulnerabilities" value={total} />
          <MetricsCard label="High Risk" value={high} />
          <MetricsCard label="Medium Risk" value={medium} />
          <MetricsCard label="Low Risk" value={low} />
          <MetricsCard label="Scans Run Today" value={today} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className="font-semibold mb-2">Risk Level Breakdown</h2>
            <Pie
              data={{
                labels: Object.keys(riskCounts),
                datasets: [
                  {
                    label: "Risk Level",
                    data: Object.values(riskCounts),
                    backgroundColor: ["#f87171", "#fbbf24", "#34d399"],
                  },
                ],
              }}
              options={{ responsive: true }}
            />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className="font-semibold mb-2">Vulnerabilities by Target URL</h2>
            <Bar
              data={{
                labels: Object.keys(urlCounts),
                datasets: [
                  {
                    label: "SQLi Count",
                    data: Object.values(urlCounts),
                    backgroundColor: "#60a5fa",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Scan Trigger Section */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl max-w-2xl">
          <h2 className="font-semibold mb-2">Trigger New SQL Injection Scan</h2>
          <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="url"
              value={scanUrl}
              onChange={e => setScanUrl(e.target.value)}
              placeholder="Enter target URL (e.g. http://example.com)"
              className="p-2 rounded border bg-[#101426] text-white border-[#222b44] flex-1"
              required
              disabled={isScanning}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-darkblue rounded-xl font-bold shadow hover:bg-accent/80 transition-colors disabled:opacity-50"
              disabled={!scanUrl || isScanning}
            >
              {isScanning ? 'Scanning...' : 'Scan for SQL Injection'}
            </button>
          </form>
          
          {/* Progress Bar */}
          {isScanning && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Scan Progress</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {scanStatus && (
            <div className="mt-2 text-sm text-accent">{scanStatus}</div>
          )}
        </div>

        {/* Security Recommendations */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl max-w-2xl mx-auto">
          <h2 className="font-semibold mb-2">Security Recommendations</h2>
          <ul className="list-disc pl-6 text-gray-200 space-y-1">
            <li>Use parameterized queries (Prepared Statements)</li>
            <li>Validate and sanitize all user inputs</li>
            <li>Avoid dynamic SQL where possible</li>
            <li>Use ORM methods instead of raw SQL</li>
            <li>Regularly scan and monitor for vulnerabilities</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
} 