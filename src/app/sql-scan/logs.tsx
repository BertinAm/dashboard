import Layout from '@/components/Layout';
import React from 'react';

// Example log data (replace with real data source or props)
const scanLogs = [
  { timestamp: '2025-06-27T17:12:44', message: 'Started scan on http://testphp.vulnweb.com' },
  { timestamp: '2025-06-27T17:12:45', message: 'SQL Injection detected on param `id`' },
  { timestamp: '2025-06-27T17:12:46', message: 'Scan finished' },
];

export default function SQLScanLogsPage() {
  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">SQL Scan Execution Logs</h1>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl max-w-2xl mx-auto">
          <ul className="space-y-2">
            {scanLogs.map((log, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-200">
                <span className="text-xs text-gray-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span>{log.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
} 