import React, { useState } from 'react';
import SearchWithAutocomplete from '@/components/SearchWithAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiX, FiExternalLink, FiAlertTriangle, FiClock, FiGlobe } from 'react-icons/fi';

export interface SQLScanLog {
  timestamp: string;
  url: string;
  param: string;
  risk: string;
  description: string;
}

interface SQLScanTableProps {
  logs: SQLScanLog[];
}

const riskLevels = ['High', 'Medium', 'Low'];

export default function SQLScanTable({ logs }: SQLScanTableProps) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [urlFilter, setUrlFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<SQLScanLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 10;

  // Filter and search
  const filteredLogs = logs.filter(log => {
    const matchesRisk = riskFilter ? log.risk === riskFilter : true;
    const matchesUrl = urlFilter ? log.url.includes(urlFilter) : true;
    const matchesSearch = search
      ? log.url.toLowerCase().includes(search.toLowerCase()) ||
        log.param.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesRisk && matchesUrl && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const pageLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const handleViewDetails = (log: SQLScanLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white/5 backdrop-blur-md border border-white/10">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#101426]/80 text-gray-300">
            <tr>
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">URL</th>
              <th className="px-4 py-3 font-semibold">Parameter</th>
              <th className="px-4 py-3 font-semibold">Risk</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageLogs.length > 0 ? (
              pageLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-[#1a1f33]/60 transition-all duration-200 hover:bg-accent/10">
                  <td className="px-4 py-3">{(page - 1) * pageSize + idx + 1}</td>
                  <td className="px-4 py-3 text-blue-300 max-w-[180px] truncate">{log.url}</td>
                  <td className="px-4 py-3">{log.param}</td>
                  <td className={`px-4 py-3 font-bold ${
                    log.risk === 'High'
                      ? 'text-accent'
                      : log.risk === 'Low'
                      ? 'text-darkblue bg-accent/20'
                      : 'text-yellow-400'
                  }`}>{log.risk}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-[240px] truncate">{log.description}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="px-3 py-1 bg-accent text-darkblue rounded-lg font-bold hover:bg-accent/80 transition-colors flex items-center gap-1 text-xs"
                    >
                      <FiEye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No logs found for this page.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f1426] border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getRiskColor(selectedLog.risk)}`}>
                    <span className="text-2xl">{getRiskIcon(selectedLog.risk)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">SQL Injection Vulnerability</h2>
                    <p className="text-gray-400">Detailed scan result information</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Risk Level */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FiAlertTriangle className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold text-white">Risk Assessment</h3>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getRiskColor(selectedLog.risk)}`}>
                      <span className="text-lg">{getRiskIcon(selectedLog.risk)}</span>
                      <span className="font-bold">{selectedLog.risk} Risk</span>
                    </div>
                    <p className="text-gray-300 mt-2 text-sm">
                      {selectedLog.risk === 'High' && 'Critical vulnerability requiring immediate attention'}
                      {selectedLog.risk === 'Medium' && 'Moderate risk that should be addressed soon'}
                      {selectedLog.risk === 'Low' && 'Low priority issue that should be monitored'}
                    </p>
                  </div>

                  {/* Target URL */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FiGlobe className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Target URL</h3>
                    </div>
                    <div className="bg-[#101426] border border-[#222b44] rounded-lg p-3">
                      <p className="text-blue-300 break-all">{selectedLog.url}</p>
                    </div>
                    <a
                      href={selectedLog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:text-accent/80 text-sm mt-2 transition-colors"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      Open URL
                    </a>
                  </div>

                  {/* Timestamp */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FiClock className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-white">Detection Time</h3>
                    </div>
                    <p className="text-gray-300">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(selectedLog.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Vulnerable Parameter */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">Vulnerable Parameter</h3>
                    <div className="bg-[#101426] border border-[#222b44] rounded-lg p-3">
                      <code className="text-red-400 font-mono text-sm">{selectedLog.param}</code>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      This parameter is susceptible to SQL injection attacks
                    </p>
                  </div>

                  {/* Description */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">Vulnerability Description</h3>
                    <div className="bg-[#101426] border border-[#222b44] rounded-lg p-3">
                      <p className="text-gray-300 leading-relaxed">{selectedLog.description}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">Security Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span className="text-gray-300">Use parameterized queries (prepared statements)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span className="text-gray-300">Validate and sanitize all user inputs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span className="text-gray-300">Implement input validation on both client and server side</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span className="text-gray-300">Use ORM methods instead of raw SQL queries</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Copy details to clipboard
                    const details = `SQL Injection Vulnerability\nRisk: ${selectedLog.risk}\nURL: ${selectedLog.url}\nParameter: ${selectedLog.param}\nDescription: ${selectedLog.description}\nTimestamp: ${new Date(selectedLog.timestamp).toLocaleString()}`;
                    navigator.clipboard.writeText(details);
                  }}
                  className="px-4 py-2 bg-accent text-darkblue rounded-lg font-bold hover:bg-accent/80 transition-colors"
                >
                  Copy Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 