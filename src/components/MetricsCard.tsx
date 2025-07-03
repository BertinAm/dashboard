import React from 'react';
import { motion } from 'framer-motion';

interface MetricsCardProps {
  label: string;
  value: string | number;
}

export default function MetricsCard({ label, value }: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(250,88,213,0.15)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg flex flex-col items-center transition-all duration-300 cursor-pointer hover:bg-white/10 min-w-[120px] min-h-[90px] max-w-[180px] max-h-[120px]"
    >
      <span className="text-gray-400 text-xs mb-1 font-medium tracking-wide">{label}</span>
      <span className="text-2xl font-extrabold text-accent drop-shadow-lg">{value}</span>
    </motion.div>
  );
} 