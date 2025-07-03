import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye } from 'react-icons/fi';

export function ThreatLogDetailsModal({ log, relatedScan, onClose }: { log: any, relatedScan?: any, onClose: () => void }) {
  if (!log) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-[#181c2f] rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-white/10 relative"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl">×</button>
          <h2 className="text-2xl font-bold text-accent mb-4">Threat Details</h2>
          <div className="space-y-3">
            <div><span className="font-semibold text-gray-400">Type:</span> <span className="text-white">{log.type}</span></div>
            <div><span className="font-semibold text-gray-400">Source IP:</span> <span className="text-blue-300">{log.source_ip}</span></div>
            <div><span className="font-semibold text-gray-400">Description:</span> <span className="text-white">{log.description}</span></div>
            <div><span className="font-semibold text-gray-400">Timestamp:</span> <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span></div>
            {/* Show related scan/log info if available */}
            {log.type === 'XSS' && relatedScan && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-accent font-bold mb-2">Related XSS Scan Log</div>
                <div><span className="font-semibold text-gray-400">Alert:</span> <span className="text-white">{relatedScan.alert}</span></div>
                <div><span className="font-semibold text-gray-400">Risk:</span> <span className="text-white">{relatedScan.risk}</span></div>
                <div><span className="font-semibold text-gray-400">URL:</span> <span className="text-blue-300">{relatedScan.url}</span></div>
                <div><span className="font-semibold text-gray-400">Description:</span> <span className="text-white">{relatedScan.description}</span></div>
                <div><span className="font-semibold text-gray-400">Solution:</span> <span className="text-white">{relatedScan.solution}</span></div>
                <div><span className="font-semibold text-gray-400">Timestamp:</span> <span className="text-gray-400">{new Date(relatedScan.timestamp).toLocaleString()}</span></div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ThreatLogTable({ logs, onRowClick }: { logs: any[], onRowClick: (log: any) => void }) {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mb-4"
        >
          <svg className="w-16 h-16 text-accent animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </motion.div>
        <div className="text-gray-400 text-xl mb-2">No threat logs found</div>
        <p className="text-gray-500">All clear! No threats detected yet.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white/5 backdrop-blur-md border border-white/10">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#101426]/80 text-gray-300">
          <tr>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Source IP</th>
            <th className="px-4 py-3 font-semibold">Description</th>
            <th className="px-4 py-3 font-semibold">Timestamp</th>
            <th className="px-4 py-3 font-semibold text-center">View</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {logs.map(log => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(250,88,213,0.07)' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="border-b border-[#1a1f33]/60 transition-all duration-200 hover:bg-accent/10"
              >
                <td className="px-4 py-3 font-medium text-white max-w-[120px] truncate">{log.type}</td>
                <td className="px-4 py-3 text-blue-300 max-w-[140px] truncate">{log.source_ip}</td>
                <td className="px-4 py-3 text-gray-300 max-w-[240px] truncate">{log.description}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={e => { e.stopPropagation(); onRowClick(log); }}
                    className="inline-flex items-center justify-center p-2 rounded-full bg-accent/20 hover:bg-accent/40 transition-colors"
                    title="View details"
                  >
                    <FiEye className="w-5 h-5 text-accent" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
} 