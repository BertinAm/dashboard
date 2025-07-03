'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTriggerScan, useScanStatus } from '@/lib/hooks';
import Layout from '@/components/Layout';
import { toast } from 'react-toastify';
import { Montserrat } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});

export default function ScanPage() {
  const [url, setUrl] = useState('');
  const [scanId, setScanId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const triggerScan = useTriggerScan();
  const { data: scanStatus, isLoading: statusLoading, error: statusError } = useScanStatus(scanId || undefined);

  // Start polling after scan is triggered
  useEffect(() => {
    console.log('DEBUG: scanStatus from backend:', scanStatus);
    if (scanStatus && scanStatus.status === 'complete') {
      setStatus('success');
      toast.success('Scan complete! Redirecting to logs...');
      setTimeout(() => router.push('/logs'), 1500);
    } else if (scanStatus && scanStatus.status === 'failed') {
      setStatus('error');
      setErrorMsg(scanStatus.error_message || 'Scan failed.');
      toast.error(scanStatus.error_message || 'Scan failed.');
    }
  }, [scanStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('scanning');
    setErrorMsg('');
    toast.info('Scan started!');
    try {
      const res = await triggerScan.mutateAsync(url);
      setScanId(res.scan_id!);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to trigger scan');
      toast.error(err.message || 'Failed to trigger scan');
    }
  };

  const progress = scanStatus?.total_progress ?? 0;
  const progressLabel = scanStatus?.status === 'complete' ? 'Completed' : scanStatus?.status === 'failed' ? 'Failed' : 'Scanning...';

  return (
    <Layout>
      <div className={`min-h-screen flex bg-darkblue ${montserrat.variable} font-montserrat`}>
        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-[#131a2a] rounded-2xl p-10 shadow-2xl w-full max-w-lg relative overflow-hidden"
          >
            <h1 className="text-3xl font-extrabold text-white mb-6 tracking-tight">Trigger New Scan</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <label className="text-gray-400 font-medium">Target URL</label>
              <motion.input
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="p-4 rounded-xl bg-[#101426] border-2 border-[#222b44] text-white focus:outline-none focus:border-accent transition-all duration-200 shadow-sm"
                disabled={status === 'scanning' || !!scanId}
                whileFocus={{ scale: 1.03 }}
              />
              <motion.button
                type="submit"
                className="mt-2 px-6 py-3 bg-accent text-darkblue rounded-xl font-bold text-lg shadow-lg hover:bg-accent/80 transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
                disabled={status === 'scanning' || !!scanId}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.03 }}
              >
                {status === 'scanning' || !!scanId ? 'Scanning...' : 'Start Scan'}
              </motion.button>
            </form>

            {/* Progress bar with animation */}
            <AnimatePresence>
              {(status === 'scanning' || !!scanId) && (
                <motion.div
                  key="progress-bar"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-10"
                >
                  <div className="w-full bg-[#222b44] rounded-full h-5 overflow-hidden shadow-inner">
                    <motion.div
                      className="bg-accent h-5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="text-accent mt-3 text-center text-lg font-semibold animate-pulse">
                    {progressLabel} {progress}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message */}
            <AnimatePresence>
              {status === 'success' && (
                <motion.div
                  key="success-msg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 text-green-400 text-center font-bold text-lg"
                >
                  Scan complete! Redirecting to logs...
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {status === 'error' && (
                <motion.div
                  key="error-msg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 text-red-400 text-center font-bold text-lg"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </Layout>
  );
} 