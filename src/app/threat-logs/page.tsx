'use client';
import { useThreatLogs, useScanLogs } from '@/lib/hooks';
import { ThreatLogTable, ThreatLogDetailsModal } from '@/components/ThreatLogTable';
import Layout from '@/components/Layout';
import { useState, useMemo } from 'react';
import { FiBarChart2, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PAGE_SIZE = 10;
const typeOptions = ['All', 'XSS', 'BruteForce', 'Other'];

export default function ThreatLogsPage() {
  const { data: logs, isLoading, error } = useThreatLogs();
  const { data: scanLogs } = useScanLogs();
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [jumpError, setJumpError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const totalLogs = logs || [];
  // Filtering logic
  const filteredLogs = useMemo(() => {
    return totalLogs.filter((log: any) => {
      const matchesSearch = searchTerm
        ? (log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           log.source_ip?.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      const matchesType = typeFilter === 'All' ? true : log.type === typeFilter;
      const matchesDate = dateFilter
        ? new Date(log.timestamp).toISOString().slice(0, 10) === dateFilter
        : true;
      return matchesSearch && matchesType && matchesDate;
    });
  }, [totalLogs, searchTerm, typeFilter, dateFilter]);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Analytics (memoized)
  const stats = useMemo(() => {
    const typeCounts = { XSS: 0, BruteForce: 0, Other: 0 };
    filteredLogs.forEach((log: { type: 'XSS' | 'BruteForce' | 'Other' }) => {
      typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    });
    return {
      total: filteredLogs.length,
      ...typeCounts,
    };
  }, [filteredLogs]);

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

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setDateFilter('');
    setPage(1);
  };

  const pageLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Find related scan log for modal
  const relatedScan = (selectedLog as any) && (selectedLog as any).type === 'XSS' && scanLogs
    ? (scanLogs as any[]).find((scan: any) =>
        scan.description && (selectedLog as any).description && scan.description.includes((selectedLog as any).description.split(' (URL:')[0])
      )
    : undefined;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="min-h-screen flex bg-gradient-to-br from-[#101426] via-[#181c2f] to-[#232946] font-montserrat"
      >
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <FiShield className="text-accent" /> Threat Logs
            </h1>
            <p className="text-gray-400 mb-6">Recent detected security threats</p>
            {/* Animated stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 place-items-center">
              <motion.div
                whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(250,88,213,0.15)' }}
                className="bg-gradient-to-br from-accent/30 to-[#181c2f] rounded-2xl p-6 shadow-2xl flex flex-col items-center border border-white/10 backdrop-blur-xl min-w-[160px] min-h-[120px] transition-all duration-200"
              >
                <FiAlertTriangle className="text-accent w-7 h-7 mb-2 animate-pulse" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.total}
                </motion.div>
                <div className="text-gray-400">Total Threats</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(250,88,213,0.15)' }}
                className="bg-gradient-to-br from-pink-500/30 to-[#181c2f] rounded-2xl p-6 shadow-2xl flex flex-col items-center border border-white/10 backdrop-blur-xl min-w-[160px] min-h-[120px] transition-all duration-200"
              >
                <FiShield className="text-accent w-7 h-7 mb-2" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.XSS}
                </motion.div>
                <div className="text-gray-400">XSS</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(88,203,250,0.15)' }}
                className="bg-gradient-to-br from-blue-500/30 to-[#181c2f] rounded-2xl p-6 shadow-2xl flex flex-col items-center border border-white/10 backdrop-blur-xl min-w-[160px] min-h-[120px] transition-all duration-200"
              >
                <FiBarChart2 className="text-accent w-7 h-7 mb-2" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.BruteForce}
                </motion.div>
                <div className="text-gray-400">BruteForce</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.07, boxShadow: '0 8px 32px 0 rgba(250,213,88,0.15)' }}
                className="bg-gradient-to-br from-yellow-400/30 to-[#181c2f] rounded-2xl p-6 shadow-2xl flex flex-col items-center border border-white/10 backdrop-blur-xl min-w-[160px] min-h-[120px] transition-all duration-200"
              >
                <FiBarChart2 className="text-accent w-7 h-7 mb-2" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  {stats.Other}
                </motion.div>
                <div className="text-gray-400">Other</div>
              </motion.div>
            </div>
            {/* Filter controls */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4 mb-6 items-center bg-white/10 rounded-xl p-4 shadow-xl border border-white/10 backdrop-blur-md"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by description or source IP..."
                className="w-full md:w-64 p-2 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent transition-all duration-200 focus:ring-2 focus:ring-accent"
              />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="p-2 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent transition-all duration-200 focus:ring-2 focus:ring-accent"
              >
                {typeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="p-2 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent transition-all duration-200 focus:ring-2 focus:ring-accent"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
                onClick={clearAllFilters}
                className="px-4 py-2 bg-accent text-darkblue rounded-lg font-bold hover:bg-accent/80 transition-colors focus:ring-2 focus:ring-accent"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          </motion.div>
          {isLoading ? (
            <div className="text-accent text-lg animate-pulse">Loading...</div>
          ) : error ? (
            <div className="text-red-400">Error: {error.message}</div>
          ) : (
            <>
              <ThreatLogTable logs={pageLogs} onRowClick={setSelectedLog} />
              {/* Pagination controls */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-4">
                <div className="flex items-center gap-2 glassy-card rounded-xl px-4 py-2 shadow-2xl border border-white/10 backdrop-blur-xl">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.08 }}
                    onClick={() => canPrev && handlePageChange(page - 1)}
                    disabled={!canPrev}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white font-bold transition-all duration-200 hover:bg-accent/80 hover:text-darkblue disabled:opacity-40 focus:ring-2 focus:ring-accent"
                  >
                    &lt; Prev
                  </motion.button>
                  {pageNumbers.map((num) => (
                    <motion.button
                      key={num}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.08 }}
                      onClick={() => handlePageChange(num)}
                      className={`mx-1 px-3 py-2 rounded-lg font-bold transition-all duration-200 focus:ring-2 focus:ring-accent
                        ${page === num ? 'bg-accent text-darkblue scale-110 shadow-lg' : 'bg-white/10 text-white hover:bg-accent/80 hover:text-darkblue'}`}
                    >
                      {num}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.08 }}
                    onClick={() => canNext && handlePageChange(page + 1)}
                    disabled={!canNext}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white font-bold transition-all duration-200 hover:bg-accent/80 hover:text-darkblue disabled:opacity-40 focus:ring-2 focus:ring-accent"
                  >
                    Next &gt;
                  </motion.button>
                </div>
                {/* Page jump box */}
                <div className="flex items-center gap-2 glassy-card rounded-xl px-4 py-2 shadow-2xl border border-white/10 backdrop-blur-xl">
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPage}
                    onChange={e => setJumpPage(e.target.value)}
                    placeholder="Page #"
                    className="w-20 px-2 py-1 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent text-center transition-all duration-200 focus:ring-2 focus:ring-accent"
                  />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.08 }}
                    onClick={handleJump}
                    className="px-3 py-1 rounded-lg bg-accent text-darkblue font-bold hover:bg-accent/80 transition-colors focus:ring-2 focus:ring-accent"
                  >
                    Go
                  </motion.button>
                  {jumpError && <span className="ml-2 text-red-400 text-sm animate-pulse">{jumpError}</span>}
                </div>
              </div>
              {/* Animated modal for threat details */}
              <ThreatLogDetailsModal log={selectedLog} relatedScan={relatedScan} onClose={() => setSelectedLog(null)} />
            </>
          )}
        </main>
      </motion.div>
    </Layout>
  );
} 