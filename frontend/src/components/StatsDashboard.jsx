import React from 'react';
import { RefreshCw, TrendingUp, Users, MapPin, UserCheck, UserX, FolderOpen, CheckCircle, AlertCircle } from 'lucide-react';
import useStatistics from '../hooks/useStatistics';

const StatsCard = ({ icon: Icon, title, value, loading, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : value}
          </p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

const StatsDashboard = ({ detailed = false }) => {
  const stats = useStatistics(detailed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {detailed ? 'Detailed Statistics' : 'Dashboard Statistics'}
          </h2>
          <p className="text-gray-600">
            Real-time system statistics {stats.lastUpdated && `(Last updated: ${new Date(stats.lastUpdated).toLocaleTimeString()})`}
          </p>
        </div>
        <button
          onClick={stats.refreshStats}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          disabled={stats.loading}
        >
          <RefreshCw size={16} className={`mr-2 ${stats.loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {stats.error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Failed to fetch live data. Showing fallback values. Error: {stats.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon={TrendingUp}
          title="Active Projects"
          value={`${stats.activeProjects}+`}
          loading={stats.loading}
          color="blue"
        />
        <StatsCard
          icon={MapPin}
          title="Ongoing Projects"
          value={`${stats.ongoingProjects}+`}
          loading={stats.loading}
          color="green"
        />
        <StatsCard
          icon={Users}
          title="Active Users"
          value={`${stats.activeUsers}+`}
          loading={stats.loading}
          color="purple"
        />
      </div>

      {/* Detailed Stats (if enabled) */}
      {detailed && (
        <div className="space-y-6">
          {/* Project Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                icon={FolderOpen}
                title="Total Projects"
                value={stats.totalProjects}
                loading={stats.loading}
                color="indigo"
              />
              <StatsCard
                icon={CheckCircle}
                title="Approved Projects"
                value={stats.approvedProjects}
                loading={stats.loading}
                color="green"
              />
              <StatsCard
                icon={AlertCircle}
                title="Pending Projects"
                value={stats.pendingProjects}
                loading={stats.loading}
                color="orange"
              />
              <StatsCard
                icon={UserX}
                title="Rejected Projects"
                value={stats.rejectedProjects}
                loading={stats.loading}
                color="red"
              />
            </div>
          </div>

          {/* User Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatsCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers}
                loading={stats.loading}
                color="indigo"
              />
              <StatsCard
                icon={UserCheck}
                title="Active Users"
                value={stats.activeUsers}
                loading={stats.loading}
                color="green"
              />
              <StatsCard
                icon={AlertCircle}
                title="Pending Users"
                value={stats.pendingUsers}
                loading={stats.loading}
                color="orange"
              />
            </div>
            
            {/* User Roles Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCard
                icon={Users}
                title="Chief Engineers"
                value={stats.chiefEngineers}
                loading={stats.loading}
                color="purple"
              />
              <StatsCard
                icon={Users}
                title="Project Engineers"
                value={stats.projectEngineers}
                loading={stats.loading}
                color="blue"
              />
              <StatsCard
                icon={Users}
                title="Financial Officers"
                value={stats.financialOfficers}
                loading={stats.loading}
                color="green"
              />
              <StatsCard
                icon={Users}
                title="Land Officers"
                value={stats.landOfficers}
                loading={stats.loading}
                color="orange"
              />
              <StatsCard
                icon={Users}
                title="Landowners"
                value={stats.landowners}
                loading={stats.loading}
                color="indigo"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;
