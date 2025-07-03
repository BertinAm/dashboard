"use client";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { motion } from "framer-motion";
import { FiLock } from "react-icons/fi";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export default function UnauthorizedPage() {
  const router = useRouter();
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-darkblue to-[#181c2f] ${montserrat.variable} font-montserrat`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center border border-white/10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg mb-3 animate-pulse">
            <FiLock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">401 Unauthorized</h1>
          <p className="text-gray-300 text-lg text-center">You do not have permission to access this page.<br/>Please log in to continue.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-3 bg-accent text-darkblue rounded-xl font-bold text-lg shadow-lg hover:bg-accent/80 transition-colors"
        >
          Go to Login
        </button>
      </motion.div>
    </div>
  );
} 