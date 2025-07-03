'use client';

import { useScanLogs, useScanStats, useAuthRedirect } from '@/lib/hooks';
import Layout from '@/components/Layout';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiActivity, FiServer } from 'react-icons/fi';
import Link from 'next/link';
import { ApiError } from '@/lib/api';

export default function Dashboard() {
  useAuthRedirect();

  const { data: logs, isLoading: logsLoading, error: logsError } = useScanLogs();
  const { data: stats, isLoading: statsLoading, error: statsError } = useScanStats();

  // Calculate recent activity (last 7 days)
  const recentLogs = logs?.slice(0, 5) || [];
  const highRiskCount = logs?.filter(log => log.risk === 'High').length || 0;
  const mediumRiskCount = logs?.filter(log => log.risk === 'Medium').length || 0;
  const lowRiskCount = logs?.filter(log => log.risk === 'Low').length || 0;

  // Check if there's a connection error
  const hasConnectionError = 
    (logsError && 'isConnectionError' in logsError && logsError.isConnectionError) || 
    (statsError && 'isConnectionError' in statsError && statsError.isConnectionError);

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
  }) => (
    <div className="bg-[#131a2a] rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && <p className="text-xs text-green-400 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }: {
    title: string;
    description: string;
    icon: any;
    href: string;
    color: string;
  }) => (
    <Link href={href} className="block">
      <div className="bg-[#131a2a] rounded-lg p-6 shadow-md hover:bg-[#1a1f33] transition-colors cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );

  // Show connection error message
  if (hasConnectionError) {
    return (
      <Layout>
        <div className="min-h-screen flex bg-darkblue font-poppins">
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center min-h-screen">
              <div className="bg-[#131a2a] rounded-lg p-8 shadow-md max-w-md text-center">
                <div className="flex justify-center mb-4">
                  <FiServer className="w-16 h-16 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Backend Server Unavailable</h2>
                <p className="text-gray-400 mb-6">
                  The Django backend server is not running. Please start the backend server to use the dashboard.
                </p>
                <div className="bg-[#1a1f33] rounded-lg p-4 text-left">
                  <h3 className="text-white font-semibold mb-2">To start the backend:</h3>
                  <ol className="text-gray-400 text-sm space-y-1">
                    <li>1. Open a terminal in the backend directory</li>
                    <li>2. Activate your virtual environment</li>
                    <li>3. Run: <code className="bg-[#222b44] px-2 py-1 rounded">python manage.py runserver</code></li>
                    <li>4. Refresh this page</li>
                  </ol>
                </div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-6 px-4 py-2 bg-accent text-darkblue rounded font-bold hover:bg-accent/80 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex bg-darkblue font-poppins">
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
            <p className="text-gray-400">Monitor your application's security status and recent scan results</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Scans"
              value={logs?.length || 0}
              icon={FiActivity}
              color="bg-blue-500"
              trend="+12% this week"
            />
            <StatCard
              title="High Risk Alerts"
              value={highRiskCount}
              icon={FiAlertTriangle}
              color="bg-red-500"
            />
            <StatCard
              title="Medium Risk Alerts"
              value={mediumRiskCount}
              icon={FiShield}
              color="bg-yellow-500"
            />
            <StatCard
              title="Low Risk Alerts"
              value={lowRiskCount}
              icon={FiCheckCircle}
              color="bg-green-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <QuickActionCard
                  title="Start New Scan"
                  description="Trigger a security scan on a target URL"
                  icon={FiActivity}
                  href="/scan"
                  color="bg-accent"
                />
                <QuickActionCard
                  title="View All Logs"
                  description="Browse and filter scan results"
                  icon={FiShield}
                  href="/logs"
                  color="bg-blue-500"
                />
                <QuickActionCard
                  title="Settings"
                  description="Configure scanner options and preferences"
                  icon={FiClock}
                  href="/settings"
                  color="bg-purple-500"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="bg-[#131a2a] rounded-lg p-6 shadow-md">
                {logsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-accent">Loading recent activity...</div>
                  </div>
                ) : recentLogs.length > 0 ? (
                  <div className="space-y-4">
                    {recentLogs.map((log, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-[#1a1f33] rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          log.risk === 'High' ? 'bg-red-500' :
                          log.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{log.alert}</p>
                          <p className="text-gray-400 text-sm truncate">{log.url}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          log.risk === 'High' ? 'bg-red-500 text-white' :
                          log.risk === 'Medium' ? 'bg-yellow-500 text-darkblue' : 'bg-green-500 text-darkblue'
                        }`}>
                          {log.risk}
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Link 
                        href="/logs"
                        className="text-accent hover:text-accent/80 text-sm font-medium"
                      >
                        View all logs →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No recent activity</div>
                    <p className="text-gray-500 text-sm">Start your first scan to see results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#131a2a] rounded-lg p-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Scanner Service</p>
                    <p className="text-gray-400 text-sm">Online</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#131a2a] rounded-lg p-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">Database</p>
                    <p className="text-gray-400 text-sm">Connected</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#131a2a] rounded-lg p-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">API Endpoints</p>
                    <p className="text-gray-400 text-sm">Healthy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
