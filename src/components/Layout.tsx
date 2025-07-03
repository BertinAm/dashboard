import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-darkblue font-poppins flex">
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-30">
        <Sidebar />
      </aside>
      <main className="flex-1 ml-0 md:ml-64 min-h-screen">{children}</main>
    </div>
  );
} 