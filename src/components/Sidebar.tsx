import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHome, FiPlayCircle, FiList, FiBarChart2, FiSettings, FiShield, FiLogOut, FiAlertTriangle, FiDatabase, FiFileText } from 'react-icons/fi';
import { clearTokens } from '@/lib/api';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const navLinks = [
  { href: '/', label: 'Dashboard Overview', icon: FiHome },
  { href: '/scan', label: 'Scan New Site', icon: FiPlayCircle },
  { href: '/logs', label: 'Logs', icon: FiList },
  { href: '/threat-logs', label: 'Threat Logs', icon: FiAlertTriangle },
  { href: '/sql-scan', label: 'SQL Scan Results', icon: FiDatabase },
  { href: '/sql-scan/logs', label: 'SQL Scan Logs', icon: FiFileText },
  { href: '/metrics', label: 'Metrics', icon: FiBarChart2 },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for access_token in cookies or localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token') || document.cookie.includes('access_token');
      setIsAuthenticated(!!token);
    }
  }, []);

  if (!isAuthenticated) return null;

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-full flex flex-col justify-between bg-gradient-to-b from-[#101426]/90 to-[#181c2f]/90 backdrop-blur-xl border-r border-[#1a1f33] rounded-r-3xl shadow-2xl p-4"
    >
      <div>
        {/* Logo/avatar */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg animate-pulse">
            <FiShield className="text-darkblue w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-accent tracking-tight">Fortress</span>
        </div>
        <nav className="flex flex-col gap-3">
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07, duration: 0.4, ease: 'easeOut' }}
            >
              <Link
                href={link.href}
                className={`px-4 py-2 rounded-xl text-white font-semibold transition-all duration-200 flex items-center gap-3
                  ${pathname === link.href
                    ? 'bg-accent text-darkblue shadow-lg scale-105'
                    : 'hover:bg-accent/80 hover:text-darkblue hover:scale-105'}
                `}
              >
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: pathname === link.href ? 1.2 : 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center"
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                </motion.span>
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
      {/* Bottom section */}
      <div className="mt-10 px-2 text-xs text-gray-500 text-center">
        <div className="mb-2">© {new Date().getFullYear()} Fortress Monitor</div>
        <div>Securing your web presence</div>
        <button
          onClick={() => { 
            clearTokens(); 
            Cookies.remove('access_token', { path: '/' });
            Cookies.remove('refresh_token', { path: '/' });
            router.push('/login'); 
          }}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent text-darkblue rounded-lg font-bold shadow hover:bg-accent/80 transition-colors w-full justify-center"
        >
          <FiLogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </motion.aside>
  );
} 