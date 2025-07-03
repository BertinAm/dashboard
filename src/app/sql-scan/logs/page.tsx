"use client";
import React, { useEffect, useState } from "react";
import Layout from '@/components/Layout';
import SQLScanTable, { SQLScanLog } from '../SQLScanTable';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInbox, FiDownload } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/threats";
const riskOptions = ['All', 'High', 'Medium', 'Low'];
const PAGE_SIZE = 10;

export default function SQLScanLogsPage() {
  const [logs, setLogs] = useState<SQLScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [jumpError, setJumpError] = useState('');
  const [exporting, setExporting] = useState(false);

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
  }, []);

  // Filter logs client-side
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = searchTerm
      ? log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.param.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesRisk = riskFilter === 'All' ? true : log.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const pagedLogs = filteredLogs;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Pagination window logic
  const windowSize = 10;
  let startPage = Math.max(1, page - Math.floor(windowSize / 2));
  let endPage = startPage + windowSize - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const clearAllFilters = () => {
    setSearchTerm('');
    setRiskFilter('All');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setJumpError('');
  };

  const handleJump = () => {
    const num = Number(jumpPage);
    if (!num || num < 1 || num > totalPages) {
      setJumpError('Not found');
      return;
    }
    setPage(num);
    setJumpError('');
  };

  // Export functionality
  const handleExport = async (type: 'csv' | 'json') => {
    setExporting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_URL}/sql-scan/logs/?export=${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sql_scan_logs.${type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
    setExporting(false);
  };

  if (loading) return <Layout><div className="p-8">Loading SQL scan logs...</div></Layout>;
  if (error) return <Layout><div className="p-8 text-red-500">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">SQL Scan Logs</h1>
            <p className="text-gray-300">Detailed SQL injection scan results with filtering and search capabilities.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-accent text-darkblue rounded-lg font-bold shadow hover:bg-accent/80 transition-colors flex items-center gap-2"
              disabled={exporting}
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-accent text-darkblue rounded-lg font-bold shadow hover:bg-accent/80 transition-colors flex items-center gap-2"
              disabled={exporting}
            >
              <FiDownload className="w-4 h-4" />
              Export JSON
            </button>
            <Link 
              href="/sql-scan" 
              className="px-4 py-2 bg-accent text-darkblue rounded-lg font-bold shadow hover:bg-accent/80 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex-1">
            <SearchWithAutocomplete
              logs={logs.map((l, i) => ({
                id: i,
                url: l.url,
                description: l.description,
                alert: l.param,
                risk: l.risk || '',
                solution: '',
                created_at: l.timestamp,
                updated_at: l.timestamp,
              }))}
              onSearch={setSearchTerm}
              placeholder="Search by URL, param, or description..."
              className="w-full"
            />
          </div>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="p-2 rounded bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent"
          >
            {riskOptions.map(risk => (
              <option key={risk} value={risk}>{risk}</option>
            ))}
          </select>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-accent text-darkblue rounded font-bold hover:bg-accent/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <motion.div
          key={page}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl">
            <SQLScanTable logs={pagedLogs} />
          </div>
        </motion.div>

        {/* Pagination controls */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
          <div className="flex items-center gap-2 glassy-card rounded-xl px-4 py-2 shadow-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => canPrev && handlePageChange(page - 1)}
              disabled={!canPrev}
              className="px-3 py-2 rounded-lg bg-white/10 text-white font-bold transition-all duration-200 hover:bg-accent/80 hover:text-darkblue disabled:opacity-40 focus:ring-2 focus:ring-accent"
            >
              &lt; Prev
            </button>
            {pageNumbers.map((num) => (
              <motion.button
                key={num}
                onClick={() => handlePageChange(num)}
                className={`mx-1 px-3 py-2 rounded-lg font-bold transition-all duration-200 focus:ring-2 focus:ring-accent
                  ${page === num ? 'bg-accent text-darkblue scale-110 shadow-lg' : 'bg-white/10 text-white hover:bg-accent/80 hover:text-darkblue'}`}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
              >
                {num}
              </motion.button>
            ))}
            <button
              onClick={() => canNext && handlePageChange(page + 1)}
              disabled={!canNext}
              className="px-3 py-2 rounded-lg bg-white/10 text-white font-bold transition-all duration-200 hover:bg-accent/80 hover:text-darkblue disabled:opacity-40 focus:ring-2 focus:ring-accent"
            >
              Next &gt;
            </button>
          </div>
          {/* Page jump box */}
          <div className="flex items-center gap-2 glassy-card rounded-xl px-4 py-2 shadow-xl border border-white/10 backdrop-blur-md">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={e => setJumpPage(e.target.value)}
              placeholder="Page #"
              className="w-20 px-2 py-1 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent text-center"
            />
            <button
              onClick={handleJump}
              className="px-3 py-1 rounded-lg bg-accent text-darkblue font-bold hover:bg-accent/80 transition-colors focus:ring-2 focus:ring-accent"
            >
              Go
            </button>
            {jumpError && <span className="ml-2 text-red-400 text-sm animate-pulse">{jumpError}</span>}
          </div>
        </div>

        {/* Empty state with animated icon */}
        {!loading && filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-4"
            >
              <FiInbox className="w-16 h-16 text-accent animate-bounce" />
            </motion.div>
            <div className="text-gray-400 text-xl mb-2">No SQL scan logs found</div>
            <p className="text-gray-500">Try adjusting your filters or start a new SQL injection scan</p>
          </div>
        )}
      </div>
    </Layout>
  );
} 