"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Link from "next/link";
import { register } from '@/lib/api';
import { FiShield, FiUser, FiLock } from "react-icons/fi";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(username, password);
      toast.success("Registration successful! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Registration failed");
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
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shadow-lg mb-3 animate-pulse">
            <FiShield className="text-darkblue w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Register</h1>
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
            {loading ? "Registering..." : "Register"}
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
          <Link href="/login" className="text-accent font-semibold hover:underline">Already have an account? Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
} 