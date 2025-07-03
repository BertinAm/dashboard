'use client';

import { useState } from 'react';
import { useScanLogs } from '@/lib/hooks';
import Layout from '@/components/Layout';
import LogTable, { type LogEntry, Spinner } from '@/components/LogTable';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';
import { AnimatePresence, motion } from 'framer-motion';
import { FiInbox } from 'react-icons/fi';

const riskOptions = ['All', 'High', 'Medium', 'Low'];
const PAGE_SIZE = 10;

export default function LogsPage() {
  const { data: logs, isLoading, error } = useScanLogs();
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('');
  const [jumpError, setJumpError] = useState('');

  const handleRowClick = (log: LogEntry) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  // Filter logs client-side
  const filteredLogs = (logs || []).filter((log) => {
    const matchesSearch = searchTerm
      ? log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.alert.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const matchesRisk = riskFilter === 'All' ? true : log.risk === riskFilter;
    const matchesDate = dateFilter
      ? new Date(log.created_at).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchesSearch && matchesRisk && matchesDate;
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
    setDateFilter('');
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-400 text-xl">Error loading logs: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex bg-darkblue font-montserrat">
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">XSS Scan Logs</h1>
            <p className="text-gray-400">Monitor and review security scan results</p>
          </div>

          {/* Filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div className="flex-1">
              <SearchWithAutocomplete
                logs={logs || []}
                onSearch={setSearchTerm}
                placeholder="Search by URL, alert name, or description..."
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
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="p-2 rounded bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent"
            />
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
            <LogTable logs={pagedLogs} page={page} pageSize={PAGE_SIZE} loading={isLoading} />
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
          {!isLoading && filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-4"
              >
                <FiInbox className="w-16 h-16 text-accent animate-bounce" />
              </motion.div>
              <div className="text-gray-400 text-xl mb-2">No scan logs found</div>
              <p className="text-gray-500">Try adjusting your filters or start a new scan</p>
            </div>
          )}
        </main>

        {/* Modal for detailed log view */}
        <AnimatePresence>
          {isModalOpen && selectedLog && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-[#131a2a] rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-white/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedLog.alert}</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-white text-2xl transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Risk Level</label>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      selectedLog.risk === 'High'
                        ? 'bg-accent text-darkblue'
                        : selectedLog.risk === 'Medium'
                        ? 'bg-yellow-500 text-darkblue'
                        : 'bg-green-500 text-darkblue'
                    }`}>
                      {selectedLog.risk}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Affected URL</label>
                    <p className="text-white break-all">{selectedLog.url}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Description</label>
                    <p className="text-white">{selectedLog.description}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Solution</label>
                    <p className="text-white">{selectedLog.solution}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Timestamp</label>
                    <p className="text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-accent text-darkblue rounded hover:bg-accent/80 transition-colors font-bold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
} 