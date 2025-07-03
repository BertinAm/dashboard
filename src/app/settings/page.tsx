'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiBell, FiSun, FiMoon, FiUsers, FiKey, FiDownload, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useScannerConfig, useUpdateScannerConfig, useResetScannerConfig, useExportLogs } from '@/lib/hooks';
import { Spinner } from '@/components/LogTable';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  // Hooks for backend
  const { data: config, isLoading, error } = useScannerConfig();
  const updateConfig = useUpdateScannerConfig();
  const resetConfig = useResetScannerConfig();
  const exportLogs = useExportLogs();

  // Local state mirrors backend config
  const [scanDepth, setScanDepth] = useState(2);
  const [timeout, setTimeoutValue] = useState(60);
  const [exclusions, setExclusions] = useState('');
  const [toastEnabled, setToastEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Theme state (client only)
  const [darkMode, setDarkMode] = useState(true);
  const [accent, setAccent] = useState('#fa58d5');

  // Sync local state with backend config
  useEffect(() => {
    if (config) {
      setScanDepth(config.scan_depth);
      setTimeoutValue(config.timeout);
      setExclusions(config.exclude_urls);
      setToastEnabled(config.enable_toast);
      setEmailEnabled(config.enable_email);
    }
  }, [config]);

  // Save config to backend
  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({
        scan_depth: scanDepth,
        timeout,
        exclude_urls: exclusions,
        enable_toast: toastEnabled,
        enable_email: emailEnabled,
      });
      toast.success('Settings saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    }
  };

  // Reset config to defaults
  const handleReset = async () => {
    try {
      await resetConfig.mutateAsync();
      toast.success('Settings reset to default!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset settings');
    }
  };

  // Export logs
  const handleExport = async (type: 'csv' | 'json') => {
    try {
      const blob = await exportLogs.mutateAsync(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'csv' ? 'logs.csv' : 'logs.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Logs exported as ${type.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export logs');
    }
  };

  // Placeholder for user management, API keys
  const users = [{ name: 'admin', role: 'Owner' }];
  const apiKeys = [{ key: 'sk-xxxx-xxxx', created: '2024-06-27' }];

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
          <div className="text-red-400 text-xl">Error loading settings: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex bg-darkblue font-montserrat">
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
              <FiSettings className="text-accent" /> Settings
            </h1>

            {/* Scanner Configuration */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-4">Scanner Configuration</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <label className="text-gray-400 font-medium">Scan Depth</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={scanDepth}
                    onChange={e => setScanDepth(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-gray-400 font-medium">Timeout (seconds)</label>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={timeout}
                    onChange={e => setTimeoutValue(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent mt-1"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-gray-400 font-medium">Exclusions (comma-separated URLs)</label>
                <input
                  type="text"
                  value={exclusions}
                  onChange={e => setExclusions(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#101426] border border-[#222b44] text-white focus:outline-none focus:border-accent mt-1"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={updateConfig.status === 'pending'}
                  className="px-6 py-3 bg-accent text-darkblue rounded-xl font-bold text-lg shadow-lg hover:bg-accent/80 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  <FiCheckCircle /> Save
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetConfig.status === 'pending'}
                  className="px-6 py-3 bg-accent text-darkblue rounded-xl font-bold text-lg shadow-lg hover:bg-accent/80 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  <FiRefreshCw /> Reset to Defaults
                </button>
              </div>
            </motion.section>

            {/* Notification Preferences */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiBell className="text-accent" /> Notification Preferences
              </h2>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={toastEnabled}
                    onChange={() => setToastEnabled(v => !v)}
                    className="accent-accent w-5 h-5 rounded"
                  />
                  <span className="text-white">Enable Toast Notifications</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={() => setEmailEnabled(v => !v)}
                    className="accent-accent w-5 h-5 rounded"
                  />
                  <span className="text-white">Enable Email Notifications</span>
                </label>
              </div>
            </motion.section>

            {/* Theme Customization */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiSun className="text-accent" /> Theme Customization
              </h2>
              <div className="flex gap-8 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(v => !v)}
                    className="accent-accent w-5 h-5 rounded"
                  />
                  <span className="text-white">Dark Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-white">Accent Color</span>
                  <input
                    type="color"
                    value={accent}
                    onChange={e => setAccent(e.target.value)}
                    className="w-8 h-8 rounded-full border-2 border-white/20 bg-transparent cursor-pointer"
                  />
                </label>
              </div>
            </motion.section>

            {/* User Management (placeholder) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiUsers className="text-accent" /> User Management
              </h2>
              <div className="text-gray-400">(Multi-user support coming soon)</div>
              <ul className="mt-2">
                {users.map((user, idx) => (
                  <li key={idx} className="text-white font-medium">
                    {user.name} <span className="text-xs text-gray-400">({user.role})</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* API Keys (placeholder) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiKey className="text-accent" /> API Keys
              </h2>
              <div className="text-gray-400">(API key management coming soon)</div>
              <ul className="mt-2">
                {apiKeys.map((key, idx) => (
                  <li key={idx} className="text-white font-mono">
                    {key.key} <span className="text-xs text-gray-400">({key.created})</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Data Export */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiDownload className="text-accent" /> Data Export
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={exportLogs.status === 'pending'}
                  className="px-4 py-2 bg-accent text-darkblue rounded font-bold hover:bg-accent/80 transition-colors disabled:opacity-60"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={exportLogs.status === 'pending'}
                  className="px-4 py-2 bg-accent text-darkblue rounded font-bold hover:bg-accent/80 transition-colors disabled:opacity-60"
                >
                  Export as JSON
                </button>
              </div>
            </motion.section>
          </motion.div>
        </main>
      </div>
    </Layout>
  );
} 