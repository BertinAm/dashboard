import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LogEntry {
  id: number;
  alert: string;
  risk: string;
  url: string;
  description: string;
  solution: string;
  created_at: string;
}

interface LogTableProps {
  logs: LogEntry[];
  page: number;
  pageSize: number;
  loading?: boolean;
}

export function Spinner() {
  return (
    <motion.div
      className="flex justify-center items-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg className="animate-spin h-10 w-10 text-accent" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </motion.div>
  );
}

export default function LogTable({ logs, page, pageSize, loading }: LogTableProps) {
  // Calculate logs for current page
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageLogs = logs.slice(startIdx, endIdx);

  return (
    <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white/5 backdrop-blur-md border border-white/10">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#101426]/80 text-gray-300">
          <tr>
            <th className="px-4 py-3 font-semibold">Alert</th>
            <th className="px-4 py-3 font-semibold">Risk</th>
            <th className="px-4 py-3 font-semibold">URL</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Solution</th>
            <th className="px-4 py-3 font-semibold">Date</th>
          </tr>
        </thead>
        <AnimatePresence initial={false}>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Spinner />
                </td>
              </tr>
            ) : pageLogs.length > 0 ? (
              pageLogs.map((log) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(250,88,213,0.07)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="border-b border-[#1a1f33]/60 transition-all duration-200 cursor-pointer hover:bg-accent/10"
                >
                  <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">{log.alert}</td>
                  <td className={`px-4 py-3 font-bold ${
                    log.risk === 'High'
                      ? 'text-accent'
                      : log.risk === 'Low'
                      ? 'text-darkblue bg-accent/20'
                      : 'text-yellow-400'
                  }`}>
                    {log.risk}
                  </td>
                  <td className="px-4 py-3 truncate max-w-[180px] text-blue-300 hover:underline">{log.url}</td>
                  <td className="px-4 py-3 truncate max-w-[180px] text-gray-300">{log.description}</td>
                  <td className="px-4 py-3 truncate max-w-[180px] text-gray-300">{log.solution}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">No logs found for this page.</td>
              </tr>
            )}
          </tbody>
        </AnimatePresence>
      </table>
    </div>
  );
} 