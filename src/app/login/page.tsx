"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";
import { login, getAccessToken } from '@/lib/api';
import { FiShield, FiLock, FiUser, FiKey } from "react-icons/fi";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

function isTokenValid(token: string | null) {
  if (!token) return false;
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const unauth = searchParams.get('unauth');

  useEffect(() => {
    // If already logged in and token is valid, redirect to dashboard
    const token = getAccessToken();
    if (isTokenValid(token)) {
      router.replace("/");
    } else if (token) {
      // If token is expired, clear it
      Cookies.remove('access_token', { path: '/' });
      localStorage.removeItem('access_token');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      toast.success("Login successful!");
      if (data.access) {
        Cookies.set('access_token', data.access, { path: '/', sameSite: 'strict' });
      }
      setTimeout(() => {
        router.replace("/");
      }, 200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-darkblue to-[#181c2f] ${montserrat.variable} font-montserrat`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center border border-white/10"
      >
        {unauth && (
          <div className="mb-4 w-full text-center bg-red-500/20 text-red-300 font-bold rounded-lg py-2 px-4">
            You must log in to access this page.
          </div>
        )}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg mb-3 animate-pulse">
            <FiShield className="text-darkblue w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Sign In</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-accent w-5 h-5" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="pl-10 p-4 rounded-xl bg-[#101426] border-2 border-[#222b44] text-white focus:outline-none focus:border-accent transition-all duration-200 shadow-sm w-full"
              required
              autoFocus
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-accent w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 p-4 rounded-xl bg-[#101426] border-2 border-[#222b44] text-white focus:outline-none focus:border-accent transition-all duration-200 shadow-sm w-full"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="mt-2 px-6 py-3 bg-accent text-darkblue rounded-xl font-bold text-lg shadow-lg hover:bg-accent/80 transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>
        </form>
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 text-red-400 text-center font-bold text-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-col items-center gap-2 mt-8 w-full">
          <Link href="/register" className="text-accent font-semibold hover:underline">Don't have an account? Register</Link>
          <Link href="/reset-password" className="text-accent font-semibold hover:underline flex items-center gap-1"><FiKey /> Forgot password?</Link>
        </div>
      </motion.div>
    </div>
  );
}
